import {
  Controller,
  HttpException,
  Get,
  Query,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ReportsService } from '@/reports/reports.service';
import { TransactionsService } from '@/transactions/transactions.service';
import { PrismaService } from '@/prisma/prisma.service';
import { requireAdminOrDev } from '@/utils/role';

@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private transactionsService: TransactionsService,
    private prisma: PrismaService,
  ) {}

  @Get('doctors')
  async getDoctorsReport(
    @Query('doctorId') doctorId: string,
    @Query('month') month: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await requireAdminOrDev(req, this.prisma);

      if (!doctorId) {
        throw new BadRequestException('ID do médico é obrigatório');
      }

      const monthToUse = month || this.getCurrentMonth();
      const report = await this.reportsService.getDoctorsReport(
        req.session.tenantId!,
        doctorId,
        monthToUse,
      );
      return res.json(report);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Get('monthly-income-outcome')
  async getMonthlyIncomeOutcome(
    @Query('month') month: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await requireAdminOrDev(req, this.prisma);

      const report = await this.reportsService.getMonthlyIncomeOutcome(
        req.session.tenantId!,
        month,
      );
      return res.json(report);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Get('transactions')
  async getTransactions(@Req() req: Request, @Res() res: Response) {
    try {
      await requireAdminOrDev(req, this.prisma);

      const month = req.query.month as string | undefined;
      const transactions = await this.transactionsService.findAll(
        req.session.tenantId!,
        false,
        month,
      );
      return res.json(transactions);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}

