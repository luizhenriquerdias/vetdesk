<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-muted-foreground">
          {{ specialtiesStore.showDeleted ? 'View and restore deleted specialties' : 'Manage specialties' }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <ToggleGroup
          :model-value="specialtiesStore.showDeleted ? 'deleted' : 'active'"
          @update:model-value="handleToggleViewValue"
        >
          <ToggleGroupItem value="active">
            Active
          </ToggleGroupItem>
          <ToggleGroupItem value="deleted">
            Deleted
          </ToggleGroupItem>
        </ToggleGroup>
        <Button
          :disabled="specialtiesStore.showDeleted"
          @click="handleAddSpecialty"
        >
          <Icon name="plus" />
          <span>Add Specialty</span>
        </Button>
      </div>
    </div>

    <Card class="p-0">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Appointment Fee</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="specialty in specialtiesStore.specialties"
              :key="specialty.id"
              :class="[
                specialtiesStore.showDeleted ? 'opacity-60' : 'cursor-pointer',
              ]"
              @click="!specialtiesStore.showDeleted && handleEditSpecialty(specialty)"
            >
              <TableCell>
                <span :class="specialtiesStore.showDeleted ? 'line-through' : ''">
                  {{ specialty.name }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="specialtiesStore.showDeleted ? 'line-through' : ''">
                  {{ formatCurrency(specialty.appointmentFee) }}
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
                      v-if="!specialtiesStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleEditSpecialty(specialty)"
                    >
                      <Icon name="edit" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="!specialtiesStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleDeleteSpecialty(specialty)"
                    >
                      <Icon name="trash" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="specialtiesStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleRestoreSpecialty(specialty)"
                    >
                      <Icon name="rotate-ccw" />
                      <span>Restore</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="specialtiesStore.specialties.length === 0">
              <TableCell
                colspan="3"
                class="text-center text-muted-foreground"
              >
                No specialties found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <SpecialtyFormModal
      v-model:open="isFormModalOpen"
      :specialty="selectedSpecialty"
      @save="handleSaveSpecialty"
    />

    <DeleteSpecialtyDialog
      v-model:open="isDeleteDialogOpen"
      :specialty="specialtyToDelete"
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
import { useSpecialtiesStore } from '@/stores/specialties';
import type { SpecialtyResponse } from '@shared/types/specialty';
import SpecialtyFormModal from './SpecialtyFormModal/index.vue';
import DeleteSpecialtyDialog from './DeleteSpecialtyDialog/index.vue';

const specialtiesStore = useSpecialtiesStore();

const isFormModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedSpecialty = ref<SpecialtyResponse | null>(null);
const specialtyToDelete = ref<SpecialtyResponse | null>(null);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

onMounted(() => {
  specialtiesStore.fetchSpecialties();
});

const handleAddSpecialty = () => {
  selectedSpecialty.value = null;
  isFormModalOpen.value = true;
};

const handleEditSpecialty = (specialty: SpecialtyResponse) => {
  selectedSpecialty.value = specialty;
  isFormModalOpen.value = true;
};

const handleDeleteSpecialty = (specialty: SpecialtyResponse) => {
  specialtyToDelete.value = specialty;
  isDeleteDialogOpen.value = true;
};

const handleSaveSpecialty = () => {
  isFormModalOpen.value = false;
  selectedSpecialty.value = null;
};

const handleToggleView = async (showDeleted: boolean) => {
  specialtiesStore.showDeleted = showDeleted;
  await specialtiesStore.fetchSpecialties();
};

const handleToggleViewValue = async (value: string) => {
  await handleToggleView(value === 'deleted');
};

const handleRestoreSpecialty = async (specialty: SpecialtyResponse) => {
  await specialtiesStore.restoreSpecialty(specialty.id);
};

const handleConfirmDelete = async () => {
  if (specialtyToDelete.value) {
    await specialtiesStore.deleteSpecialty(specialtyToDelete.value.id);
    specialtyToDelete.value = null;
  }
  isDeleteDialogOpen.value = false;
};
</script>

