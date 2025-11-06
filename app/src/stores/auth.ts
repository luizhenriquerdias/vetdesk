import { defineStore } from 'pinia';
import { computed, reactive, toRefs } from 'vue';
import { login as loginApi } from '@/api/auth/login';
import { init as initApi } from '@/api/app';
import type { AuthResponse } from '@shared/types/auth';
import { useRouter } from 'vue-router';
import { ROUTE_LOGIN } from '@/router/routes';

export const useAuthStore = defineStore('auth', () => {
  const state = reactive({
    loading: false,
    authResponse: null as AuthResponse | null,
  });

  const router = useRouter();

  const user = computed(() => state.authResponse?.user);

  const isAuthenticated = computed(() => user.value !== null);

  const login = async (email: string, password: string) => {
    state.loading = true;
    const authResponse = await loginApi({ email, password });
    state.authResponse = authResponse;
    state.loading = false;
  };

  const init = async () => {
    state.loading = true;
    const authResponse = await initApi();
    state.authResponse = authResponse;
    state.loading = false;
  };

  const logout = () => {
    state.authResponse = null;
    router.push({ name: ROUTE_LOGIN });
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

