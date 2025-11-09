<template>
  <Dialog
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ transaction ? 'Edit Transaction' : 'Create Transaction' }}
        </DialogTitle>
        <DialogDescription>
          {{ transaction ? 'Update transaction information' : 'Add a new transaction to the system' }}
        </DialogDescription>
      </DialogHeader>

      <form
        class="space-y-4"
        @submit.prevent="handleSubmit"
      >
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Input
            id="description"
            v-model="formData.description"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="type">Type</Label>
          <select
            id="type"
            v-model="formData.type"
            required
            class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="date">Date</Label>
            <Input
              id="date"
              v-model="formData.date"
              type="date"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="time">Time</Label>
            <Input
              id="time"
              v-model="formData.time"
              type="time"
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="amount">Amount</Label>
          <CurrencyInput
            id="amount"
            v-model="formData.amount"
            required
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="handleCancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { useTransactionsStore } from '@/stores/transactions';
import type { CreateTransactionDto, UpdateTransactionDto, TransactionResponse } from '@shared/types/transaction';
import { TRANSACTION_TYPE_INCOME, TRANSACTION_TYPE_EXPENSE } from '@shared/types/transaction';

interface Props {
  open: boolean
  transaction?: TransactionResponse | null
}

const props = withDefaults(defineProps<Props>(), {
  transaction: null,
});

const emits = defineEmits<{
  'update:open': [value: boolean]
  save: []
}>();

const transactionsStore = useTransactionsStore();

const saving = ref(false);

const getDefaultDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getDefaultTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formData = ref({
  description: '',
  type: TRANSACTION_TYPE_INCOME as typeof TRANSACTION_TYPE_INCOME | typeof TRANSACTION_TYPE_EXPENSE,
  date: getDefaultDate(),
  time: getDefaultTime(),
  amount: 0,
});

const combineDateTime = (date: string, time: string): string => {
  return new Date(`${date}T${time}`).toISOString();
};

watch(() => props.transaction, (transaction) => {
  if (transaction) {
    const dt = new Date(transaction.datetime);
    const date = dt.toISOString().split('T')[0];
    const hours = String(dt.getHours()).padStart(2, '0');
    const minutes = String(dt.getMinutes()).padStart(2, '0');
    const time = `${hours}:${minutes}`;
    
    formData.value = {
      description: transaction.description,
      type: transaction.type,
      date,
      time,
      amount: transaction.amount,
    };
  } else {
    formData.value = {
      description: '',
      type: TRANSACTION_TYPE_INCOME,
      date: getDefaultDate(),
      time: getDefaultTime(),
      amount: 0,
    };
  }
}, { immediate: true });

watch(() => props.open, (open) => {
  if (!open) {
    formData.value = {
      description: '',
      type: TRANSACTION_TYPE_INCOME,
      date: getDefaultDate(),
      time: getDefaultTime(),
      amount: 0,
    };
  }
});

const handleSubmit = async () => {
  saving.value = true;
  try {
    const datetime = combineDateTime(formData.value.date, formData.value.time);
    
    if (!props.transaction) {
      const data: CreateTransactionDto = {
        description: formData.value.description,
        type: formData.value.type,
        datetime,
        amount: formData.value.amount,
      };
      await transactionsStore.createTransaction(data);
      emits('save');
      return;
    }

    const data: UpdateTransactionDto = {
      description: formData.value.description,
      type: formData.value.type,
      datetime,
      amount: formData.value.amount,
    };
    await transactionsStore.updateTransaction(props.transaction.id, data);

    emits('save');
  } catch (error) {
    console.error('Error saving transaction:', error);
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  emits('update:open', false);
};
</script>

