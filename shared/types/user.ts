import type { UserTenantRole } from './user-tenant';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role?: UserTenantRole | null;
};

export type CreateUserDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  avatarUrl?: string | null;
  role?: string;
};

export type UpdateUserDto = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
  passwordConfirmation?: string;
  avatarUrl?: string | null;
  role?: string;
};

export type UserResponse = User;

