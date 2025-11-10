import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { TransactionsService } from '@/transactions/transactions.service';
import type { CreateTransactionDto, UpdateTransactionDto } from '@vetdesk/shared/types/transaction';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const includeDeleted = req.query.includeDeleted === 'true';
      const month = req.query.month as string | undefined;
      const transactions = await this.transactionsService.findAll(req.session.tenantId, includeDeleted, month);
      return res.json(transactions);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const transaction = await this.transactionsService.create(createTransactionDto, req.session.userId, req.session.tenantId);
      return res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const transaction = await this.transactionsService.update(id, updateTransactionDto, req.session.userId, req.session.tenantId);
      return res.json(transaction);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const result = await this.transactionsService.delete(id, req.session.userId, req.session.tenantId);
      return res.json(result);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const transaction = await this.transactionsService.restore(id, req.session.tenantId);
      return res.json(transaction);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

