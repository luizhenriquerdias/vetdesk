export const TRANSACTION_TYPE_INCOME = 'INCOME' as const;
export const TRANSACTION_TYPE_EXPENSE = 'EXPENSE' as const;

export type TransactionType = typeof TRANSACTION_TYPE_INCOME | typeof TRANSACTION_TYPE_EXPENSE;

export type Transaction = {
  id: string;
  description: string;
  type: TransactionType;
  datetime: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
};

export type CreateTransactionDto = {
  description: string;
  type: TransactionType;
  datetime: string;
};

export type UpdateTransactionDto = {
  description?: string;
  type?: TransactionType;
  datetime?: string;
};

export type TransactionResponse = Transaction;

