<template>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <div class="flex items-center gap-2 self-center font-medium">
        <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Icon
            name="galleryVerticalEnd"
            :size="4"
          />
        </div>
        VetDesk
      </div>

      <Card>
        <CardContent>
          <form @submit.prevent="login">
            <div class="grid gap-6">
              <div class="grid gap-3">
                <Label for="email">E-mail</Label>
                <Input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  required
                />
              </div>
              <div class="grid gap-3">
                <Label for="password">Senha</Label>
                <Input
                  id="password"
                  v-model="password"
                  type="password"
                  required
                />
              </div>
              <Button
                type="submit"
                class="w-full"
                :disabled="loading"
              >
                {{ loading ? 'Entrando...' : 'Entrar' }}
              </Button>
              <div
                v-if="error"
                class="text-sm text-red-500"
              >
                {{ error }}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTE_HOME } from '@/router/routes';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const login = async () => {
  error.value = '';
  loading.value = true;

  try {
    await authStore.login(email.value, password.value);
    router.push({ name: ROUTE_HOME });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ocorreu um erro';
  } finally {
    loading.value = false;
  }
};
</script>
