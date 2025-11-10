<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <MonthPicker
          v-model="appointmentsStore.selectedMonth"
          @update:model-value="handleMonthChange"
        />
      </div>
      <div class="flex items-center gap-4">
        <ToggleGroup
          :model-value="appointmentsStore.showDeleted ? 'deleted' : 'active'"
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
          :disabled="appointmentsStore.showDeleted"
          @click="handleAddAppointment"
        >
          <Icon name="plus" />
          <span>Registrar Consulta</span>
        </Button>
      </div>
    </div>

    <Card class="p-0">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Médico</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>% Profissional</TableHead>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="appointment in appointmentsStore.appointments"
              :key="appointment.id"
              :class="[
                appointmentsStore.showDeleted ? 'opacity-60' : 'cursor-pointer',
              ]"
              @click="!appointmentsStore.showDeleted && handleEditAppointment(appointment)"
            >
              <TableCell>
                <span :class="appointmentsStore.showDeleted ? 'line-through' : ''">
                  {{ getDoctorName(appointment.doctorId) }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="appointmentsStore.showDeleted ? 'line-through' : ''">
                  {{ formatCurrency(appointment.fee) }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="appointmentsStore.showDeleted ? 'line-through' : ''">
                  {{ appointment.percProfessional.toFixed(1) }}%
                </span>
              </TableCell>
              <TableCell>
                <span :class="appointmentsStore.showDeleted ? 'line-through' : ''">
                  {{ formatDateTime(appointment.datetime) }}
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
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      v-if="!appointmentsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleEditAppointment(appointment)"
                    >
                      <Icon name="edit" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="!appointmentsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleDeleteAppointment(appointment)"
                    >
                      <Icon name="trash" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="appointmentsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleRestoreAppointment(appointment)"
                    >
                      <Icon name="rotate-ccw" />
                      <span>Restaurar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="appointmentsStore.appointments.length === 0">
              <TableCell
                colspan="5"
                class="text-center text-muted-foreground"
              >
                Nenhuma consulta encontrada
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AppointmentFormModal
      v-model:open="isFormModalOpen"
      :appointment="selectedAppointment"
      @save="handleSaveAppointment"
    />

    <DeleteAppointmentDialog
      v-model:open="isDeleteDialogOpen"
      :appointment="appointmentToDelete"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { MonthPicker } from '@/components/month-picker';
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
import { useAppointmentsStore } from '@/stores/appointments';
import { useDoctorsStore } from '@/stores/doctors';
import type { AppointmentResponse } from '@shared/types/appointment';
import AppointmentFormModal from './AppointmentFormModal/index.vue';
import DeleteAppointmentDialog from './DeleteAppointmentDialog/index.vue';

const appointmentsStore = useAppointmentsStore();
const doctorsStore = useDoctorsStore();

const isFormModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedAppointment = ref<AppointmentResponse | null>(null);
const appointmentToDelete = ref<AppointmentResponse | null>(null);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDateTime = (datetime: string): string => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getDoctorName = (doctorId: string): string => {
  const doctor = doctorsStore.doctors.find((d) => d.id === doctorId);
  if (!doctor) {
    return '-';
  }
  return `${doctor.firstName} ${doctor.lastName}`;
};

onMounted(async () => {
  await doctorsStore.fetchDoctors();
  await appointmentsStore.fetchAppointments();
});

const handleAddAppointment = () => {
  selectedAppointment.value = null;
  isFormModalOpen.value = true;
};

const handleEditAppointment = (appointment: AppointmentResponse) => {
  selectedAppointment.value = appointment;
  isFormModalOpen.value = true;
};

const handleDeleteAppointment = (appointment: AppointmentResponse) => {
  appointmentToDelete.value = appointment;
  isDeleteDialogOpen.value = true;
};

const handleSaveAppointment = () => {
  isFormModalOpen.value = false;
  selectedAppointment.value = null;
};

const handleToggleView = async (showDeleted: boolean) => {
  appointmentsStore.showDeleted = showDeleted;
  await appointmentsStore.fetchAppointments();
};

const handleToggleViewValue = async (value: string) => {
  await handleToggleView(value === 'deleted');
};

const handleMonthChange = async () => {
  await appointmentsStore.fetchAppointments();
};

const handleRestoreAppointment = async (appointment: AppointmentResponse) => {
  await appointmentsStore.restoreAppointment(appointment.id);
};

const handleConfirmDelete = async () => {
  if (appointmentToDelete.value) {
    await appointmentsStore.deleteAppointment(appointmentToDelete.value.id);
    appointmentToDelete.value = null;
  }
  isDeleteDialogOpen.value = false;
};
</script>
