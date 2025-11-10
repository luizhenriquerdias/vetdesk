<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ user ? 'Editar Usuário' : 'Criar Usuário' }}
        </DialogTitle>
        <DialogDescription>
          {{ user ? 'Atualizar informações do usuário' : 'Adicionar um novo usuário ao sistema' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <Label for="firstName">Nome</Label>
          <Input
            id="firstName"
            v-model="formData.firstName"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="lastName">Sobrenome</Label>
          <Input
            id="lastName"
            v-model="formData.lastName"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="email">E-mail</Label>
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            required
          />
        </div>

        <div
          v-if="!user"
          class="space-y-2"
        >
          <Label for="password">Senha</Label>
          <Input
            id="password"
            v-model="formData.password"
            type="password"
            required
          />
        </div>

        <div
          v-if="!user"
          class="space-y-2"
        >
          <Label for="passwordConfirmation">Confirmar Senha</Label>
          <Input
            id="passwordConfirmation"
            v-model="formData.passwordConfirmation"
            type="password"
            required
          />
        </div>

        <template v-if="user">
          <div
            v-if="isChangingPassword"
            class="space-y-2"
          >
            <Label for="oldPassword">Senha Antiga</Label>
            <Input
              id="oldPassword"
              v-model="formData.oldPassword"
              type="password"
              required
            />
          </div>

          <div
            v-if="isChangingPassword"
            class="space-y-2"
          >
            <Label for="password">Nova Senha</Label>
            <Input
              id="password"
              v-model="formData.password"
              type="password"
              required
            />
          </div>

          <div
            v-if="isChangingPassword"
            class="space-y-2"
          >
            <Label for="passwordConfirmation">Confirmar Nova Senha</Label>
            <Input
              id="passwordConfirmation"
              v-model="formData.passwordConfirmation"
              type="password"
              required
            />
          </div>

          <div
            v-if="!isChangingPassword"
            class="space-y-2"
          >
            <Button
              type="button"
              variant="outline"
              @click="isChangingPassword = true"
            >
              Alterar Senha
            </Button>
          </div>
        </template>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :disabled="saving"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsersStore } from '@/stores/users';
import type { CreateUserDto, UpdateUserDto, UserResponse } from '@shared/types/user';

interface Props {
  open: boolean
  user?: UserResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  save: []
}>();

const usersStore = useUsersStore();

const saving = ref(false);
const isChangingPassword = ref(false);

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  oldPassword: '',
});

watch(() => props.user, (user) => {
  if (user) {
    formData.value = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      passwordConfirmation: '',
      oldPassword: '',
    };
    isChangingPassword.value = false;
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      oldPassword: '',
    };
    isChangingPassword.value = false;
  }
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      oldPassword: '',
    };
    isChangingPassword.value = false;
  }
});

const handleSubmit = async () => {
  if (!props.user) {
    if (formData.value.password !== formData.value.passwordConfirmation) {
      alert('A senha e a confirmação não coincidem');
      return;
    }
  } else if (isChangingPassword.value) {
    if (!formData.value.oldPassword || !formData.value.password || !formData.value.passwordConfirmation) {
      alert('Todos os campos de senha são obrigatórios ao alterar a senha');
      return;
    }
    if (formData.value.password !== formData.value.passwordConfirmation) {
      alert('A nova senha e a confirmação não coincidem');
      return;
    }
  }

  saving.value = true;
  try {
    if (!props.user) {
      const data: CreateUserDto = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        email: formData.value.email,
        password: formData.value.password,
        passwordConfirmation: formData.value.passwordConfirmation,
      };
      await usersStore.createUser(data);
      return;
    }

    const data: UpdateUserDto = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
    };
    if (isChangingPassword.value) {
      data.password = formData.value.password;
      data.oldPassword = formData.value.oldPassword;
      data.passwordConfirmation = formData.value.passwordConfirmation;
    }
    await usersStore.updateUser(props.user.id, data);

    emits('save');
  } catch (error) {
    console.error('Error saving user:', error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emits('update:open', false);
};
</script>

