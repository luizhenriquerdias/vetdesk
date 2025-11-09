import { api } from '@/api';
import type { CreateDoctorDto, UpdateDoctorDto, DoctorResponse } from '@shared/types/doctor';

export const list = async (includeDeleted?: boolean): Promise<DoctorResponse[]> => {
  const params = includeDeleted ? { includeDeleted: 'true' } : {};
  const response = await api.get<DoctorResponse[]>('/doctors', { params });
  return response.data;
};

export const create = async (data: CreateDoctorDto): Promise<DoctorResponse> => {
  const response = await api.post<DoctorResponse>('/doctors', data);
  return response.data;
};

export const update = async (id: string, data: UpdateDoctorDto): Promise<DoctorResponse> => {
  const response = await api.patch<DoctorResponse>(`/doctors/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`/doctors/${id}`);
};

export const restore = async (id: string): Promise<DoctorResponse> => {
  const response = await api.patch<DoctorResponse>(`/doctors/${id}/restore`);
  return response.data;
};

