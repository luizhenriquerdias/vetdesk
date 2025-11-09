export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

export type CreateUserDto = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation?: string;
  avatarUrl?: string | null;
};

export type UpdateUserDto = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
  passwordConfirmation?: string;
  avatarUrl?: string | null;
};

export type UserResponse = User;

