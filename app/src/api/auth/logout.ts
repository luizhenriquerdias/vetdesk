import { api } from '@/api';

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

