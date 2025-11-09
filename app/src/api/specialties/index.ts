import { api } from '@/api';
import type { CreateSpecialtyDto, UpdateSpecialtyDto, SpecialtyResponse } from '@shared/types/specialty';

export const list = async (includeDeleted?: boolean): Promise<SpecialtyResponse[]> => {
  const params = includeDeleted ? { includeDeleted: 'true' } : {};
  const response = await api.get<SpecialtyResponse[]>('/specialties', { params });
  return response.data;
};

export const create = async (data: CreateSpecialtyDto): Promise<SpecialtyResponse> => {
  const response = await api.post<SpecialtyResponse>('/specialties', data);
  return response.data;
};

export const update = async (id: string, data: UpdateSpecialtyDto): Promise<SpecialtyResponse> => {
  const response = await api.patch<SpecialtyResponse>(`/specialties/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`/specialties/${id}`);
};

export const restore = async (id: string): Promise<SpecialtyResponse> => {
  const response = await api.patch<SpecialtyResponse>(`/specialties/${id}/restore`);
  return response.data;
};

