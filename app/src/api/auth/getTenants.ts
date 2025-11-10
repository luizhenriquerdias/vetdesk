import { api } from '@/api';
import type { Tenant } from '@shared/types/tenant';

export const getTenants = async (): Promise<Tenant[]> => {
  const response = await api.get<Tenant[]>('/auth/tenants');
  return response.data;
};

