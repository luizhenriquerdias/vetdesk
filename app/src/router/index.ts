import { createWebHistory, createRouter } from 'vue-router';
import InternalLayout from '@/layouts/internal/index.vue';
import ExternalLayout from '@/layouts/external/index.vue';
import HomePage from '@/pages/home/index.vue';
import LoginPage from '@/pages/login/index.vue';
import UsersPage from '@/pages/users/index.vue';
import DoctorsPage from '@/pages/doctors/index.vue';
import SpecialtiesPage from '@/pages/specialties/index.vue';
import { ROUTE_LOGIN, ROUTE_HOME, ROUTE_USERS, ROUTE_DOCTORS, ROUTE_SPECIALTIES } from './routes';
import { useAuthStore } from '@/stores/auth';

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
        {
          name: ROUTE_USERS,
          path: 'users',
          component: UsersPage,
        },
        {
          name: ROUTE_DOCTORS,
          path: 'doctors',
          component: DoctorsPage,
        },
        {
          name: ROUTE_SPECIALTIES,
          path: 'specialties',
          component: SpecialtiesPage,
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

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  while (authStore.initializing) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({ name: ROUTE_LOGIN });
      return;
    }
  }

  return next();
});

export { router };
