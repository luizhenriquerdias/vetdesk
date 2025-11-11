<template>
  <div class="flex flex-col gap-6">
      <div class="flex items-center justify-between">
        <div>
          <MonthPicker
            v-model="selectedMonth"
            @update:model-value="handleMonthChange"
          />
        </div>
      </div>

      <Card class="p-0">
        <CardContent class="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Receitas</TableHead>
                <TableHead>Despesas</TableHead>
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
                  <span
                    v-if="item.incomes > 0"
                    class="text-green-600 dark:text-green-400"
                  >
                    {{ formatCurrency(item.incomes) }}
                  </span>
                  <span
                    v-else
                    class="text-muted-foreground"
                  >
                    —
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    v-if="item.expenses > 0"
                    class="text-red-600 dark:text-red-400"
                  >
                    {{ formatCurrency(item.expenses) }}
                  </span>
                  <span
                    v-else
                    class="text-muted-foreground"
                  >
                    —
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    :class="[
                      item.total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ formatCurrency(item.total) }}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow
                v-if="consolidatedData.length > 0"
                class="bg-muted/50 font-semibold border-t-2"
              >
                <TableCell>Total</TableCell>
                <TableCell>
                  <span
                    v-if="totals.incomes > 0"
                    class="text-green-600 dark:text-green-400"
                  >
                    {{ formatCurrency(totals.incomes) }}
                  </span>
                  <span
                    v-else
                    class="text-muted-foreground"
                  >
                    —
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    v-if="totals.expenses > 0"
                    class="text-red-600 dark:text-red-400"
                  >
                    {{ formatCurrency(totals.expenses) }}
                  </span>
                  <span
                    v-else
                    class="text-muted-foreground"
                  >
                    —
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    :class="[
                      totals.total >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ formatCurrency(totals.total) }}
                  </span>
                </TableCell>
              </TableRow>
              <TableRow v-if="consolidatedData.length === 0">
                <TableCell
                  colspan="4"
                  class="text-center text-muted-foreground"
                >
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Card, CardContent } from '@/components/ui/card';
import { MonthPicker } from '@/components/month-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getTransactions } from '@/api/reports';
import type { TransactionResponse } from '@shared/types/transaction';
import { TRANSACTION_TYPE_INCOME, TRANSACTION_TYPE_EXPENSE } from '@shared/types/transaction';

const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const transactions = ref<TransactionResponse[]>([]);
const selectedMonth = ref(getCurrentMonth());
const loading = ref(false);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

  transactions.value.forEach((transaction) => {
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

  const monthParts = selectedMonth.value.split('-').map(Number);
  const year = monthParts[0];
  const month = monthParts[1];

  if (!year || !month) {
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
      .map(({ dateSortKey: _dateSortKey, ...rest }) => rest);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const allDates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateKey = formatDate(date.toISOString());
    allDates.push(dateKey);

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        incomes: 0,
        expenses: 0,
        incomeDescriptions: [],
        expenseDescriptions: [],
        allDescriptions: [],
      });
    }
  }

  return allDates
    .map((date) => {
      const data = grouped.get(date)!;
      return {
        date,
        incomes: data.incomes,
        expenses: data.expenses,
        total: data.incomes - data.expenses,
        incomeDescriptions: data.incomeDescriptions,
        expenseDescriptions: data.expenseDescriptions,
        allDescriptions: data.allDescriptions,
        dateSortKey: date.split('/').reverse().join('-'),
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.dateSortKey);
      const dateB = new Date(b.dateSortKey);
      return dateA.getTime() - dateB.getTime();
    })
    .map(({ dateSortKey: _dateSortKey, ...rest }) => rest);
});

const totals = computed(() => {
  const result = consolidatedData.value.reduce(
    (acc, item) => ({
      incomes: acc.incomes + item.incomes,
      expenses: acc.expenses + item.expenses,
    }),
    {
      incomes: 0,
      expenses: 0,
    },
  );
  return {
    ...result,
    total: result.incomes - result.expenses,
  };
});

const fetchTransactions = async () => {
  loading.value = true;
  try {
    transactions.value = await getTransactions(selectedMonth.value);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTransactions();
});

const handleMonthChange = async () => {
  await fetchTransactions();
};
</script>

