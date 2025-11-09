<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center justify-between gap-4 px-4">
        <div class="flex items-center gap-4">
          <SidebarTrigger />
          <h1 class="text-2xl font-semibold">
            {{ pageTitle }}
          </h1>
        </div>
        <DropdownMenu v-if="authStore.user">
          <DropdownMenuTrigger as-child>
            <button class="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
                <img
                  v-if="authStore.user.avatarUrl"
                  :src="authStore.user.avatarUrl"
                  :alt="`${authStore.user.firstName} ${authStore.user.lastName}`"
                  class="h-full w-full rounded-full object-cover"
                >
                <span
                  v-else
                  class="text-sm font-medium text-sidebar-accent-foreground"
                >
                  {{ userInitials }}
                </span>
              </div>
              <div class="flex flex-col items-start">
                <span class="text-sm font-medium">
                  {{ authStore.user.firstName }} {{ authStore.user.lastName }}
                </span>
                <span class="text-xs text-muted-foreground">
                  {{ authStore.user.email }}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              class="flex items-center gap-2 cursor-pointer"
              @click="handleLogout"
            >
              <Icon name="logout" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4">
        <RouterView />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from '@/components/AppSidebar.vue';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { ROUTE_HOME, ROUTE_USERS, ROUTE_DOCTORS, ROUTE_SPECIALTIES, ROUTE_TRANSACTIONS } from '@/router/routes';
import { useUsersStore } from '@/stores/users';
import { useDoctorsStore } from '@/stores/doctors';
import { useSpecialtiesStore } from '@/stores/specialties';
import { useTransactionsStore } from '@/stores/transactions';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();

const authStore = useAuthStore();
const usersStore = useUsersStore();
const doctorsStore = useDoctorsStore();
const specialtiesStore = useSpecialtiesStore();
const transactionsStore = useTransactionsStore();

const pageTitle = computed(() => {
  const routeName = route.name;

  switch (routeName) {
    case ROUTE_HOME:
      return 'Home';
    case ROUTE_USERS:
      return usersStore.showDeleted ? 'Deleted Users' : 'Users';
    case ROUTE_DOCTORS:
      return doctorsStore.showDeleted ? 'Deleted Doctors' : 'Doctors';
    case ROUTE_SPECIALTIES:
      return specialtiesStore.showDeleted ? 'Deleted Specialties' : 'Specialties';
    case ROUTE_TRANSACTIONS:
      return transactionsStore.showDeleted ? 'Deleted Transactions' : 'Transactions';
    default:
      return '';
  }
});

const userInitials = computed(() => {
  if (!authStore.user) {
    return '';
  }
  const first = authStore.user.firstName.charAt(0).toUpperCase();
  const last = authStore.user.lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
});

const handleLogout = async () => {
  await authStore.logout();
};
</script>

