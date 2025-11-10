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
import { AppointmentsService } from '@/appointments/appointments.service';
import type { CreateAppointmentDto, UpdateAppointmentDto } from '@vetdesk/shared/types/appointment';

@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const includeDeleted = req.query.includeDeleted === 'true';
      const month = req.query.month as string | undefined;
      const appointments = await this.appointmentsService.findAll(includeDeleted, month);
      return res.json(appointments);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post()
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const appointment = await this.appointmentsService.create(createAppointmentDto, req.session.userId);
      return res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const appointment = await this.appointmentsService.update(id, updateAppointmentDto, req.session.userId);
      return res.json(appointment);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const result = await this.appointmentsService.delete(id, req.session.userId);
      return res.json(result);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const appointment = await this.appointmentsService.restore(id);
      return res.json(appointment);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

