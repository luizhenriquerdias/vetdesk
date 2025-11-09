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
          <Select
            id="type"
            v-model="formData.type"
            required
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">
                Income
              </SelectItem>
              <SelectItem value="EXPENSE">
                Expense
              </SelectItem>
            </SelectContent>
          </Select>
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTransactionsStore } from '@/stores/transactions';
import { TRANSACTION_TYPE_INCOME, TRANSACTION_TYPE_EXPENSE, type CreateTransactionDto, type UpdateTransactionDto, type TransactionResponse } from '@shared/types/transaction';

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

const combineDateTime = (date: string | undefined, time: string | undefined): string => {
  const dateValue = date || getDefaultDate();
  const timeValue = time || getDefaultTime();
  return new Date(`${dateValue}T${timeValue}`).toISOString();
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

