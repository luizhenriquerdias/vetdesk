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
        `${fieldName} must be between ${min} and ${max} characters`,
      );
    }
  }

  async create(createSpecialtyDto: CreateSpecialtyDto): Promise<SpecialtyResponse> {
    const name = createSpecialtyDto.name.trim();

    if (!name) {
      throw new BadRequestException('name is required');
    }

    this.validateStringLength(name, 1, 100, 'name');

    const existingSpecialty = await this.prisma.specialty.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingSpecialty) {
      throw new ConflictException('Specialty name already exists');
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
      throw new BadRequestException('Specialty id is required');
    }

    const specialty = await this.prisma.specialty.findFirst({
      where: { id },
    });

    if (!specialty) {
      throw new NotFoundException('Specialty not found');
    }

    if (specialty.deletedAt) {
      throw new BadRequestException('Cannot update a deleted specialty');
    }

    const updateData: {} = {};

    if (Object.keys(updateSpecialtyDto).length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
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
      throw new BadRequestException('Specialty id is required');
    }

    const specialty = await this.prisma.specialty.findFirst({
      where: { id },
    });

    if (!specialty) {
      throw new NotFoundException('Specialty not found');
    }

    if (specialty.deletedAt) {
      throw new BadRequestException('Specialty is already deleted');
    }

    await this.prisma.specialty.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Specialty deleted successfully' };
  }

  async restore(id: string): Promise<SpecialtyResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('Specialty id is required');
    }

    const specialty = await this.prisma.specialty.findFirst({
      where: { id },
    });

    if (!specialty) {
      throw new NotFoundException('Specialty not found');
    }

    if (!specialty.deletedAt) {
      throw new BadRequestException('Specialty is not deleted');
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

