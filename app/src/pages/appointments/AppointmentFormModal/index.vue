<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ appointment ? 'Editar Consulta' : 'Registrar Consulta' }}
        </DialogTitle>
        <DialogDescription>
          {{ appointment ? 'Atualizar informações da consulta' : 'Registrar uma nova consulta' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <Label for="doctor">Médico</Label>
          <Select
            id="doctor"
            v-model="formData.doctorId"
            required
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecione o médico..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-if="doctorOptions.length === 0"
                value="__empty__"
                disabled
              >
                Nenhum médico disponível
              </SelectItem>
              <SelectItem
                v-for="option in doctorOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="fee">Preço</Label>
          <CurrencyInput
            id="fee"
            v-model="formData.fee"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="percProfessional">Percentual de Pagamento</Label>
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
              <span>Médico ({{ (percProfessionalValue[0] ?? 0).toFixed(0) }}%)</span>
              <span class="flex-1" />
              <span>Clínica ({{ (100 - (percProfessionalValue[0] ?? 0)).toFixed(0) }}%)</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <DatePicker
            id="date"
            v-model="formData.date"
            label="Data"
            required
          />
          <TimePicker
            id="time"
            v-model="formData.time"
            label="Hora"
            required
          />
        </div>

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
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/date-picker';
import { TimePicker } from '@/components/time-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useAppointmentsStore } from '@/stores/appointments';
import { useDoctorsStore } from '@/stores/doctors';
import type { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponse } from '@shared/types/appointment';

interface Props {
  open: boolean
  appointment?: AppointmentResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  appointment: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  save: []
}>();

const appointmentsStore = useAppointmentsStore();
const doctorsStore = useDoctorsStore();

const saving = ref(false);

const getDefaultDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0]!;
};

const getDefaultTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formData = ref({
  doctorId: null as string | null,
  fee: 0,
  percProfessional: 0,
  date: getDefaultDate(),
  time: getDefaultTime(),
});

const percProfessionalValue = ref([0]);

const doctorOptions = computed(() => {
  return doctorsStore.doctors.map((d) => ({
    label: `${d.firstName} ${d.lastName}`,
    value: d.id,
  }));
});

const combineDateTime = (date: string | undefined, time: string | undefined): string => {
  const dateValue = date || getDefaultDate();
  const timeValue = time || getDefaultTime();
  return new Date(`${dateValue}T${timeValue}`).toISOString();
};

onMounted(async () => {
  await doctorsStore.fetchDoctors();
});

watch(() => props.appointment, (appointment) => {
  if (appointment) {
    const dt = new Date(appointment.datetime);
    const date = dt.toISOString().split('T')[0];
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;

    formData.value = {
      doctorId: appointment.doctorId,
      fee: appointment.fee,
      percProfessional: appointment.percProfessional,
      date: date!,
      time,
    };
    percProfessionalValue.value = [appointment.percProfessional];
  } else {
    formData.value = {
      doctorId: null,
      fee: 0,
      percProfessional: 0,
      date: getDefaultDate(),
      time: getDefaultTime(),
    };
    percProfessionalValue.value = [0];
  }
}, { immediate: true });

watch(percProfessionalValue, (value) => {
  formData.value.percProfessional = value[0] || 0;
});

watch(() => formData.value.doctorId, (value) => {
  if (value === '__empty__') {
    formData.value.doctorId = null;
    return;
  }

  if (value) {
    const selectedDoctor = doctorsStore.doctors.find((d) => d.id === value);
    if (selectedDoctor) {
      formData.value.percProfessional = selectedDoctor.percProfessional;
      percProfessionalValue.value = [selectedDoctor.percProfessional];
      formData.value.fee = selectedDoctor.appointmentFee;
    }
  }
});

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      doctorId: null,
      fee: 0,
      percProfessional: 0,
      date: getDefaultDate(),
      time: getDefaultTime(),
    };
    percProfessionalValue.value = [0];
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    const datetime = combineDateTime(formData.value.date, formData.value.time);

    if (!props.appointment) {
      if (!formData.value.doctorId) {
        return;
      }
      const data: CreateAppointmentDto = {
        doctorId: formData.value.doctorId,
        fee: formData.value.fee,
        percProfessional: formData.value.percProfessional,
        datetime,
      };
      await appointmentsStore.createAppointment(data);
      emits('save');
      return;
    }

    const data: UpdateAppointmentDto = {
      doctorId: formData.value.doctorId || undefined,
      fee: formData.value.fee,
      percProfessional: formData.value.percProfessional,
      datetime,
    };
    await appointmentsStore.updateAppointment(props.appointment.id, data);

    emits('save');
  } catch (error) {
    console.error('Error saving appointment:', error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emits('update:open', false);
};
</script>

