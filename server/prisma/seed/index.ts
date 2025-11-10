import { PrismaClient } from '@prisma/client';
import { seedUser } from './user.seed';
import { seedSpecialties } from './specialty.seed';

const prisma = new PrismaClient();

async function main() {
  await seedUser(prisma);
  await seedSpecialties(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

