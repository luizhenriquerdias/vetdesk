import { Body, Controller, Get, Post, Req, Res, HttpException, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthResponse } from '@vetdesk/shared/types/auth';

interface LoginDto {
  email: string;
  password: string;
}

interface SwitchTenantDto {
  tenantId: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.login(loginDto.email, loginDto.password);

      req.session.userId = result.user.id;
      if (result.tenant) {
        req.session.tenantId = result.tenant.id;
      }
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: 'Falha ao criar sessão' });
        }
        const response: AuthResponse = {
          user: result.user,
          tenant: result.tenant,
        };
        return res.json(response);
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Get('tenants')
  async getTenants(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const tenants = await this.authService.getAvailableTenants(req.session.userId);
      return res.json(tenants);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Post('switch-tenant')
  async switchTenant(
    @Body() switchTenantDto: SwitchTenantDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Não autenticado');
      }

      const result = await this.authService.switchTenant(req.session.userId, switchTenantDto.tenantId);
      req.session.tenantId = result.tenant?.id;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: 'Falha ao atualizar sessão' });
        }
        return res.json(result);
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Falha ao destruir sessão' });
      }
      return res.json({ message: 'Logout realizado com sucesso' });
    });
  }
}

