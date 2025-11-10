import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { hashPassword, verifyPassword } from '@/utils/password';
import { CreateUserDto, UpdateUserDto, UserResponse } from '@vetdesk/shared/types/user';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted?: boolean): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany({
      where: includeDeleted
        ? { deletedAt: { not: null } }
        : { deletedAt: null },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    }));
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new BadRequestException(
        `${fieldName} deve ter entre ${min} e ${max} caracteres`,
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const firstName = createUserDto.firstName.trim();
    const lastName = createUserDto.lastName.trim();
    const email = createUserDto.email.trim().toLowerCase();
    const password = createUserDto.password.trim();

    if (!firstName) {
      throw new BadRequestException('Nome é obrigatório');
    }

    if (!lastName) {
      throw new BadRequestException('Sobrenome é obrigatório');
    }

    if (!email) {
      throw new BadRequestException('E-mail é obrigatório');
    }

    if (!password) {
      throw new BadRequestException('Senha é obrigatória');
    }

    if (!createUserDto.passwordConfirmation) {
      throw new BadRequestException('Confirmação de senha é obrigatória');
    }

    if (password !== createUserDto.passwordConfirmation.trim()) {
      throw new BadRequestException('A senha e a confirmação não coincidem');
    }

    if (!this.validateEmail(createUserDto.email)) {
      throw new BadRequestException('Formato de e-mail inválido');
    }

    this.validateStringLength(createUserDto.firstName.trim(), 1, 100, 'Nome');
    this.validateStringLength(createUserDto.lastName.trim(), 1, 100, 'Sobrenome');
    this.validateStringLength(createUserDto.password, 8, 100, 'Senha');

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email.trim().toLowerCase(),
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new ConflictException('E-mail já existe');
    }

    const hashedPassword = await hashPassword(createUserDto.password);

    const user = await this.prisma.user.create({
      data: {
        firstName: createUserDto.firstName.trim(),
        lastName: createUserDto.lastName.trim(),
        email: createUserDto.email.trim().toLowerCase(),
        password: hashedPassword,
        avatarUrl: createUserDto.avatarUrl || null,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }

    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.deletedAt) {
      throw new BadRequestException('Não é possível atualizar um usuário excluído');
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      avatarUrl?: string | null;
    } = {};

    if (Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('Pelo menos um campo deve ser fornecido para atualização');
    }

    if (updateUserDto.firstName !== undefined) {
      const firstName = updateUserDto.firstName.trim();
      if (!firstName) {
        throw new BadRequestException('Nome não pode estar vazio');
      }
      this.validateStringLength(firstName, 1, 100, 'Nome');
      updateData.firstName = firstName;
    }

    if (updateUserDto.lastName !== undefined) {
      const lastName = updateUserDto.lastName.trim();
      if (!lastName) {
        throw new BadRequestException('Sobrenome não pode estar vazio');
      }
      this.validateStringLength(lastName, 1, 100, 'Sobrenome');
      updateData.lastName = lastName;
    }

    if (updateUserDto.email !== undefined) {
      const email = updateUserDto.email.trim().toLowerCase();
      if (!email) {
        throw new BadRequestException('E-mail não pode estar vazio');
      }
      if (!this.validateEmail(email)) {
        throw new BadRequestException('Formato de e-mail inválido');
      }

      const existingUser = await this.prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('E-mail já existe');
      }

      updateData.email = email;
    }

    if (updateUserDto.password !== undefined) {
      const password = updateUserDto.password.trim();
      if (!password) {
        throw new BadRequestException('Senha não pode estar vazia');
      }

      if (!updateUserDto.oldPassword) {
        throw new BadRequestException('Senha antiga é obrigatória ao atualizar a senha');
      }

      if (!updateUserDto.passwordConfirmation) {
        throw new BadRequestException('Confirmação de senha é obrigatória ao atualizar a senha');
      }

      if (password !== updateUserDto.passwordConfirmation.trim()) {
        throw new BadRequestException('A senha e a confirmação não coincidem');
      }

      const isOldPasswordValid = await verifyPassword(updateUserDto.oldPassword.trim(), user.password);
      if (!isOldPasswordValid) {
        throw new BadRequestException('Senha antiga está incorreta');
      }

      this.validateStringLength(password, 8, 100, 'Senha');
      updateData.password = await hashPassword(password);
    }

    if (updateUserDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateUserDto.avatarUrl || null;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    };
  }

  async delete(id: string, currentUserId: string): Promise<{ message: string }> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }

    if (id === currentUserId) {
      throw new BadRequestException('Não é possível excluir sua própria conta');
    }

    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.deletedAt) {
      throw new BadRequestException('Usuário já está excluído');
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Usuário excluído com sucesso' };
  }

  async restore(id: string): Promise<UserResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID do usuário é obrigatório');
    }

    const user = await this.prisma.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.deletedAt) {
      throw new BadRequestException('Usuário não está excluído');
    }

    const restoredUser = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });

    return {
      id: restoredUser.id,
      email: restoredUser.email,
      firstName: restoredUser.firstName,
      lastName: restoredUser.lastName,
      avatarUrl: restoredUser.avatarUrl,
    };
  }
}

