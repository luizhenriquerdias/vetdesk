import { PrismaClient, Doctor } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export async function seedDoctors(prisma: PrismaClient) {
  const seededDoctors: Doctor[] = [];

  const specialty = await prisma.specialty.findFirst({
    where: { name: 'Oftalmologia' },
  });

  if (!specialty) {
    throw new Error('Specialty "Oftalmologia" not found. Please seed specialties first.');
  }

  const existingDoctor = await prisma.doctor.findFirst({
    where: {
      firstName: 'Raphael',
      lastName: 'Silveira',
      deletedAt: null,
    },
  });

  let doctor: Doctor;
  if (existingDoctor) {
    doctor = await prisma.doctor.update({
      where: { id: existingDoctor.id },
      data: {
        specialtyId: specialty.id,
        percProfessional: new Decimal(80),
      },
    });
  } else {
    doctor = await prisma.doctor.create({
      data: {
        firstName: 'Raphael',
        lastName: 'Silveira',
        specialtyId: specialty.id,
        percProfessional: new Decimal(80),
      },
    });
  }

  seededDoctors.push(doctor);
  console.log(`Seeded ${seededDoctors.length} doctors`);
  return seededDoctors;
}

