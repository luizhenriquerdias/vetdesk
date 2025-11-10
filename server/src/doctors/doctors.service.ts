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
        specialty: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty?.name || null,
      crm: doctor.crm,
      percProfessional: Number(doctor.percProfessional),
      appointmentFee: Number(doctor.appointmentFee),
    }));
  }

  private validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min || value.length > max) {
      throw new BadRequestException(
        `${fieldName} deve ter entre ${min} e ${max} caracteres`,
      );
    }
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<DoctorResponse> {
    const firstName = createDoctorDto.firstName.trim();
    const lastName = createDoctorDto.lastName.trim();
    const specialtyId = createDoctorDto.specialtyId || null;
    const crm = createDoctorDto.crm?.trim() || null;
    const percProfessional = createDoctorDto.percProfessional ?? 0;
    const appointmentFee = createDoctorDto.appointmentFee ?? 0;

    if (!firstName) {
      throw new BadRequestException('Nome é obrigatório');
    }

    if (!lastName) {
      throw new BadRequestException('Sobrenome é obrigatório');
    }

    this.validateStringLength(firstName, 1, 100, 'Nome');
    this.validateStringLength(lastName, 1, 100, 'Sobrenome');

    if (crm) {
      this.validateStringLength(crm, 1, 50, 'CRM');
    }

    if (percProfessional < 0 || percProfessional > 100) {
      throw new BadRequestException('Percentual profissional deve estar entre 0,0 e 100,0');
    }

    const createData: {
      firstName: string;
      lastName: string;
      crm: string | null;
      percProfessional: Decimal;
      appointmentFee: Decimal;
      specialty?: { connect: { id: string } };
    } = {
      firstName,
      lastName,
      crm,
      percProfessional: new Decimal(percProfessional),
      appointmentFee: new Decimal(appointmentFee),
    };

    if (specialtyId) {
      const existingSpecialty = await this.prisma.specialty.findFirst({
        where: {
          id: specialtyId,
          deletedAt: null,
        },
      });

      if (!existingSpecialty) {
        throw new BadRequestException('Especialidade não encontrada');
      }

      createData.specialty = {
        connect: { id: specialtyId },
      };
    }

    const doctor = await this.prisma.doctor.create({
      data: createData,
      include: {
        specialty: true,
      },
    });

    return {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty?.name || null,
      crm: doctor.crm,
      percProfessional: Number(doctor.percProfessional),
      appointmentFee: Number(doctor.appointmentFee),
    };
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<DoctorResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID do médico é obrigatório');
    }

    const doctor = await this.prisma.doctor.findFirst({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Médico não encontrado');
    }

    if (doctor.deletedAt) {
      throw new BadRequestException('Não é possível atualizar um médico excluído');
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      crm?: string | null;
      percProfessional?: Decimal;
      appointmentFee?: Decimal;
      specialty?: { connect: { id: string } } | { disconnect: true };
    } = {};

    if (Object.keys(updateDoctorDto).length === 0) {
      throw new BadRequestException('Pelo menos um campo deve ser fornecido para atualização');
    }

    if (updateDoctorDto.firstName !== undefined) {
      const firstName = updateDoctorDto.firstName.trim();
      if (!firstName) {
        throw new BadRequestException('Nome não pode estar vazio');
      }
      this.validateStringLength(firstName, 1, 100, 'Nome');
      updateData.firstName = firstName;
    }

    if (updateDoctorDto.lastName !== undefined) {
      const lastName = updateDoctorDto.lastName.trim();
      if (!lastName) {
        throw new BadRequestException('Sobrenome não pode estar vazio');
      }
      this.validateStringLength(lastName, 1, 100, 'Sobrenome');
      updateData.lastName = lastName;
    }

    if (updateDoctorDto.specialtyId !== undefined) {
      if (updateDoctorDto.specialtyId !== null) {
        const existingSpecialty = await this.prisma.specialty.findFirst({
          where: {
            id: updateDoctorDto.specialtyId,
            deletedAt: null,
          },
        });

        if (!existingSpecialty) {
          throw new BadRequestException('Especialidade não encontrada');
        }

        updateData.specialty = {
          connect: { id: updateDoctorDto.specialtyId },
        };
      } else {
        updateData.specialty = {
          disconnect: true,
        };
      }
    }

    if (updateDoctorDto.crm !== undefined) {
      const crm = updateDoctorDto.crm?.trim() || null;
      if (crm) {
        this.validateStringLength(crm, 1, 50, 'CRM');
      }
      updateData.crm = crm;
    }

    if (updateDoctorDto.percProfessional !== undefined) {
      if (updateDoctorDto.percProfessional < 0 || updateDoctorDto.percProfessional > 100) {
        throw new BadRequestException('Percentual profissional deve estar entre 0,0 e 100,0');
      }
      updateData.percProfessional = new Decimal(updateDoctorDto.percProfessional);
    }

    if (updateDoctorDto.appointmentFee !== undefined) {
      if (updateDoctorDto.appointmentFee < 0) {
        throw new BadRequestException('Preço da consulta deve ser maior ou igual a 0');
      }
      updateData.appointmentFee = new Decimal(updateDoctorDto.appointmentFee);
    }

    const updatedDoctor = await this.prisma.doctor.update({
      where: { id },
      data: updateData,
      include: {
        specialty: true,
      },
    });

    return {
      id: updatedDoctor.id,
      firstName: updatedDoctor.firstName,
      lastName: updatedDoctor.lastName,
      specialty: updatedDoctor.specialty?.name || null,
      crm: updatedDoctor.crm,
      percProfessional: Number(updatedDoctor.percProfessional),
      appointmentFee: Number(updatedDoctor.appointmentFee),
    };
  }

  async delete(id: string): Promise<{ message: string }> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID do médico é obrigatório');
    }

    const doctor = await this.prisma.doctor.findFirst({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Médico não encontrado');
    }

    if (doctor.deletedAt) {
      throw new BadRequestException('Médico já está excluído');
    }

    await this.prisma.doctor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Médico excluído com sucesso' };
  }

  async restore(id: string): Promise<DoctorResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID do médico é obrigatório');
    }

    const doctor = await this.prisma.doctor.findFirst({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException('Médico não encontrado');
    }

    if (!doctor.deletedAt) {
      throw new BadRequestException('Médico não está excluído');
    }

    const restoredDoctor = await this.prisma.doctor.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        specialty: true,
      },
    });

    return {
      id: restoredDoctor.id,
      firstName: restoredDoctor.firstName,
      lastName: restoredDoctor.lastName,
      specialty: restoredDoctor.specialty?.name || null,
      crm: restoredDoctor.crm,
      percProfessional: Number(restoredDoctor.percProfessional),
      appointmentFee: Number(restoredDoctor.appointmentFee),
    };
  }
}

