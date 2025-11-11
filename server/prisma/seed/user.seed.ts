import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/password';
import { USER_TENANT_ROLE_DEV } from '@vetdesk/shared/types/user-tenant';

export async function seedUser(prisma: PrismaClient, defaultTenantId: string) {
  const hashedPassword = await hashPassword('123123');

  const user = await prisma.user.upsert({
    where: { email: 'luizhenriquerdias@gmail.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      firstName: 'Luiz',
      lastName: 'Dias',
      email: 'luizhenriquerdias@gmail.com',
      password: hashedPassword,
    },
  });

  const allTenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
  });

  for (const tenant of allTenants) {
    await prisma.userTenant.upsert({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId: tenant.id,
        },
      },
      update: {
        role: USER_TENANT_ROLE_DEV,
      },
      create: {
        userId: user.id,
        tenantId: tenant.id,
        role: USER_TENANT_ROLE_DEV,
      },
    });
  }

  console.log('Seeded user:', user);
  return user;
}

