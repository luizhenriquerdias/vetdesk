import { PrismaClient } from '@prisma/client';
import { seedTenants } from './tenant.seed';
import { seedUser } from './user.seed';
import { seedSpecialties } from './specialty.seed';
import { seedDoctors } from './doctor.seed';

const prisma = new PrismaClient();

async function main() {
  const { vitaCenter } = await seedTenants(prisma);
  const user = await seedUser(prisma, vitaCenter.id);
  await seedSpecialties(prisma, vitaCenter.id);
  await seedDoctors(prisma, vitaCenter.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

