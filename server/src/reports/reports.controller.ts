import {
  Controller,
  HttpException,
  Get,
  Query,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ReportsService } from '@/reports/reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('doctors')
  async getDoctorsReport(
    @Query('doctorId') doctorId: string,
    @Query('month') month: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      if (!doctorId) {
        throw new BadRequestException('ID do médico é obrigatório');
      }

      const monthToUse = month || this.getCurrentMonth();
      const report = await this.reportsService.getDoctorsReport(
        req.session.tenantId,
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
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const report = await this.reportsService.getMonthlyIncomeOutcome(
        req.session.tenantId,
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

  private getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}

