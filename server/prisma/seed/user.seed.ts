import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/password';

export async function seedUser(prisma: PrismaClient) {
  const hashedPassword = await hashPassword('123123');

  const user = await prisma.user.upsert({
    where: { email: 'luizhenriquerdias@gmail.com' },
    update: {},
    create: {
      firstName: 'Luiz',
      lastName: 'Dias',
      email: 'luizhenriquerdias@gmail.com',
      password: hashedPassword,
    },
  });

  console.log('Seeded user:', user);
  return user;
}

