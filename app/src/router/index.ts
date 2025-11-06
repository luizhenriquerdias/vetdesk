import { createWebHistory, createRouter } from 'vue-router';
import InternalLayout from '@/layouts/internal/index.vue';
import ExternalLayout from '@/layouts/external/index.vue';
import HomePage from '@/pages/home/index.vue';
import LoginPage from '@/pages/login/index.vue';
import { ROUTE_LOGIN, ROUTE_HOME } from './routes';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: InternalLayout,
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          name: ROUTE_HOME,
          path: '',
          component: HomePage,
        },
      ],
    },
    {
      path: '/',
      component: ExternalLayout,
      children: [
        {
          name: ROUTE_LOGIN,
          path: 'login',
          component: LoginPage,
        },
      ],
    },
  ],
});

router.beforeEach((to, _, next) => {
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: ROUTE_LOGIN });
    }
  }

  return next();
});

export { router };
