import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const VITA_CENTER_ID = randomUUID();
const CLINICA_LUIZ_ID = randomUUID();

export async function seedTenants(prisma: PrismaClient) {
  const vitaCenter = await prisma.tenant.upsert({
    where: { id: VITA_CENTER_ID },
    update: {},
    create: {
      id: VITA_CENTER_ID,
      name: 'Vita Center',
    },
  });

  const clinicaLuiz = await prisma.tenant.upsert({
    where: { id: CLINICA_LUIZ_ID },
    update: {},
    create: {
      id: CLINICA_LUIZ_ID,
      name: 'Clínica Luiz',
    },
  });

  console.log('Seeded tenants:', { vitaCenter, clinicaLuiz });
  return { vitaCenter, clinicaLuiz };
}

