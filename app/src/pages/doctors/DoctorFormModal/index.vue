<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ doctor ? 'Editar Médico' : 'Criar Médico' }}
        </DialogTitle>
        <DialogDescription>
          {{ doctor ? 'Atualizar informações do médico' : 'Adicionar um novo médico ao sistema' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="firstName">Nome</Label>
            <Input
              id="firstName"
              v-model="formData.firstName"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="lastName">Sobrenome</Label>
            <Input
              id="lastName"
              v-model="formData.lastName"
              required
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="specialty">Especialidade</Label>
            <Select
              id="specialty"
              v-model="formData.specialtyId"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Selecione a especialidade..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-if="specialtyOptions.length === 0"
                  value="__empty__"
                  disabled
                >
                  Nenhuma especialidade disponível
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
        </div>

        <div class="space-y-2">
          <Label for="appointmentFee">Preço da Consulta</Label>
          <CurrencyInput
            id="appointmentFee"
            v-model="formData.appointmentFee"
          />
        </div>

        <PercProfessionalSlider
          id="percProfessional"
          v-model="formData.percProfessional"
          required
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            :disabled="saving"
          >
            {{ saving ? 'Salvando...' : 'Salvar' }}
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
import { PercProfessionalSlider } from '@/components/perc-professional-slider';
import CurrencyInput from '@/components/ui/currency-input/CurrencyInput.vue';
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
  appointmentFee: 0,
  percProfessional: 80,
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
    const specialtyId = doctor.specialty
      ? specialtiesStore.specialties.find((s) => s.name === doctor.specialty)?.id || null
      : null;

    formData.value = {
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialtyId,
      crm: doctor.crm || '',
      appointmentFee: doctor.appointmentFee ?? 0,
      percProfessional: doctor.percProfessional ?? 80,
    };
  } else {
    formData.value = {
      firstName: '',
      lastName: '',
      specialtyId: null,
      crm: '',
      appointmentFee: 0,
      percProfessional: 80,
    };
  }
}, { immediate: true });

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
      appointmentFee: 0,
      percProfessional: 80,
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
        specialtyId: formData.value.specialtyId,
        crm: formData.value.crm || null,
        appointmentFee: formData.value.appointmentFee,
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
      appointmentFee: formData.value.appointmentFee,
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

