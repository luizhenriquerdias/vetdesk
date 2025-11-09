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
          <Label for="specialties">Specialties</Label>
          <MultiSelect
            id="specialties"
            v-model="formData.specialtyIds"
            :options="specialtyOptions"
            placeholder="Select specialties..."
          />
        </div>

        <div class="space-y-2">
          <Label for="crm">CRM</Label>
          <Input
            id="crm"
            v-model="formData.crm"
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
import { MultiSelect } from '@/components/ui/multiselect';
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
  specialtyIds: [] as string[],
  crm: '',
});

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
    const specialtyIds = (doctor.specialties || []).map((name: string) => {
      const specialty = specialtiesStore.specialties.find((s) => s.name === name);
      return specialty?.id || '';
    }).filter(Boolean);

    formData.value = {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialtyIds,
      crm: doctor.crm || '',
    };
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      specialtyIds: [],
      crm: '',
    };
  }
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      firstName: '',
      lastName: '',
      specialtyIds: [],
      crm: '',
    };
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    if (!props.doctor) {
      const data: CreateDoctorDto = {
        firstName: formData.value.firstName,
        lastName: formData.value.lastName,
        specialtyIds: formData.value.specialtyIds,
        crm: formData.value.crm || null,
      };
      await doctorsStore.createDoctor(data);
      emits('save');
      return;
    }

    const data: UpdateDoctorDto = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      specialtyIds: formData.value.specialtyIds,
      crm: formData.value.crm || null,
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

