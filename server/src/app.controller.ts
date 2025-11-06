import { Controller, Get, Req, Res, HttpException, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthResponse } from './types/user';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('init')
  async init(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.session.userId) {
        throw new UnauthorizedException('Not authenticated');
      }

      const user = await this.authService.getCurrentUser(req.session.userId);
      const response: AuthResponse = { user };
      return res.json(response);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
