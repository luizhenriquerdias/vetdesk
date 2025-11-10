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
import { DoctorsService } from '@/doctors/doctors.service';
import type { CreateDoctorDto, UpdateDoctorDto } from '@vetdesk/shared/types/doctor';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const includeDeleted = req.query.includeDeleted === 'true';
      const doctors = await this.doctorsService.findAll(req.session.tenantId, includeDeleted);
      return res.json(doctors);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Post()
  async create(
    @Body() createDoctorDto: CreateDoctorDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const doctor = await this.doctorsService.create(createDoctorDto, req.session.tenantId);
      return res.status(201).json(doctor);
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
    @Body() updateDoctorDto: UpdateDoctorDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId || !req.session.tenantId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const doctor = await this.doctorsService.update(id, updateDoctorDto, req.session.tenantId);
      return res.json(doctor);
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

      const result = await this.doctorsService.delete(id, req.session.tenantId);
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

      const doctor = await this.doctorsService.restore(id, req.session.tenantId);
      return res.json(doctor);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

