import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

export type DoctorsReportItem = {
  date: string;
  appointmentCount: number;
  entrada: number;
  profissional: number;
  clinica: number;
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDoctorsReport(
    tenantId: string,
    doctorId: string,
    month?: string,
  ): Promise<DoctorsReportItem[]> {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        id: doctorId,
        tenantId,
        deletedAt: null,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Médico não encontrado');
    }

    const monthToUse = month || this.getCurrentMonth();
    const [year, monthNum] = monthToUse.split('-').map(Number);

    if (isNaN(year) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new BadRequestException('Formato de mês inválido. Esperado AAAA-MM');
    }

    const startOfMonth = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        tenantId,
        doctorId,
        deletedAt: null,
        datetime: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        datetime: 'asc',
      },
    });

    const grouped = new Map<string, {
      appointmentCount: number;
      entrada: number;
      profissional: number;
      clinica: number;
    }>();

    appointments.forEach((appointment) => {
      const dateKey = appointment.datetime.toISOString().split('T')[0];

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          appointmentCount: 0,
          entrada: 0,
          profissional: 0,
          clinica: 0,
        });
      }

      const group = grouped.get(dateKey)!;
      const fee = Number(appointment.fee);
      const percProfessional = Number(appointment.percProfessional);

      group.appointmentCount += 1;
      group.entrada += fee;

      const profissionalAmount = fee * (percProfessional / 100);
      group.profissional += profissionalAmount;
      group.clinica += fee - profissionalAmount;
    });

    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const allDates: DoctorsReportItem[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthNum - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      const data = grouped.get(dateKey);

      allDates.push({
        date: dateKey,
        appointmentCount: data?.appointmentCount || 0,
        entrada: data ? Number(data.entrada.toFixed(2)) : 0,
        profissional: data ? Number(data.profissional.toFixed(2)) : 0,
        clinica: data ? Number(data.clinica.toFixed(2)) : 0,
      });
    }

    return allDates;
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}

