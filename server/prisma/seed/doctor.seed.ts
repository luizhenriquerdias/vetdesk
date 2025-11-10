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

  const doctor: Doctor = await prisma.doctor.create({
    data: {
      firstName: 'Raphael',
      lastName: 'Silveira',
      crm: 'MS-123456',
      appointmentFee: new Decimal(100),
      specialtyId: specialty.id,
      percProfessional: new Decimal(80),
    },
  });

  seededDoctors.push(doctor);
  console.log(`Seeded ${seededDoctors.length} doctors`);
  return seededDoctors;
}

