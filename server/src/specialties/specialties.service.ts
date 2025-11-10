import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyResponse } from '@vetdesk/shared/types/specialty';

@Injectable()
export class SpecialtiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted?: boolean): Promise<SpecialtyResponse[]> {
    const specialties = await this.prisma.specialty.findMany({
      where: includeDeleted
        ? { deletedAt: { not: null } }
        : { deletedAt: null },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
    }));
  }

  private validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new BadRequestException(
        `${fieldName} deve ter entre ${min} e ${max} caracteres`,
      );
    }
  }

  async create(createSpecialtyDto: CreateSpecialtyDto): Promise<SpecialtyResponse> {
    const name = createSpecialtyDto.name.trim();

    if (!name) {
      throw new BadRequestException('Nome é obrigatório');
    }

    this.validateStringLength(name, 1, 100, 'Nome');

    const existingSpecialty = await this.prisma.specialty.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingSpecialty) {
      throw new ConflictException('Nome da especialidade já existe');
    }

    const specialty = await this.prisma.specialty.create({
      data: {
        name,
      },
    });

    return {
      id: specialty.id,
      name: specialty.name,
    };
  }

  async update(id: string, updateSpecialtyDto: UpdateSpecialtyDto): Promise<SpecialtyResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID da especialidade é obrigatório');
    }

    const specialty = await this.prisma.specialty.findFirst({
      where: { id },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada');
    }

    if (specialty.deletedAt) {
      throw new BadRequestException('Não é possível atualizar uma especialidade excluída');
    }

    const updateData: {} = {};

    if (Object.keys(updateSpecialtyDto).length === 0) {
      throw new BadRequestException('Pelo menos um campo deve ser fornecido para atualização');
    }

    const updatedSpecialty = await this.prisma.specialty.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedSpecialty.id,
      name: updatedSpecialty.name,
    };
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID da especialidade é obrigatório');
    }

    const specialty = await this.prisma.specialty.findFirst({
      where: { id },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada');
    }

    if (specialty.deletedAt) {
      throw new BadRequestException('Especialidade já está excluída');
    }

    await this.prisma.specialty.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Especialidade excluída com sucesso' };
  }

  async restore(id: string): Promise<SpecialtyResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID da especialidade é obrigatório');
    }

    const specialty = await this.prisma.specialty.findFirst({
      where: { id },
    });

    if (!specialty) {
      throw new NotFoundException('Especialidade não encontrada');
    }

    if (!specialty.deletedAt) {
      throw new BadRequestException('Especialidade não está excluída');
    }

    const restoredSpecialty = await this.prisma.specialty.update({
      where: { id },
      data: { deletedAt: null },
    });

    return {
      id: restoredSpecialty.id,
      name: restoredSpecialty.name,
    };
  }
}

