import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { verifyPassword } from '../utils/password';
import { type AuthResponse } from '@vetdesk/shared/types/auth';
import { Tenant } from '@vetdesk/shared/types/tenant';
import { UserTenantRole } from '@vetdesk/shared/types/user-tenant';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const userTenants = await this.prisma.userTenant.findMany({
      where: {
        userId: user.id,
        tenant: {
          deletedAt: null,
        },
      },
      include: {
        tenant: true,
      },
    });

    userTenants.sort((a, b) => {
      const aCreated = a.tenant?.createdAt?.getTime() || 0;
      const bCreated = b.tenant?.createdAt?.getTime() || 0;
      return aCreated - bCreated;
    });

    const firstUserTenant = userTenants.length > 0 ? userTenants[0] : null;
    const firstTenant = firstUserTenant && firstUserTenant.tenant ? {
      id: firstUserTenant.tenant.id,
      name: firstUserTenant.tenant.name,
    } : null;

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      tenant: firstTenant,
      role: firstUserTenant?.role ?? null,
    };
  }

  async getCurrentUser(userId: string, tenantId?: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    let tenant: Tenant | null = null;
    let role: UserTenantRole | null = null;

    if (tenantId) {
      const userTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId,
            tenantId,
          },
        },
        include: {
          tenant: true,
        },
      });

      if (userTenant && userTenant.tenant && !userTenant.tenant.deletedAt) {
        tenant = {
          id: userTenant.tenant.id,
          name: userTenant.tenant.name,
        };
        role = userTenant.role;
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      tenant,
      role,
    };
  }

  async getAvailableTenants(userId: string): Promise<{ id: string; name: string }[]> {
    const userTenants = await this.prisma.userTenant.findMany({
      where: {
        userId,
        tenant: {
          deletedAt: null,
        },
      },
      include: {
        tenant: true,
      },
    });

    userTenants.sort((a, b) => {
      const aCreated = a.tenant?.createdAt?.getTime() || 0;
      const bCreated = b.tenant?.createdAt?.getTime() || 0;
      return aCreated - bCreated;
    });

    return userTenants
      .filter((ut) => ut.tenant && !ut.tenant.deletedAt)
      .map((ut) => ({
        id: ut.tenant.id,
        name: ut.tenant.name,
      }));
  }

  async switchTenant(userId: string, tenantId: string): Promise<AuthResponse> {
    const userTenant = await this.prisma.userTenant.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
        },
      },
      include: {
        tenant: true,
        user: true,
      },
    });

    if (!userTenant || !userTenant.tenant || userTenant.tenant.deletedAt) {
      throw new BadRequestException('Tenant não encontrado ou você não tem acesso a ele');
    }

    return {
      user: {
        id: userTenant.user.id,
        email: userTenant.user.email,
        firstName: userTenant.user.firstName,
        lastName: userTenant.user.lastName,
        avatarUrl: userTenant.user.avatarUrl,
      },
      tenant: {
        id: userTenant.tenant.id,
        name: userTenant.tenant.name,
      },
      role: userTenant.role,
    };
  }
}

