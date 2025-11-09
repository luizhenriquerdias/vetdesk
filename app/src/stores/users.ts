import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import * as usersApi from '@/api/users';
import type { CreateUserDto, UpdateUserDto, UserResponse } from '@shared/types/user';

export const useUsersStore = defineStore('users', () => {
  const state = reactive({
    users: [] as UserResponse[],
    loading: false,
    showDeleted: false,
  });

  const fetchUsers = async () => {
    state.loading = true;
    try {
      state.users = await usersApi.list(state.showDeleted);
    } finally {
      state.loading = false;
    }
  };

  const createUser = async (data: CreateUserDto) => {
    const user = await usersApi.create(data);
    state.users.unshift(user);
    return user;
  };

  const updateUser = async (id: string, data: UpdateUserDto) => {
    const user = await usersApi.update(id, data);
    const index = state.users.findIndex((u) => u.id === id);
    if (index !== -1) {
      state.users[index] = user;
    }
    return user;
  };

  const deleteUser = async (id: string) => {
    await usersApi.remove(id);
    await fetchUsers();
  };

  const restoreUser = async (id: string) => {
    await usersApi.restore(id);
    await fetchUsers();
  };

  return {
    ...toRefs(state),
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
  };
});

