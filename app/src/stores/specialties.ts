import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import * as specialtiesApi from '@/api/specialties';
import type { CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyResponse } from '@shared/types/specialty';

export const useSpecialtiesStore = defineStore('specialties', () => {
  const state = reactive({
    specialties: [] as SpecialtyResponse[],
    loading: false,
    showDeleted: false,
  });

  const fetchSpecialties = async () => {
    state.loading = true;
    try {
      state.specialties = await specialtiesApi.list(state.showDeleted);
    } finally {
      state.loading = false;
    }
  };

  const createSpecialty = async (data: CreateSpecialtyDto) => {
    const specialty = await specialtiesApi.create(data);
    state.specialties.unshift(specialty);
    return specialty;
  };

  const updateSpecialty = async (id: string, data: UpdateSpecialtyDto) => {
    const specialty = await specialtiesApi.update(id, data);
    const index = state.specialties.findIndex((s) => s.id === id);
    if (index !== -1) {
      state.specialties[index] = specialty;
    }
    return specialty;
  };

  const deleteSpecialty = async (id: string) => {
    await specialtiesApi.remove(id);
    await fetchSpecialties();
  };

  const restoreSpecialty = async (id: string) => {
    await specialtiesApi.restore(id);
    await fetchSpecialties();
  };

  return {
    ...toRefs(state),
    fetchSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    restoreSpecialty,
  };
});

