import { api } from '@/api';
import type { CreateTransactionDto, UpdateTransactionDto, TransactionResponse } from '@shared/types/transaction';

export const list = async (options?: { includeDeleted?: boolean; month?: string }): Promise<TransactionResponse[]> => {
  const params: Record<string, string> = {};
  if (options?.includeDeleted) {
    params.includeDeleted = 'true';
  }
  if (options?.month) {
    params.month = options.month;
  }
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

