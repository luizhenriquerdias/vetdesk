<template>
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="space-y-2">
          <Label for="doctor">Profissional</Label>
          <Select
            id="doctor"
            v-model="selectedDoctorId"
            required
            @update:model-value="handleDoctorChange"
          >
            <SelectTrigger class="w-[250px] bg-background">
              <SelectValue placeholder="Selecione o profissional..." />
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
          <Label for="month">Mês</Label>
          <Input
            id="month"
            v-model="selectedMonth"
            type="month"
            class="w-auto bg-background cursor-pointer select-none"
            @update:model-value="handleMonthChange"
            @click="handleMonthInputClick"
          />
        </div>
      </div>
    </div>

    <Card class="p-0">
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Número de Consultas</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Profissional</TableHead>
              <TableHead>Clínica</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in reportData"
              :key="item.date"
            >
              <TableCell>
                {{ formatDate(item.date) }}
              </TableCell>
              <TableCell>
                {{ item.appointmentCount }}
              </TableCell>
              <TableCell>
                {{ formatCurrency(item.entrada) }}
              </TableCell>
              <TableCell>
                {{ formatCurrency(item.profissional) }}
              </TableCell>
              <TableCell>
                {{ formatCurrency(item.clinica) }}
              </TableCell>
            </TableRow>
            <TableRow v-if="reportData.length === 0 && !loading">
              <TableCell
                colspan="5"
                class="text-center text-muted-foreground"
              >
                {{ selectedDoctorId ? 'Nenhum dado encontrado' : 'Selecione um profissional para ver o relatório' }}
              </TableCell>
            </TableRow>
            <TableRow v-if="loading">
              <TableCell
                colspan="5"
                class="text-center text-muted-foreground"
              >
                Carregando...
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDoctorsStore } from '@/stores/doctors';
import { getDoctorsReport, type DoctorsReportResponse } from '@/api/reports';

const doctorsStore = useDoctorsStore();

const selectedDoctorId = ref<string | null>(null);
const selectedMonth = ref<string>('');
const reportData = ref<DoctorsReportResponse[]>([]);
const loading = ref(false);

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

selectedMonth.value = getCurrentMonth();

const doctorOptions = computed(() => {
  return doctorsStore.doctors.map((d) => ({
    label: d.specialty ? `${d.firstName} ${d.lastName} - ${d.specialty}` : `${d.firstName} ${d.lastName}`,
    value: d.id,
  }));
});

const formatCurrency = (value: number): string => {
  if (value === 0) {
    return '—';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return dateString;
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const fetchReport = async () => {
  if (!selectedDoctorId.value) {
    reportData.value = [];
    return;
  }

  loading.value = true;
  try {
    const month = selectedMonth.value || getCurrentMonth();
    reportData.value = await getDoctorsReport(selectedDoctorId.value, month);
  } catch (error) {
    console.error('Error fetching report:', error);
    reportData.value = [];
  } finally {
    loading.value = false;
  }
};

const handleDoctorChange = async () => {
  if (selectedDoctorId.value === '__empty__') {
    selectedDoctorId.value = null;
    return;
  }
  await fetchReport();
};

const handleMonthChange = async () => {
  await fetchReport();
};

const handleMonthInputClick = (event: MouseEvent) => {
  const input = event.target as HTMLInputElement;
  if (input && 'showPicker' in input && typeof input.showPicker === 'function') {
    input.showPicker();
  }
};

onMounted(async () => {
  await doctorsStore.fetchDoctors();
  if (doctorsStore.doctors[0] && !selectedDoctorId.value) {
    selectedDoctorId.value = doctorsStore.doctors[0].id;
    await fetchReport();
  }
});
</script>

