<template>
  <TooltipProvider>
    <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-muted-foreground">
          {{ transactionsStore.showDeleted ? 'View and restore deleted transactions' : 'Manage transactions' }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <ToggleGroup
          :model-value="viewMode"
          @update:model-value="viewMode = $event as 'table' | 'consolidated'"
        >
          <ToggleGroupItem value="table">
            <Icon name="table" />
          </ToggleGroupItem>
          <ToggleGroupItem value="consolidated">
            <Icon name="bar-chart" />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup
          :model-value="transactionsStore.showDeleted ? 'deleted' : 'active'"
          @update:model-value="handleToggleViewValue"
        >
          <ToggleGroupItem value="active">
            Active
          </ToggleGroupItem>
          <ToggleGroupItem value="deleted">
            Deleted
          </ToggleGroupItem>
        </ToggleGroup>
        <Button
          :disabled="transactionsStore.showDeleted"
          @click="handleAddTransaction"
        >
          <Icon name="plus" />
          <span>Add Transaction</span>
        </Button>
      </div>
    </div>

    <Card class="p-0">
      <CardContent class="p-0">
        <Table v-if="viewMode === 'table'">
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="transaction in transactionsStore.transactions"
              :key="transaction.id"
              :class="[
                transactionsStore.showDeleted ? 'opacity-60' : 'cursor-pointer',
              ]"
              @click="!transactionsStore.showDeleted && handleEditTransaction(transaction)"
            >
              <TableCell>
                <span :class="transactionsStore.showDeleted ? 'line-through' : ''">
                  {{ transaction.description }}
                </span>
              </TableCell>
              <TableCell>
                <span :class="transactionsStore.showDeleted ? 'line-through' : ''">
                  {{ formatDateTime(transaction.datetime) }}
                </span>
              </TableCell>
              <TableCell>
                <span
                  :class="[
                    transactionsStore.showDeleted ? 'line-through' : '',
                    transaction.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                  ]"
                >
                  {{ formatCurrency(transaction.amount) }}
                </span>
              </TableCell>
              <TableCell @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="sm"
                    >
                      <Icon name="more-vertical" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      v-if="!transactionsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleEditTransaction(transaction)"
                    >
                      <Icon name="edit" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="!transactionsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleDeleteTransaction(transaction)"
                    >
                      <Icon name="trash" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      v-if="transactionsStore.showDeleted"
                      class="flex items-center gap-2"
                      @click="handleRestoreTransaction(transaction)"
                    >
                      <Icon name="rotate-ccw" />
                      <span>Restore</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            <TableRow v-if="transactionsStore.transactions.length === 0">
              <TableCell
                colspan="4"
                class="text-center text-muted-foreground"
              >
                No transactions found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Incomes</TableHead>
              <TableHead>Expenses</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in consolidatedData"
              :key="item.date"
            >
              <TableCell>
                {{ item.date }}
              </TableCell>
              <TableCell>
                <Tooltip v-if="item.incomes > 0">
                  <TooltipTrigger as-child>
                    <span class="text-green-600 dark:text-green-400 cursor-help">
                      {{ formatCurrency(item.incomes) }}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div class="flex flex-col gap-1">
                      <div
                        v-for="(desc, idx) in item.incomeDescriptions"
                        :key="`income-${idx}-${desc}`"
                      >
                        {{ desc }}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <span
                  v-else
                  class="text-muted-foreground"
                >
                  —
                </span>
              </TableCell>
              <TableCell>
                <Tooltip v-if="item.expenses > 0">
                  <TooltipTrigger as-child>
                    <span class="text-red-600 dark:text-red-400 cursor-help">
                      {{ formatCurrency(item.expenses) }}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div class="flex flex-col gap-1">
                      <div
                        v-for="(desc, idx) in item.expenseDescriptions"
                        :key="`expense-${idx}-${desc}`"
                      >
                        {{ desc }}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <span
                  v-else
                  class="text-muted-foreground"
                >
                  —
                </span>
              </TableCell>
              <TableCell>
                <Tooltip v-if="item.total !== 0">
                  <TooltipTrigger as-child>
                    <span
                      :class="[
                        'cursor-help',
                        item.total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                      ]"
                    >
                      {{ formatCurrency(item.total) }}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div class="flex flex-col gap-1">
                      <div
                        v-for="(desc, idx) in item.allDescriptions"
                        :key="`all-${idx}-${desc}`"
                      >
                        {{ desc }}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
                <span
                  v-else
                  class="text-muted-foreground"
                >
                  {{ formatCurrency(item.total) }}
                </span>
              </TableCell>
            </TableRow>
            <TableRow v-if="consolidatedData.length === 0">
              <TableCell
                colspan="4"
                class="text-center text-muted-foreground"
              >
                No transactions found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <TransactionFormModal
      v-model:open="isFormModalOpen"
      :transaction="selectedTransaction"
      @save="handleSaveTransaction"
    />

    <DeleteTransactionDialog
      v-model:open="isDeleteDialogOpen"
      :transaction="transactionToDelete"
      @confirm="handleConfirmDelete"
    />
    </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTransactionsStore } from '@/stores/transactions';
import type { TransactionResponse } from '@shared/types/transaction';
import { TRANSACTION_TYPE_INCOME, TRANSACTION_TYPE_EXPENSE } from '@shared/types/transaction';
import TransactionFormModal from './TransactionFormModal/index.vue';
import DeleteTransactionDialog from './DeleteTransactionDialog/index.vue';

const transactionsStore = useTransactionsStore();

const viewMode = ref<'table' | 'consolidated'>('table');
const isFormModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const selectedTransaction = ref<TransactionResponse | null>(null);
const transactionToDelete = ref<TransactionResponse | null>(null);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDateTime = (datetime: string): string => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatDate = (datetime: string): string => {
  const date = new Date(datetime);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const consolidatedData = computed(() => {
  const grouped = new Map<string, {
    incomes: number;
    expenses: number;
    incomeDescriptions: string[];
    expenseDescriptions: string[];
    allDescriptions: string[];
  }>();

  transactionsStore.transactions.forEach((transaction) => {
    const dateKey = formatDate(transaction.datetime);
    
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        incomes: 0,
        expenses: 0,
        incomeDescriptions: [],
        expenseDescriptions: [],
        allDescriptions: [],
      });
    }

    const group = grouped.get(dateKey)!;
    group.allDescriptions.push(transaction.description);

    if (transaction.type === TRANSACTION_TYPE_INCOME) {
      group.incomes += transaction.amount;
      group.incomeDescriptions.push(transaction.description);
    } else if (transaction.type === TRANSACTION_TYPE_EXPENSE) {
      group.expenses += transaction.amount;
      group.expenseDescriptions.push(transaction.description);
    }
  });

  return Array.from(grouped.entries())
    .map(([date, data]) => ({
      date,
      incomes: data.incomes,
      expenses: data.expenses,
      total: data.incomes - data.expenses,
      incomeDescriptions: data.incomeDescriptions,
      expenseDescriptions: data.expenseDescriptions,
      allDescriptions: data.allDescriptions,
      dateSortKey: date.split('/').reverse().join('-'),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.dateSortKey);
      const dateB = new Date(b.dateSortKey);
      return dateA.getTime() - dateB.getTime();
    })
    .map(({ dateSortKey, ...rest }) => rest);
});

onMounted(() => {
  transactionsStore.fetchTransactions();
});

const handleAddTransaction = () => {
  selectedTransaction.value = null;
  isFormModalOpen.value = true;
};

const handleEditTransaction = (transaction: TransactionResponse) => {
  selectedTransaction.value = transaction;
  isFormModalOpen.value = true;
};

const handleDeleteTransaction = (transaction: TransactionResponse) => {
  transactionToDelete.value = transaction;
  isDeleteDialogOpen.value = true;
};

const handleSaveTransaction = () => {
  isFormModalOpen.value = false;
  selectedTransaction.value = null;
};

const handleToggleView = async (showDeleted: boolean) => {
  transactionsStore.showDeleted = showDeleted;
  await transactionsStore.fetchTransactions();
};

const handleToggleViewValue = async (value: string) => {
  await handleToggleView(value === 'deleted');
};

const handleRestoreTransaction = async (transaction: TransactionResponse) => {
  await transactionsStore.restoreTransaction(transaction.id);
};

const handleConfirmDelete = async () => {
  if (transactionToDelete.value) {
    await transactionsStore.deleteTransaction(transactionToDelete.value.id);
    transactionToDelete.value = null;
  }
  isDeleteDialogOpen.value = false;
};
</script>

