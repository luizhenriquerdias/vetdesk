<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ doctor ? 'Edit Doctor' : 'Create Doctor' }}
        </DialogTitle>
        <DialogDescription>
          {{ doctor ? 'Update doctor information' : 'Add a new doctor to the system' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <Label for="firstName">First Name</Label>
          <Input
            id="firstName"
            v-model="formData.firstName"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="lastName">Last Name</Label>
          <Input
            id="lastName"
            v-model="formData.lastName"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="specialty">Specialty</Label>
          <Select
            id="specialty"
            v-model="formData.specialtyId"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select specialty..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-if="specialtyOptions.length === 0"
                value="__empty__"
                disabled
              >
                No specialties available
              </SelectItem>
              <SelectItem
                v-for="option in specialtyOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="crm">CRM</Label>
          <Input
            id="crm"
            v-model="formData.crm"
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
import { ref, watch, onMounted, computed } from 'vue';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useDoctorsStore } from '@/stores/doctors';
import { useSpecialtiesStore } from '@/stores/specialties';
import type { CreateDoctorDto, UpdateDoctorDto, DoctorResponse } from '@shared/types/doctor';

interface Props {
  open: boolean
  doctor?: DoctorResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  doctor: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  save: []
}>();

const doctorsStore = useDoctorsStore();
const specialtiesStore = useSpecialtiesStore();

const saving = ref(false);

const formData = ref({
  firstName: '',
  lastName: '',
  specialtyId: null as string | null,
  crm: '',
  percProfessional: 80,
});

const percProfessionalValue = ref([80]);

const specialtyOptions = computed(() => {
  return specialtiesStore.specialties.map((s) => ({
    label: s.name,
    value: s.id,
  }));
});

onMounted(async () => {
  await specialtiesStore.fetchSpecialties();
});

watch(() => props.doctor, (doctor) => {
  if (doctor) {
    const specialtyId = doctor.specialty
      ? specialtiesStore.specialties.find((s) => s.name === doctor.specialty)?.id || null
      : null;

    formData.value = {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialtyId,
      crm: doctor.crm || '',
      percProfessional: doctor.percProfessional ?? 80,
    };
    percProfessionalValue.value = [doctor.percProfessional ?? 80];
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      specialtyId: null,
      crm: '',
      percProfessional: 80,
    };
    percProfessionalValue.value = [80];
  }
}, { immediate: true });

watch(percProfessionalValue, (value) => {
  formData.value.percProfessional = value[0] || 80;
});

watch(() => formData.value.specialtyId, (value) => {
  if (value === '__empty__') {
    formData.value.specialtyId = null;
  }
});

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      firstName: '',
      lastName: '',
      specialtyId: null,
      crm: '',
      percProfessional: 80,
    };
    percProfessionalValue.value = [80];
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    if (!props.doctor) {
      const data: CreateDoctorDto = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        specialtyId: formData.value.specialtyId,
        crm: formData.value.crm || null,
        percProfessional: formData.value.percProfessional,
      };
      await doctorsStore.createDoctor(data);
      emits('save');
      return;
    }

    const data: UpdateDoctorDto = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      specialtyId: formData.value.specialtyId,
      crm: formData.value.crm || null,
      percProfessional: formData.value.percProfessional,
    };
    await doctorsStore.updateDoctor(props.doctor.id, data);

    emits('save');
  } catch (error) {
    console.error('Error saving doctor:', error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emits('update:open', false);
};
</script>

