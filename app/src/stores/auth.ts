import { defineStore } from 'pinia';
import { computed, reactive, toRefs } from 'vue';
import { login as loginApi } from '@/api/auth/login';
import { logout as logoutApi } from '@/api/auth/logout';
import { init as initApi } from '@/api/app';
import type { AuthResponse } from '@shared/types/auth';
import { useRouter } from 'vue-router';
import { ROUTE_LOGIN } from '@/router/routes';

export const useAuthStore = defineStore('auth', () => {
  const state = reactive({
    initializing: false,
    authResponse: null as AuthResponse | null,
  });

  const router = useRouter();

  const user = computed(() => state.authResponse?.user);

  const isAuthenticated = computed(() => user.value !== null);

  const login = async (email: string, password: string) => {
    const authResponse = await loginApi({ email, password });
    state.authResponse = authResponse;
  };

  const init = async () => {
    state.initializing = true;
    try {
      const authResponse = await initApi();
      state.authResponse = authResponse;
    } finally {
      state.initializing = false;
    }
  };

  const logout = async () => {
    await logoutApi();
    state.authResponse = null;

    if (router.currentRoute.value.name !== ROUTE_LOGIN) {
      router.push({ name: ROUTE_LOGIN });
    }
  };

  return {
    ...toRefs(state),

    user,
    isAuthenticated,
    login,
    init,
    logout,
  };
});

