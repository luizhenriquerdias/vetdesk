import { api } from '@/api';
import type { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponse } from '@shared/types/appointment';

export const list = async (includeDeleted?: boolean): Promise<AppointmentResponse[]> => {
  const params = includeDeleted ? { includeDeleted: 'true' } : {};
  const response = await api.get<AppointmentResponse[]>('/appointments', { params });
  return response.data;
};

export const create = async (data: CreateAppointmentDto): Promise<AppointmentResponse> => {
  const response = await api.post<AppointmentResponse>('/appointments', data);
  return response.data;
};

export const update = async (id: string, data: UpdateAppointmentDto): Promise<AppointmentResponse> => {
  const response = await api.patch<AppointmentResponse>(`/appointments/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`/appointments/${id}`);
};

export const restore = async (id: string): Promise<AppointmentResponse> => {
  const response = await api.patch<AppointmentResponse>(`/appointments/${id}/restore`);
  return response.data;
};

