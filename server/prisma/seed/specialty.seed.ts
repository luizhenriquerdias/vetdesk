import { PrismaClient, Specialty } from '@prisma/client';

const specialties = [
  'Oftalmologista',
  'Nutricionista',
  'Reumatologista',
  'Psicóloga',
  'Dermatologista',
  'Otorrinolaringologista',
  'Psiquiatra',
  'Pediatra',
  'Gastrologista',
  'Cardiologista',
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

