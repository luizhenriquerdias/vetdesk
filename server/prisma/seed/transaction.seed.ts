import { PrismaClient } from '@prisma/client';

const incomeDescriptions = [
  'Consultation Fee',
  'Surgery Payment',
  'Vaccination Service',
  'Emergency Visit',
  'Follow-up Appointment',
  'Lab Test Payment',
  'X-Ray Service',
  'Dental Cleaning',
  'Grooming Service',
  'Pet Boarding',
  'Medication Sale',
  'Pet Food Sale',
];

const expenseDescriptions = [
  'Veterinary Supplies',
  'Office Rent',
  'Equipment Maintenance',
  'Staff Salary',
  'Utility Bills',
  'Insurance Payment',
  'Marketing Expenses',
  'Software Subscription',
  'Cleaning Supplies',
  'Medical Equipment',
  'Pet Food Inventory',
  'Transportation Costs',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function getRandomDateInCurrentMonth(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  
  return new Date(year, month, day, hour, minute);
}

export async function seedTransactions(prisma: PrismaClient, userId: string) {
  const transactionsToCreate: Array<{
    description: string;
    type: 'INCOME' | 'EXPENSE';
    datetime: Date;
    amount: number;
    createdBy: string;
  }> = [];

  for (let i = 0; i < 30; i++) {
    const isIncome = Math.random() > 0.4;
    const type: 'INCOME' | 'EXPENSE' = isIncome ? 'INCOME' : 'EXPENSE';
    const descriptions = isIncome ? incomeDescriptions : expenseDescriptions;
    const amount = isIncome 
      ? getRandomAmount(50, 500)
      : getRandomAmount(20, 300);

    transactionsToCreate.push({
      description: getRandomElement(descriptions),
      type,
      datetime: getRandomDateInCurrentMonth(),
      amount,
      createdBy: userId,
    });
  }

  const created = await prisma.transaction.createMany({
    data: transactionsToCreate,
  });

  console.log(`Seeded ${created.count} transactions for the current month`);
  return created;
}

