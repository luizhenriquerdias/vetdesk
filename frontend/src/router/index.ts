import { createMemoryHistory, createRouter } from 'vue-router';
import InternalLayout from '@/layouts/internal/index.vue';
import HomePage from '@/pages/home/index.vue';

export const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/',
      component: InternalLayout,
      children: [
        { path: '/', component: HomePage },
      ] },
  ],
});
