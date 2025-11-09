import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import * as doctorsApi from '@/api/doctors';
import type { CreateDoctorDto, UpdateDoctorDto, DoctorResponse } from '@shared/types/doctor';

export const useDoctorsStore = defineStore('doctors', () => {
  const state = reactive({
    doctors: [] as DoctorResponse[],
    loading: false,
    showDeleted: false,
  });

  const fetchDoctors = async () => {
    state.loading = true;
    try {
      state.doctors = await doctorsApi.list(state.showDeleted);
    } finally {
      state.loading = false;
    }
  };

  const createDoctor = async (data: CreateDoctorDto) => {
    const doctor = await doctorsApi.create(data);
    state.doctors.unshift(doctor);
    return doctor;
  };

  const updateDoctor = async (id: string, data: UpdateDoctorDto) => {
    const doctor = await doctorsApi.update(id, data);
    const index = state.doctors.findIndex((d) => d.id === id);
    if (index !== -1) {
      state.doctors[index] = doctor;
    }
    return doctor;
  };

  const deleteDoctor = async (id: string) => {
    await doctorsApi.remove(id);
    await fetchDoctors();
  };

  const restoreDoctor = async (id: string) => {
    await doctorsApi.restore(id);
    await fetchDoctors();
  };

  return {
    ...toRefs(state),
    fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    restoreDoctor,
  };
});

