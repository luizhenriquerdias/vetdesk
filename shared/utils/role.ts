import type { UserTenantRole } from '../types/user-tenant';
import { USER_TENANT_ROLE_ADMIN, USER_TENANT_ROLE_DEV } from '../types/user-tenant';

export const isAdminOrDev = (role: UserTenantRole | null): boolean => {
  return role === USER_TENANT_ROLE_ADMIN || role === USER_TENANT_ROLE_DEV;
};

