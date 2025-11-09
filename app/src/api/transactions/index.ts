import { api } from '@/api';
import type { CreateTransactionDto, UpdateTransactionDto, TransactionResponse } from '@shared/types/transaction';

export const list = async (includeDeleted?: boolean): Promise<TransactionResponse[]> => {
  const params = includeDeleted ? { includeDeleted: 'true' } : {};
  const response = await api.get<TransactionResponse[]>('/transactions', { params });
  return response.data;
};

export const create = async (data: CreateTransactionDto): Promise<TransactionResponse> => {
  const response = await api.post<TransactionResponse>('/transactions', data);
  return response.data;
};

export const update = async (id: string, data: UpdateTransactionDto): Promise<TransactionResponse> => {
  const response = await api.patch<TransactionResponse>(`/transactions/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};

export const restore = async (id: string): Promise<TransactionResponse> => {
  const response = await api.patch<TransactionResponse>(`/transactions/${id}/restore`);
  return response.data;
};

