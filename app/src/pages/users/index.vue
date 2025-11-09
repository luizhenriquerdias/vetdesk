<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">
          Users
        </h1>
        <p class="text-muted-foreground">
          Manage users
        </p>
      </div>
      <Button @click="handleAddUser">
        <Icon name="plus" />
        <span>Add User</span>
      </Button>
    </div>

    <Card class="p-0">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="user in usersStore.users"
              :key="user.id"
              class="cursor-pointer"
              @click="handleEditUser(user)"
            >
              <TableCell>
                {{ user.firstName }} {{ user.lastName }}
              </TableCell>
              <TableCell>
                {{ user.email }}
              </TableCell>
              <TableCell @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Icon name="more-vertical" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      class="flex items-center gap-2"
                      @click="handleEditUser(user)"
                    >
                      <Icon name="edit" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="flex items-center gap-2"
                      @click="handleDeleteUser(user)"
                    >
                      <Icon name="trash" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="usersStore.users.length === 0">
              <TableCell
                colspan="3"
                class="text-center text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <UserFormModal
      v-model:open="isFormModalOpen"
      :user="selectedUser"
      @save="handleSaveUser"
    />

    <DeleteUserDialog
      v-model:open="isDeleteDialogOpen"
      :user="userToDelete"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsersStore } from '@/stores/users';
import type { UserResponse } from '@shared/types/user';
import UserFormModal from '@/components/UserFormModal.vue';
import DeleteUserDialog from '@/components/DeleteUserDialog.vue';

const usersStore = useUsersStore();

const isFormModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedUser = ref<UserResponse | null>(null);
const userToDelete = ref<UserResponse | null>(null);

onMounted(() => {
  usersStore.fetchUsers();
});

const handleAddUser = () => {
  selectedUser.value = null;
  isFormModalOpen.value = true;
};

const handleEditUser = (user: UserResponse) => {
  selectedUser.value = user;
  isFormModalOpen.value = true;
};

const handleDeleteUser = (user: UserResponse) => {
  userToDelete.value = user;
  isDeleteDialogOpen.value = true;
};

const handleSaveUser = () => {
  isFormModalOpen.value = false;
  selectedUser.value = null;
};

const handleConfirmDelete = async () => {
  if (userToDelete.value) {
    await usersStore.deleteUser(userToDelete.value.id);
    userToDelete.value = null;
  }
  isDeleteDialogOpen.value = false;
};
</script>

