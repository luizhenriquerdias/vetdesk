import * as bcrypt from 'bcryptjs';

const PEPPER = process.env.PEPPER || '';

if (!PEPPER) {
  console.warn('WARNING: PEPPER environment variable is not set. Using empty pepper.');
}

export async function hashPassword(password: string): Promise<string> {
  const passwordWithPepper = password + PEPPER;
  return bcrypt.hash(passwordWithPepper, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordWithPepper = password + PEPPER;
  return bcrypt.compare(passwordWithPepper, hash);
}

