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
              <div class="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent border">
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
                <span
                  v-if="authStore.currentTenant"
                  class="text-xs text-muted-foreground"
                >
                  {{ authStore.currentTenant.name }}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <template v-if="authStore.availableTenants.length > 1">
              <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Trocar Clínica
              </div>
              <DropdownMenuItem
                v-for="tenant in authStore.availableTenants"
                :key="tenant.id"
                class="flex items-center gap-2 cursor-pointer"
                :class="{ 'bg-accent': tenant.id === authStore.currentTenant?.id }"
                @click="handleSwitchTenant(tenant.id)"
              >
                <Icon name="building" />
                <span>{{ tenant.name }}</span>
              </DropdownMenuItem>
              <div class="border-t my-1" />
            </template>
            <DropdownMenuItem
              class="flex items-center gap-2 cursor-pointer"
              @click="handleLogout"
            >
              <Icon name="logout" />
              <span>Sair</span>
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
import AppSidebar from './AppSidebar/index.vue';
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
import { ROUTE_HOME, ROUTE_USERS, ROUTE_DOCTORS, ROUTE_SPECIALTIES, ROUTE_TRANSACTIONS, ROUTE_APPOINTMENTS, ROUTE_REPORTS_DOCTORS, ROUTE_REPORTS_TRANSACTIONS } from '@/router/routes';
import { useUsersStore } from '@/stores/users';
import { useDoctorsStore } from '@/stores/doctors';
import { useSpecialtiesStore } from '@/stores/specialties';
import { useTransactionsStore } from '@/stores/transactions';
import { useAppointmentsStore } from '@/stores/appointments';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();

const authStore = useAuthStore();
const usersStore = useUsersStore();
const doctorsStore = useDoctorsStore();
const specialtiesStore = useSpecialtiesStore();
const transactionsStore = useTransactionsStore();
const appointmentsStore = useAppointmentsStore();

const pageTitle = computed(() => {
  const routeName = route.name;

  switch (routeName) {
    case ROUTE_HOME:
      return 'Início';
    case ROUTE_USERS:
      return usersStore.showDeleted ? 'Usuários Excluídos' : 'Usuários';
    case ROUTE_DOCTORS:
      return doctorsStore.showDeleted ? 'Médicos Excluídos' : 'Médicos';
    case ROUTE_SPECIALTIES:
      return specialtiesStore.showDeleted ? 'Especialidades Excluídas' : 'Especialidades';
    case ROUTE_TRANSACTIONS:
      return transactionsStore.showDeleted ? 'Transações Excluídas' : 'Transações';
    case ROUTE_APPOINTMENTS:
      return appointmentsStore.showDeleted ? 'Consultas Excluídas' : 'Consultas';
    case ROUTE_REPORTS_DOCTORS:
      return 'Relatório de Médicos';
    case ROUTE_REPORTS_TRANSACTIONS:
      return 'Transações Consolidadas';
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

const handleSwitchTenant = async (tenantId: string) => {
  if (tenantId === authStore.currentTenant?.id) {
    return;
  }
  await authStore.switchTenant(tenantId);
  window.location.reload();
};
</script>

