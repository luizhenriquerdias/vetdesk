import { PrismaClient, Specialty } from '@prisma/client';

const specialties = [
  'Oftalmologia',
  'Nutrição',
  'Reumatologia',
  'Psicologia',
  'Dermatologia',
  'Otorrinolaringologia',
  'Psiquiatria',
  'Pediatria',
  'Gastroenterologia',
  'Cardiologia',
];

export async function seedSpecialties(prisma: PrismaClient) {
  const seededSpecialties: Specialty[] = [];

  for (const name of specialties) {
    const specialty = await prisma.specialty.upsert({
      where: { name },
      update: {},
      create: {
        name,
      },
    });

    seededSpecialties.push(specialty);
  }

  console.log(`Seeded ${seededSpecialties.length} specialties`);
  return seededSpecialties;
}

