import { PrismaClient } from '@prisma/client';
import { seedUser } from './user.seed';
import { seedTransactions } from './transaction.seed';

const prisma = new PrismaClient();

async function main() {
  const user = await seedUser(prisma);
  await seedTransactions(prisma, user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

