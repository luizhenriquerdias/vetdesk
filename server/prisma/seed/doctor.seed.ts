import { PrismaClient, Doctor } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export async function seedDoctors(prisma: PrismaClient, tenantId: string) {
  const seededDoctors: Doctor[] = [];

  const specialty = await prisma.specialty.findFirst({
    where: {
      name: 'Oftalmologia',
      tenantId,
    },
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
      tenantId,
      percProfessional: new Decimal(80),
    },
  });

  seededDoctors.push(doctor);
  console.log(`Seeded ${seededDoctors.length} doctors`);
  return seededDoctors;
}

