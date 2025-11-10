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
import { SpecialtiesService } from '@/specialties/specialties.service';
import type { CreateSpecialtyDto, UpdateSpecialtyDto } from '@vetdesk/shared/types/specialty';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private specialtiesService: SpecialtiesService) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const includeDeleted = req.query.includeDeleted === 'true';
      const specialties = await this.specialtiesService.findAll(req.session.tenantId, includeDeleted);
      return res.json(specialties);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Post()
  async create(
    @Body() createSpecialtyDto: CreateSpecialtyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const specialty = await this.specialtiesService.create(createSpecialtyDto, req.session.tenantId);
      return res.status(201).json(specialty);
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
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const specialty = await this.specialtiesService.update(id, updateSpecialtyDto, req.session.tenantId);
      return res.json(specialty);
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

      const result = await this.specialtiesService.delete(id, req.session.tenantId);
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

      const specialty = await this.specialtiesService.restore(id, req.session.tenantId);
      return res.json(specialty);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

