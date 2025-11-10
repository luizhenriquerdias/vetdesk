import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateDoctorDto, UpdateDoctorDto, DoctorResponse } from '@vetdesk/shared/types/doctor';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted?: boolean): Promise<DoctorResponse[]> {
    const doctors = await this.prisma.doctor.findMany({
      where: includeDeleted
        ? { deletedAt: { not: null } }
        : { deletedAt: null },
      include: {
        specialties: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialties: doctor.specialties.map((s) => s.name),
      crm: doctor.crm,
      percProfessional: Number(doctor.percProfessional),
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
    const specialtyIds = createDoctorDto.specialtyIds || [];
    const crm = createDoctorDto.crm?.trim() || null;
    const percProfessional = createDoctorDto.percProfessional ?? 0;

    if (!firstName) {
      throw new BadRequestException('firstName is required');
    }

    if (!lastName) {
      throw new BadRequestException('lastName is required');
    }

    this.validateStringLength(firstName, 1, 100, 'firstName');
    this.validateStringLength(lastName, 1, 100, 'lastName');

    if (crm) {
      this.validateStringLength(crm, 1, 50, 'crm');
    }

    if (percProfessional < 0 || percProfessional > 100) {
      throw new BadRequestException('percProfessional must be between 0.0 and 100.0');
    }

    const createData: {
      firstName: string;
      lastName: string;
      crm: string | null;
      percProfessional: Decimal;
      specialties?: { connect: { id: string }[] };
    } = {
      firstName,
      lastName,
      crm,
      percProfessional: new Decimal(percProfessional),
    };

    if (Array.isArray(specialtyIds) && specialtyIds.length > 0) {
      const existingSpecialties = await this.prisma.specialty.findMany({
        where: {
          id: { in: specialtyIds },
          deletedAt: null,
        },
      });

      if (existingSpecialties.length !== specialtyIds.length) {
        throw new BadRequestException('One or more specialties not found');
      }

      createData.specialties = {
        connect: specialtyIds.map((id) => ({ id })),
      };
    }

    const doctor = await this.prisma.doctor.create({
      data: createData,
      include: {
        specialties: true,
      },
    });

    return {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialties: doctor.specialties.map((s) => s.name),
      crm: doctor.crm,
      percProfessional: Number(doctor.percProfessional),
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
      crm?: string | null;
      percProfessional?: Decimal;
      specialties?: { set: { id: string }[] };
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

    if (updateDoctorDto.specialtyIds !== undefined) {
      if (!Array.isArray(updateDoctorDto.specialtyIds)) {
        throw new BadRequestException('specialtyIds must be an array');
      }

      if (updateDoctorDto.specialtyIds.length > 0) {
        const existingSpecialties = await this.prisma.specialty.findMany({
          where: {
            id: { in: updateDoctorDto.specialtyIds },
            deletedAt: null,
          },
        });

        if (existingSpecialties.length !== updateDoctorDto.specialtyIds.length) {
          throw new BadRequestException('One or more specialties not found');
        }

        updateData.specialties = {
          set: updateDoctorDto.specialtyIds.map((specialtyId) => ({ id: specialtyId })),
        };
      } else {
        updateData.specialties = {
          set: [],
        };
      }
    }

    if (updateDoctorDto.crm !== undefined) {
      const crm = updateDoctorDto.crm?.trim() || null;
      if (crm) {
        this.validateStringLength(crm, 1, 50, 'crm');
      }
      updateData.crm = crm;
    }

    if (updateDoctorDto.percProfessional !== undefined) {
      if (updateDoctorDto.percProfessional < 0 || updateDoctorDto.percProfessional > 100) {
        throw new BadRequestException('percProfessional must be between 0.0 and 100.0');
      }
      updateData.percProfessional = new Decimal(updateDoctorDto.percProfessional);
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: updateData,
      include: {
        specialties: true,
      },
    });

    return {
      id: updatedDoctor.id,
      firstName: updatedDoctor.firstName,
      lastName: updatedDoctor.lastName,
      specialties: updatedDoctor.specialties.map((s) => s.name),
      crm: updatedDoctor.crm,
      percProfessional: Number(updatedDoctor.percProfessional),
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
      include: {
        specialties: true,
      },
    });

    return {
      id: restoredDoctor.id,
      firstName: restoredDoctor.firstName,
      lastName: restoredDoctor.lastName,
      specialties: restoredDoctor.specialties.map((s) => s.name),
      crm: restoredDoctor.crm,
      percProfessional: Number(restoredDoctor.percProfessional),
    };
  }
}

