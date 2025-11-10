import { api } from '@/api';
import type { AuthResponse } from '@shared/types/auth';

interface SwitchTenantRequest {
  tenantId: string;
}

export const switchTenant = async (data: SwitchTenantRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/switch-tenant', data);
  return response.data;
};

