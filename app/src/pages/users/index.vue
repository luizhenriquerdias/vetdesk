<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-muted-foreground">
          {{ usersStore.showDeleted ? 'Visualizar e restaurar usuários excluídos' : 'Gerenciar usuários' }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <ToggleGroup
          :model-value="usersStore.showDeleted ? 'deleted' : 'active'"
          @update:model-value="handleToggleViewValue"
        >
          <ToggleGroupItem value="active">
            Ativo
          </ToggleGroupItem>
          <ToggleGroupItem value="deleted">
            Excluído
          </ToggleGroupItem>
        </ToggleGroup>
        <Button
          :disabled="usersStore.showDeleted"
          @click="handleAddUser"
        >
          <Icon name="plus" />
          <span>Adicionar Usuário</span>
        </Button>
      </div>
    </div>

    <Card class="p-0">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="user in usersStore.users"
              :key="user.id"
              :class="[
                usersStore.showDeleted ? 'opacity-60' : 'cursor-pointer',
              ]"
              @click="!usersStore.showDeleted && handleEditUser(user)"
            >
              <TableCell>
                <span :class="usersStore.showDeleted ? 'line-through' : ''">
                  {{ user.firstName }} {{ user.lastName }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="usersStore.showDeleted ? 'line-through' : ''">
                  {{ user.email }}
                </span>
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
                  <TooltipProvider>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        v-if="!usersStore.showDeleted"
                        class="flex items-center gap-2"
                        @click="handleEditUser(user)"
                      >
                        <Icon name="edit" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <Tooltip
                        v-if="!usersStore.showDeleted && user.id === authStore.user?.id"
                      >
                        <TooltipTrigger as-child>
                          <div class="w-full">
                            <DropdownMenuItem
                              class="flex items-center gap-2 w-full"
                              :disabled="true"
                              @click.stop
                            >
                              <Icon name="trash" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Você não pode excluir sua própria conta</p>
                        </TooltipContent>
                      </Tooltip>
                      <DropdownMenuItem
                        v-if="!usersStore.showDeleted && user.id !== authStore.user?.id"
                        class="flex items-center gap-2"
                        @click="handleDeleteUser(user)"
                      >
                        <Icon name="trash" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-if="usersStore.showDeleted"
                        class="flex items-center gap-2"
                        @click="handleRestoreUser(user)"
                      >
                        <Icon name="rotate-ccw" />
                        <span>Restaurar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </TooltipProvider>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="usersStore.users.length === 0">
              <TableCell
                colspan="3"
                class="text-center text-muted-foreground"
              >
                Nenhum usuário encontrado
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUsersStore } from '@/stores/users';
import { useAuthStore } from '@/stores/auth';
import type { UserResponse } from '@shared/types/user';
import UserFormModal from './UserFormModal/index.vue';
import DeleteUserDialog from './DeleteUserDialog/index.vue';

const usersStore = useUsersStore();
const authStore = useAuthStore();

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

const handleToggleView = async (showDeleted: boolean) => {
  usersStore.showDeleted = showDeleted;
  await usersStore.fetchUsers();
};

const handleToggleViewValue = async (value: string) => {
  await handleToggleView(value === 'deleted');
};

const handleRestoreUser = async (user: UserResponse) => {
  await usersStore.restoreUser(user.id);
};

const handleConfirmDelete = async () => {
  if (userToDelete.value) {
    await usersStore.deleteUser(userToDelete.value.id);
    userToDelete.value = null;
  }
  isDeleteDialogOpen.value = false;
};
</script>

