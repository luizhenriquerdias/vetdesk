import './style.css';

import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { createPinia } from 'pinia';
import { setupApiInterceptors } from './api';
import { useAuthStore } from './stores/auth';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

setupApiInterceptors(() => {
  const authStore = useAuthStore();
  authStore.logout();
});

app.mount('#app');
