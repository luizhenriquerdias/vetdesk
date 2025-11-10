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

export async function seedSpecialties(prisma: PrismaClient, tenantId: string) {
  const seededSpecialties: Specialty[] = [];

  for (const name of specialties) {
    const specialty = await prisma.specialty.upsert({
      where: {
        name_tenantId: {
          name,
          tenantId,
        },
      },
      update: {},
      create: {
        name,
        tenantId,
      },
    });

    seededSpecialties.push(specialty);
  }

  console.log(`Seeded ${seededSpecialties.length} specialties`);
  return seededSpecialties;
}

