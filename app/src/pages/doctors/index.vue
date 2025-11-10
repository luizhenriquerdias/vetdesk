<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-muted-foreground">
          {{ doctorsStore.showDeleted ? 'Visualizar e restaurar médicos excluídos' : 'Gerenciar médicos' }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <ToggleGroup
          :model-value="doctorsStore.showDeleted ? 'deleted' : 'active'"
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
          :disabled="doctorsStore.showDeleted"
          @click="handleAddDoctor"
        >
          <Icon name="plus" />
          <span>Adicionar Médico</span>
        </Button>
      </div>
    </div>

    <Card class="p-0">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Especialidades</TableHead>
              <TableHead>CRM</TableHead>
              <TableHead>Preço da Consulta</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="doctor in doctorsStore.doctors"
              :key="doctor.id"
              :class="[
                doctorsStore.showDeleted ? 'opacity-60' : 'cursor-pointer',
              ]"
              @click="!doctorsStore.showDeleted && handleEditDoctor(doctor)"
            >
              <TableCell>
                <span :class="doctorsStore.showDeleted ? 'line-through' : ''">
                  {{ doctor.firstName }} {{ doctor.lastName }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="doctorsStore.showDeleted ? 'line-through' : ''">
                  {{ doctor.specialty || '-' }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="doctorsStore.showDeleted ? 'line-through' : ''">
                  {{ doctor.crm || '-' }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="doctorsStore.showDeleted ? 'line-through' : ''">
                  {{ formatCurrency(doctor.appointmentFee) }}
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
                      v-if="!doctorsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleEditDoctor(doctor)"
                    >
                      <Icon name="edit" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="!doctorsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleDeleteDoctor(doctor)"
                    >
                      <Icon name="trash" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="doctorsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleRestoreDoctor(doctor)"
                    >
                      <Icon name="rotate-ccw" />
                      <span>Restaurar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="doctorsStore.doctors.length === 0">
              <TableCell
                colspan="5"
                class="text-center text-muted-foreground"
              >
                Nenhum médico encontrado
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <DoctorFormModal
      v-model:open="isFormModalOpen"
      :doctor="selectedDoctor"
      @save="handleSaveDoctor"
    />

    <DeleteDoctorDialog
      v-model:open="isDeleteDialogOpen"
      :doctor="doctorToDelete"
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
import { useDoctorsStore } from '@/stores/doctors';
import type { DoctorResponse } from '@shared/types/doctor';
import DoctorFormModal from './DoctorFormModal/index.vue';
import DeleteDoctorDialog from './DeleteDoctorDialog/index.vue';

const doctorsStore = useDoctorsStore();

const isFormModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedDoctor = ref<DoctorResponse | null>(null);
const doctorToDelete = ref<DoctorResponse | null>(null);

onMounted(() => {
  doctorsStore.fetchDoctors();
});

const handleAddDoctor = () => {
  selectedDoctor.value = null;
  isFormModalOpen.value = true;
};

const handleEditDoctor = (doctor: DoctorResponse) => {
  selectedDoctor.value = doctor;
  isFormModalOpen.value = true;
};

const handleDeleteDoctor = (doctor: DoctorResponse) => {
  doctorToDelete.value = doctor;
  isDeleteDialogOpen.value = true;
};

const handleSaveDoctor = () => {
  isFormModalOpen.value = false;
  selectedDoctor.value = null;
};

const handleToggleView = async (showDeleted: boolean) => {
  doctorsStore.showDeleted = showDeleted;
  await doctorsStore.fetchDoctors();
};

const handleToggleViewValue = async (value: string) => {
  await handleToggleView(value === 'deleted');
};

const handleRestoreDoctor = async (doctor: DoctorResponse) => {
  await doctorsStore.restoreDoctor(doctor.id);
};

const handleConfirmDelete = async () => {
  if (doctorToDelete.value) {
    await doctorsStore.deleteDoctor(doctorToDelete.value.id);
    doctorToDelete.value = null;
  }
  isDeleteDialogOpen.value = false;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
</script>

