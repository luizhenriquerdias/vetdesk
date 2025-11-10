import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponse } from '@vetdesk/shared/types/appointment';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeDeleted?: boolean, month?: string): Promise<AppointmentResponse[]> {
    const whereClause: {
      deletedAt?: { not: null } | null;
      datetime?: {
        gte: Date;
        lte: Date;
      };
    } = {};

    if (includeDeleted) {
      whereClause.deletedAt = { not: null };
    } else {
      whereClause.deletedAt = null;
    }

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);
      if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        throw new BadRequestException('Formato de mês inválido. Esperado AAAA-MM');
      }

      const startOfMonth = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

      whereClause.datetime = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const appointments = await this.prisma.appointment.findMany({
      where: whereClause,
      orderBy: {
        datetime: 'desc',
      },
    });

    return appointments.map((appointment) => ({
      id: appointment.id,
      doctorId: appointment.doctorId,
      fee: Number(appointment.fee),
      percProfessional: Number(appointment.percProfessional),
      datetime: appointment.datetime.toISOString(),
    }));
  }

  async create(createAppointmentDto: CreateAppointmentDto, userId: string): Promise<AppointmentResponse> {
    const doctorId = createAppointmentDto.doctorId.trim();
    const fee = createAppointmentDto.fee;
    const percProfessional = createAppointmentDto.percProfessional ?? 0;
    const datetime = new Date(createAppointmentDto.datetime);

    if (!doctorId) {
      throw new BadRequestException('ID do médico é obrigatório');
    }

    if (fee === undefined || fee === null) {
      throw new BadRequestException('Preço é obrigatório');
    }

    if (fee < 0) {
      throw new BadRequestException('Preço deve ser maior ou igual a 0');
    }

    if (percProfessional < 0 || percProfessional > 100) {
      throw new BadRequestException('Percentual profissional deve estar entre 0,0 e 100,0');
    }

    if (isNaN(datetime.getTime())) {
      throw new BadRequestException('Data e hora devem ser uma data válida');
    }

    const existingDoctor = await this.prisma.doctor.findFirst({
      where: {
        id: doctorId,
        deletedAt: null,
      },
    });

    if (!existingDoctor) {
      throw new BadRequestException('Médico não encontrado');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        doctorId,
        fee: new Decimal(fee),
        percProfessional: new Decimal(percProfessional),
        datetime,
        createdBy: userId,
      },
    });

    return {
      id: appointment.id,
      doctorId: appointment.doctorId,
      fee: Number(appointment.fee),
      percProfessional: Number(appointment.percProfessional),
      datetime: appointment.datetime.toISOString(),
    };
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto, userId: string): Promise<AppointmentResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID da consulta é obrigatório');
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (appointment.deletedAt) {
      throw new BadRequestException('Não é possível atualizar uma consulta excluída');
    }

    const updateData: {
      doctorId?: string;
      fee?: Decimal;
      percProfessional?: Decimal;
      datetime?: Date;
      updatedBy?: string;
    } = {};

    if (Object.keys(updateAppointmentDto).length === 0) {
      throw new BadRequestException('Pelo menos um campo deve ser fornecido para atualização');
    }

    if (updateAppointmentDto.doctorId !== undefined) {
      const doctorId = updateAppointmentDto.doctorId.trim();
      if (!doctorId) {
        throw new BadRequestException('ID do médico não pode estar vazio');
      }

      const existingDoctor = await this.prisma.doctor.findFirst({
        where: {
          id: doctorId,
          deletedAt: null,
        },
      });

      if (!existingDoctor) {
        throw new BadRequestException('Médico não encontrado');
      }

      updateData.doctorId = doctorId;
    }

    if (updateAppointmentDto.fee !== undefined) {
      if (updateAppointmentDto.fee < 0) {
        throw new BadRequestException('Preço deve ser maior ou igual a 0');
      }
      updateData.fee = new Decimal(updateAppointmentDto.fee);
    }

    if (updateAppointmentDto.percProfessional !== undefined) {
      if (updateAppointmentDto.percProfessional < 0 || updateAppointmentDto.percProfessional > 100) {
        throw new BadRequestException('Percentual profissional deve estar entre 0,0 e 100,0');
      }
      updateData.percProfessional = new Decimal(updateAppointmentDto.percProfessional);
    }

    if (updateAppointmentDto.datetime !== undefined) {
      const datetime = new Date(updateAppointmentDto.datetime);
      if (isNaN(datetime.getTime())) {
        throw new BadRequestException('Data e hora devem ser uma data válida');
      }
      updateData.datetime = datetime;
    }

    updateData.updatedBy = userId;

    const updatedAppointment = await this.prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedAppointment.id,
      doctorId: updatedAppointment.doctorId,
      fee: Number(updatedAppointment.fee),
      percProfessional: Number(updatedAppointment.percProfessional),
      datetime: updatedAppointment.datetime.toISOString(),
    };
  }

  async delete(id: string, userId: string): Promise<{ message: string }> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID da consulta é obrigatório');
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (appointment.deletedAt) {
      throw new BadRequestException('Consulta já está excluída');
    }

    await this.prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return { message: 'Consulta excluída com sucesso' };
  }

  async restore(id: string): Promise<AppointmentResponse> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID da consulta é obrigatório');
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Consulta não encontrada');
    }

    if (!appointment.deletedAt) {
      throw new BadRequestException('Consulta não está excluída');
    }

    const restoredAppointment = await this.prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });

    return {
      id: restoredAppointment.id,
      doctorId: restoredAppointment.doctorId,
      fee: Number(restoredAppointment.fee),
      percProfessional: Number(restoredAppointment.percProfessional),
      datetime: restoredAppointment.datetime.toISOString(),
    };
  }
}

