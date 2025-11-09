<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ user ? 'Edit User' : 'Create User' }}
        </DialogTitle>
        <DialogDescription>
          {{ user ? 'Update user information' : 'Add a new user to the system' }}
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="firstName">First Name</Label>
          <Input
            id="firstName"
            v-model="formData.firstName"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="lastName">Last Name</Label>
          <Input
            id="lastName"
            v-model="formData.lastName"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="formData.email"
            type="email"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="password">
            Password
            <span v-if="user" class="text-muted-foreground text-xs">(leave empty to keep current)</span>
          </Label>
          <Input
            id="password"
            v-model="formData.password"
            type="password"
            :required="!user"
          />
        </div>

        <div class="space-y-2">
          <Label for="avatarUrl">Avatar URL</Label>
          <Input
            id="avatarUrl"
            v-model="formData.avatarUrl"
            type="url"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">
            Cancel
          </Button>
          <Button type="submit" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save' }}
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
import type { UserResponse } from '@shared/types/user';

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
const loading = ref(false);

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  avatarUrl: '',
});

watch(() => props.user, (user) => {
  if (user) {
    formData.value = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      avatarUrl: user.avatarUrl || '',
    };
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      avatarUrl: '',
    };
  }
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      avatarUrl: '',
    };
  }
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    if (props.user) {
      const data: any = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        email: formData.value.email,
        avatarUrl: formData.value.avatarUrl || null,
      };
      if (formData.value.password) {
        data.password = formData.value.password;
      }
      await usersStore.updateUser(props.user.id, data);
    } else {
      const data = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        email: formData.value.email,
        password: formData.value.password,
        avatarUrl: formData.value.avatarUrl || null,
      };
      await usersStore.createUser(data);
    }

    emits('save');
  } catch (error) {
    console.error('Error saving user:', error);
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emits('update:open', false);
};
</script>

