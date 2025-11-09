import { api } from '@/api';
import type { CreateUserDto, UpdateUserDto, UserResponse } from '@shared/types/user';

export const list = async (): Promise<UserResponse[]> => {
  const response = await api.get<UserResponse[]>('/users');
  return response.data;
};

export const create = async (data: CreateUserDto): Promise<UserResponse> => {
  const response = await api.post<UserResponse>('/users', data);
  return response.data;
};

export const update = async (id: string, data: UpdateUserDto): Promise<UserResponse> => {
  const response = await api.patch<UserResponse>(`/users/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};

