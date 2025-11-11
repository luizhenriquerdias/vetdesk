import { defineStore } from 'pinia';
import { computed, reactive, toRefs } from 'vue';
import { login as loginApi } from '@/api/auth/login';
import { logout as logoutApi } from '@/api/auth/logout';
import { init as initApi } from '@/api/app';
import { switchTenant as switchTenantApi } from '@/api/auth/switchTenant';
import { getTenants as getTenantsApi } from '@/api/auth/getTenants';
import type { AuthResponse } from '@shared/types/auth';
import type { Tenant } from '@shared/types/tenant';
import { useRouter } from 'vue-router';
import { ROUTE_LOGIN } from '@/router/routes';
import { isAdminOrDev as checkIsAdminOrDev } from '@shared/utils/role';

export const useAuthStore = defineStore('auth', () => {
  const state = reactive({
    initializing: false,
    authResponse: null as AuthResponse | null,
    availableTenants: [] as Tenant[],
  });

  const router = useRouter();

  const user = computed(() => state.authResponse?.user);
  const currentTenant = computed(() => state.authResponse?.tenant ?? null);
  const isAuthenticated = computed(() => user.value !== null);
  const isAdminOrDev = computed(() => checkIsAdminOrDev(state.authResponse?.role ?? null));

  const login = async (email: string, password: string) => {
    const authResponse = await loginApi({ email, password });
    state.authResponse = authResponse;
    await fetchAvailableTenants();
  };

  const init = async () => {
    state.initializing = true;
    try {
      const authResponse = await initApi();
      state.authResponse = authResponse;
      if (authResponse.user) {
        await fetchAvailableTenants();
      }
    } finally {
      state.initializing = false;
    }
  };

  const logout = async () => {
    await logoutApi();
    state.authResponse = null;
    state.availableTenants = [];

    if (router.currentRoute.value.name !== ROUTE_LOGIN) {
      router.push({ name: ROUTE_LOGIN });
    }
  };

  const switchTenant = async (tenantId: string) => {
    const authResponse = await switchTenantApi({ tenantId });
    state.authResponse = authResponse;
  };

  const fetchAvailableTenants = async () => {
    try {
      const tenants = await getTenantsApi();
      state.availableTenants = tenants;
    } catch (_error) {
      state.availableTenants = [];
    }
  };

  return {
    ...toRefs(state),

    user,
    currentTenant,
    isAuthenticated,
    isAdminOrDev,
    login,
    init,
    logout,
    switchTenant,
    fetchAvailableTenants,
  };
});

