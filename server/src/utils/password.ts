import * as bcrypt from 'bcryptjs';

const PEPPER = process.env.PEPPER || '';

if (!PEPPER) {
  console.error('WARNING: PEPPER environment variable is not set. Using empty pepper.');
}

export function hashPassword(password: string): Promise<string> {
  const passwordWithPepper = password + PEPPER;
  return bcrypt.hash(passwordWithPepper, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordWithPepper = password + PEPPER;
  return bcrypt.compare(passwordWithPepper, hash);
}

