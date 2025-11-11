import type { User } from './user';
import type { Tenant } from './tenant';
import type { UserTenantRole } from './user-tenant';

export type AuthResponse = {
  user: User;
  tenant: Tenant | null;
  role: UserTenantRole | null;
};
