export const USER_TENANT_ROLE_ADMIN = 'admin' as const;
export const USER_TENANT_ROLE_USER = 'user' as const;
export const USER_TENANT_ROLE_DEV = 'dev' as const;

export type UserTenantRole = typeof USER_TENANT_ROLE_ADMIN | typeof USER_TENANT_ROLE_USER | typeof USER_TENANT_ROLE_DEV;

export type UserTenant = {
  userId: string;
  tenantId: string;
  role: UserTenantRole;
};

