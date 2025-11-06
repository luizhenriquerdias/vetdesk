import { api } from '@/api';
import type { AuthResponse } from '@shared/types/auth';

interface LoginRequest {
  email: string;
  password: string;
}

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

