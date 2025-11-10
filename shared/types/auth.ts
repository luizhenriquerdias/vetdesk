import type { User } from './user';
import type { Tenant } from './tenant';

export type AuthResponse = {
  user: User;
  tenant: Tenant | null;
};
