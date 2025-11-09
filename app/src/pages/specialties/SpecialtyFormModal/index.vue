<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ specialty ? 'Edit Specialty' : 'Create Specialty' }}
        </DialogTitle>
        <DialogDescription>
          {{ specialty ? 'Update specialty information' : 'Add a new specialty to the system' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="formData.name"
            :disabled="!!specialty"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="appointmentFee">Appointment Fee</Label>
          <Input
            id="appointmentFee"
            :model-value="formattedFee"
            type="text"
            placeholder="R$ 0,00"
            required
            @input="handleFeeInput"
            @blur="handleFeeBlur"
          />
        </div>

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
import { useSpecialtiesStore } from '@/stores/specialties';
import type { CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyResponse } from '@shared/types/specialty';

interface Props {
  open: boolean
  specialty?: SpecialtyResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  specialty: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  save: []
}>();

const specialtiesStore = useSpecialtiesStore();

const saving = ref(false);

const formData = ref({
  name: '',
  appointmentFee: 0,
});

const formattedFee = ref('');

const formatCurrency = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined || value === 0) {
    return '';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const handleFeeInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  const cleaned = value.replace(/\D/g, '');

  if (cleaned === '') {
    formattedFee.value = '';
    formData.value.appointmentFee = 0;
    return;
  }

  const numericValue = parseInt(cleaned, 10) / 100;
  formData.value.appointmentFee = numericValue;
  formattedFee.value = formatCurrency(numericValue);
};

const handleFeeBlur = () => {
  if (formData.value.appointmentFee > 0) {
    formattedFee.value = formatCurrency(formData.value.appointmentFee);
  } else {
    formattedFee.value = '';
    formData.value.appointmentFee = 0;
  }
};

watch(() => props.specialty, (specialty) => {
  if (specialty) {
    formData.value = {
      name: specialty.name,
      appointmentFee: specialty.appointmentFee,
    };
    formattedFee.value = formatCurrency(specialty.appointmentFee);
  } else {
    formData.value = {
      name: '',
      appointmentFee: 0,
    };
    formattedFee.value = '';
  }
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      name: '',
      appointmentFee: 0,
    };
    formattedFee.value = '';
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    if (!props.specialty) {
      const data: CreateSpecialtyDto = {
        name: formData.value.name.trim(),
        appointmentFee: formData.value.appointmentFee,
      };
      await specialtiesStore.createSpecialty(data);
    } else {
      const data: UpdateSpecialtyDto = {
        appointmentFee: formData.value.appointmentFee,
      };
      await specialtiesStore.updateSpecialty(props.specialty.id, data);
    }

    emits('save');
  } catch (error) {
    console.error('Error saving specialty:', error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emits('update:open', false);
};
</script>

