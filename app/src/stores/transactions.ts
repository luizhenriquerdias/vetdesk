import { defineStore } from 'pinia';
import { reactive, toRefs } from 'vue';
import * as transactionsApi from '@/api/transactions';
import type { CreateTransactionDto, UpdateTransactionDto, TransactionResponse } from '@shared/types/transaction';

export const useTransactionsStore = defineStore('transactions', () => {
  const state = reactive({
    transactions: [] as TransactionResponse[],
    loading: false,
    showDeleted: false,
  });

  const fetchTransactions = async () => {
    state.loading = true;
    try {
      state.transactions = await transactionsApi.list(state.showDeleted);
    } finally {
      state.loading = false;
    }
  };

  const createTransaction = async (data: CreateTransactionDto) => {
    const transaction = await transactionsApi.create(data);
    state.transactions.unshift(transaction);
    return transaction;
  };

  const updateTransaction = async (id: string, data: UpdateTransactionDto) => {
    const transaction = await transactionsApi.update(id, data);
    const index = state.transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.transactions[index] = transaction;
    }
    return transaction;
  };

  const deleteTransaction = async (id: string) => {
    await transactionsApi.remove(id);
    await fetchTransactions();
  };

  const restoreTransaction = async (id: string) => {
    await transactionsApi.restore(id);
    await fetchTransactions();
  };

  return {
    ...toRefs(state),
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    restoreTransaction,
  };
});

