<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ user ? 'Edit User' : 'Create User' }}
        </DialogTitle>
        <DialogDescription>
          {{ user ? 'Update user information' : 'Add a new user to the system' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
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

        <div
          v-if="!user"
          class="space-y-2"
        >
          <Label for="password">Password</Label>
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
          <Label for="passwordConfirmation">Confirm Password</Label>
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
            <Label for="oldPassword">Old Password</Label>
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
            <Label for="password">New Password</Label>
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
            <Label for="passwordConfirmation">Confirm New Password</Label>
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
              Change Password
            </Button>
          </div>
        </template>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save' }}
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
      alert('Password and confirmation do not match');
      return;
    }
  } else if (isChangingPassword.value) {
    if (!formData.value.oldPassword || !formData.value.password || !formData.value.passwordConfirmation) {
      alert('All password fields are required when changing password');
      return;
    }
    if (formData.value.password !== formData.value.passwordConfirmation) {
      alert('New password and confirmation do not match');
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

