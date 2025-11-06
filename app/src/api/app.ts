import { api } from '@/api';
import type { AuthResponse } from '@shared/types/auth';

export const init = async (): Promise<AuthResponse> => {
  const response = await api.get<AuthResponse>('/init');
  return response.data;
};

