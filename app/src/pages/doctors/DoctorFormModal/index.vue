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
          <Input
            id="specialty"
            v-model="formData.specialty"
            required
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
import { useDoctorsStore } from '@/stores/doctors';
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

const saving = ref(false);

const formData = ref({
  firstName: '',
  lastName: '',
  specialty: '',
  crm: '',
});

watch(() => props.doctor, (doctor) => {
  if (doctor) {
    formData.value = {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty,
      crm: doctor.crm || '',
    };
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      specialty: '',
      crm: '',
    };
  }
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      firstName: '',
      lastName: '',
      specialty: '',
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
        specialty: formData.value.specialty,
        crm: formData.value.crm || null,
      };
      await doctorsStore.createDoctor(data);
      emits('save');
      return;
    }

    const data: UpdateDoctorDto = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      specialty: formData.value.specialty,
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

