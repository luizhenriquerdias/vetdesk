import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { hashPassword } from '@/utils/password';
import { CreateUserDto, UpdateUserDto, UserResponse } from '@vetdesk/shared/types/user';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new BadRequestException(
        `${fieldName} must be between ${min} and ${max} characters`,
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    const firstName = createUserDto.firstName.trim();
    const lastName = createUserDto.lastName.trim();
    const email = createUserDto.email.trim().toLowerCase();
    const password = createUserDto.password.trim();

    if (!firstName) {
      throw new BadRequestException('firstName is required');
    }

    if (!lastName) {
      throw new BadRequestException('lastName is required');
    }

    if (!email) {
      throw new BadRequestException('email is required');
    }

    if (!password) {
      throw new BadRequestException('password is required');
    }

    if (!this.validateEmail(createUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    this.validateStringLength(createUserDto.firstName.trim(), 1, 100, 'firstName');
    this.validateStringLength(createUserDto.lastName.trim(), 1, 100, 'lastName');
    this.validateStringLength(createUserDto.password, 8, 100, 'password');

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email.trim().toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
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
      throw new BadRequestException('User id is required');
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      avatarUrl?: string | null;
    } = {};

    if (Object.keys(updateUserDto).length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    if (updateUserDto.firstName !== undefined) {
      const firstName = updateUserDto.firstName.trim();
      if (!firstName) {
        throw new BadRequestException('firstName cannot be empty');
      }
      this.validateStringLength(firstName, 1, 100, 'firstName');
      updateData.firstName = firstName;
    }

    if (updateUserDto.lastName !== undefined) {
      const lastName = updateUserDto.lastName.trim();
      if (!lastName) {
        throw new BadRequestException('lastName cannot be empty');
      }
      this.validateStringLength(lastName, 1, 100, 'lastName');
      updateData.lastName = lastName;
    }

    if (updateUserDto.email !== undefined) {
      const email = updateUserDto.email.trim().toLowerCase();
      if (!email) {
        throw new BadRequestException('email cannot be empty');
      }
      if (!this.validateEmail(email)) {
        throw new BadRequestException('Invalid email format');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email already exists');
      }

      updateData.email = email;
    }

    if (updateUserDto.password !== undefined) {
      const password = updateUserDto.password.trim();
      if (!password) {
        throw new BadRequestException('password cannot be empty');
      }
      this.validateStringLength(password, 8, 100, 'password');
      updateData.password = await hashPassword(password);
    }

    if (updateUserDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateUserDto.avatarUrl || null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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

  async delete(id: string): Promise<{ message: string }> {
    if (!id || !id.trim()) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}

