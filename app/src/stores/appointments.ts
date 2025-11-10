import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import * as appointmentsApi from '@/api/appointments';
import type { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponse } from '@shared/types/appointment';

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const useAppointmentsStore = defineStore('appointments', () => {
  const state = reactive({
    appointments: [] as AppointmentResponse[],
    loading: false,
    showDeleted: false,
    selectedMonth: getCurrentMonth(),
  });

  const fetchAppointments = async () => {
    state.loading = true;
    try {
      state.appointments = await appointmentsApi.list({
        includeDeleted: state.showDeleted,
        month: state.selectedMonth,
      });
    } finally {
      state.loading = false;
    }
  };

  const setSelectedMonth = (month: string) => {
    state.selectedMonth = month;
  };

  const createAppointment = async (data: CreateAppointmentDto) => {
    const appointment = await appointmentsApi.create(data);
    state.appointments.unshift(appointment);
    return appointment;
  };

  const updateAppointment = async (id: string, data: UpdateAppointmentDto) => {
    const appointment = await appointmentsApi.update(id, data);
    const index = state.appointments.findIndex((a) => a.id === id);
    if (index !== -1) {
      state.appointments[index] = appointment;
    }
    return appointment;
  };

  const deleteAppointment = async (id: string) => {
    await appointmentsApi.remove(id);
    await fetchAppointments();
  };

  const restoreAppointment = async (id: string) => {
    await appointmentsApi.restore(id);
    await fetchAppointments();
  };

  return {
    ...toRefs(state),
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    restoreAppointment,
    setSelectedMonth,
  };
});

