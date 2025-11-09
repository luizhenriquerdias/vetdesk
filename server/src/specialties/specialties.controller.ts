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
import type { CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyResponse } from '@vetdesk/shared/types/specialty';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private specialtiesService: SpecialtiesService) {}

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const includeDeleted = req.query.includeDeleted === 'true';
      const specialties = await this.specialtiesService.findAll(includeDeleted);
      return res.json(specialties);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post()
  async create(
    @Body() createSpecialtyDto: CreateSpecialtyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const specialty = await this.specialtiesService.create(createSpecialtyDto);
      return res.status(201).json(specialty);
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
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const specialty = await this.specialtiesService.update(id, updateSpecialtyDto);
      return res.json(specialty);
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

      const result = await this.specialtiesService.delete(id);
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

      const specialty = await this.specialtiesService.restore(id);
      return res.json(specialty);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}

