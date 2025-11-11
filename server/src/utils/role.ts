import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import { isAdminOrDev } from '@vetdesk/shared/utils/role';

export const requireAdminOrDev = async (req: Request, prisma: PrismaService): Promise<void> => {
  if (!req.session.userId || !req.session.tenantId) {
    throw new UnauthorizedException('Não autenticado');
  }

  const userTenant = await prisma.userTenant.findUnique({
    where: {
      userId_tenantId: {
        userId: req.session.userId,
        tenantId: req.session.tenantId,
      },
    },
  });

  if (!userTenant) {
    throw new ForbiddenException('Acesso negado');
  }

  if (!isAdminOrDev(userTenant.role)) {
    throw new ForbiddenException('Acesso negado');
  }
};

