import { createWebHistory, createRouter } from 'vue-router';
import InternalLayout from '@/layouts/internal/index.vue';
import ExternalLayout from '@/layouts/external/index.vue';
import HomePage from '@/pages/home/index.vue';
import LoginPage from '@/pages/login/index.vue';
import { ROUTE_LOGIN, ROUTE_HOME } from './routes';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
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
    {
      path: '/',
      component: InternalLayout,
      children: [
        {
          name: ROUTE_HOME,
          path: '',
          component: HomePage,
        },
      ],
    },
  ],
});
