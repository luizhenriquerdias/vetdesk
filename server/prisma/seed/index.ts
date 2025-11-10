import { PrismaClient } from '@prisma/client';
import { seedUser } from './user.seed';
import { seedSpecialties } from './specialty.seed';
import { seedDoctors } from './doctor.seed';

const prisma = new PrismaClient();

async function main() {
  await seedUser(prisma);
  await seedSpecialties(prisma);
  await seedDoctors(prisma);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

