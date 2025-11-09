import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto, DoctorResponse } from '@vetdesk/shared/types/doctor';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted?: boolean): Promise<DoctorResponse[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: includeDeleted
        ? { deletedAt: { not: null } }
        : { deletedAt: null },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty,
      crm: doctor.crm,
    }));
  }

  private validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new BadRequestException(
        `${fieldName} must be between ${min} and ${max} characters`,
      );
    }
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<DoctorResponse> {
    const firstName = createDoctorDto.firstName.trim();
    const lastName = createDoctorDto.lastName.trim();
    const specialty = createDoctorDto.specialty.trim();
    const crm = createDoctorDto.crm?.trim() || null;

    if (!firstName) {
      throw new BadRequestException('firstName is required');
    }

    if (!lastName) {
      throw new BadRequestException('lastName is required');
    }

    if (!specialty) {
      throw new BadRequestException('specialty is required');
    }

    this.validateStringLength(firstName, 1, 100, 'firstName');
    this.validateStringLength(lastName, 1, 100, 'lastName');
    this.validateStringLength(specialty, 1, 100, 'specialty');

    if (crm) {
      this.validateStringLength(crm, 1, 50, 'crm');
    }

    const doctor = await this.prisma.doctor.create({
      data: {
        firstName,
        lastName,
        specialty,
        crm,
      },
    });

    return {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty,
      crm: doctor.crm,
    };
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<DoctorResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('Doctor id is required');
    }

    const doctor = await this.prisma.doctor.findFirst({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor.deletedAt) {
      throw new BadRequestException('Cannot update a deleted doctor');
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      specialty?: string;
      crm?: string | null;
    } = {};

    if (Object.keys(updateDoctorDto).length === 0) {
      throw new BadRequestException('At least one field must be provided for update');
    }

    if (updateDoctorDto.firstName !== undefined) {
      const firstName = updateDoctorDto.firstName.trim();
      if (!firstName) {
        throw new BadRequestException('firstName cannot be empty');
      }
      this.validateStringLength(firstName, 1, 100, 'firstName');
      updateData.firstName = firstName;
    }

    if (updateDoctorDto.lastName !== undefined) {
      const lastName = updateDoctorDto.lastName.trim();
      if (!lastName) {
        throw new BadRequestException('lastName cannot be empty');
      }
      this.validateStringLength(lastName, 1, 100, 'lastName');
      updateData.lastName = lastName;
    }

    if (updateDoctorDto.specialty !== undefined) {
      const specialty = updateDoctorDto.specialty.trim();
      if (!specialty) {
        throw new BadRequestException('specialty cannot be empty');
      }
      this.validateStringLength(specialty, 1, 100, 'specialty');
      updateData.specialty = specialty;
    }

    if (updateDoctorDto.crm !== undefined) {
      const crm = updateDoctorDto.crm?.trim() || null;
      if (crm) {
        this.validateStringLength(crm, 1, 50, 'crm');
      }
      updateData.crm = crm;
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedDoctor.id,
      firstName: updatedDoctor.firstName,
      lastName: updatedDoctor.lastName,
      specialty: updatedDoctor.specialty,
      crm: updatedDoctor.crm,
    };
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!id || !id.trim()) {
      throw new BadRequestException('Doctor id is required');
    }

    const doctor = await this.prisma.doctor.findFirst({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (doctor.deletedAt) {
      throw new BadRequestException('Doctor is already deleted');
    }

    await this.prisma.doctor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Doctor deleted successfully' };
  }

  async restore(id: string): Promise<DoctorResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('Doctor id is required');
    }

    const doctor = await this.prisma.doctor.findFirst({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!doctor.deletedAt) {
      throw new BadRequestException('Doctor is not deleted');
    }

    const restoredDoctor = await this.prisma.doctor.update({
      where: { id },
      data: { deletedAt: null },
    });

    return {
      id: restoredDoctor.id,
      firstName: restoredDoctor.firstName,
      lastName: restoredDoctor.lastName,
      specialty: restoredDoctor.specialty,
      crm: restoredDoctor.crm,
    };
  }
}

