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
          <CurrencyInput
            id="appointmentFee"
            v-model="formData.appointmentFee"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="percProfessional">Payment Percentage</Label>
          <div class="space-y-2">
            <Slider
              id="percProfessional"
              v-model="percProfessionalValue"
              :min="0"
              :max="100"
              :step="1"
              required
            />
            <div class="flex justify-between text-sm text-muted-foreground">
              <span>Professional ({{ (percProfessionalValue[0] ?? 0).toFixed(0) }}%)</span>
              <span class="flex-1" />
              <span>Clinic ({{ (100 - (percProfessionalValue[0] ?? 0)).toFixed(0) }}%)</span>
            </div>
          </div>
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
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
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
  percProfessional: 80,
});

const percProfessionalValue = ref([80]);

watch(() => props.specialty, (specialty) => {
  if (specialty) {
    formData.value = {
      name: specialty.name,
      appointmentFee: specialty.appointmentFee,
      percProfessional: specialty.percProfessional,
    };
    percProfessionalValue.value = [specialty.percProfessional];
  } else {
    formData.value = {
      name: '',
      appointmentFee: 0,
      percProfessional: 80,
    };
    percProfessionalValue.value = [80];
  }
}, { immediate: true });

watch(percProfessionalValue, (value) => {
  formData.value.percProfessional = value[0] || 80;
});

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      name: '',
      appointmentFee: 0,
      percProfessional: 80,
    };
    percProfessionalValue.value = [80];
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    if (!props.specialty) {
      const data: CreateSpecialtyDto = {
        name: formData.value.name.trim(),
        appointmentFee: formData.value.appointmentFee,
        percProfessional: formData.value.percProfessional,
      };
      await specialtiesStore.createSpecialty(data);
    } else {
      const data: UpdateSpecialtyDto = {
        appointmentFee: formData.value.appointmentFee,
        percProfessional: formData.value.percProfessional,
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

