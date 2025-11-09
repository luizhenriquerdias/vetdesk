<template>
  <Input
    :id="id"
    :model-value="formattedValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :class="class"
    type="text"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { HTMLAttributes } from 'vue';
import { Input } from '@/components/ui/input';

interface Props {
  modelValue?: number
  id?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  placeholder: 'R$ 0,00',
});

const emits = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>();

const formattedValue = ref('');

const formatCurrency = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined || value === 0) {
    return '';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  const cleaned = value.replace(/\D/g, '');

  if (cleaned === '') {
    formattedValue.value = '';
    emits('update:modelValue', 0);
    return;
  }

  const numericValue = parseInt(cleaned, 10) / 100;
  emits('update:modelValue', numericValue);
  formattedValue.value = formatCurrency(numericValue);
};

const handleBlur = () => {
  if (props.modelValue > 0) {
    formattedValue.value = formatCurrency(props.modelValue);
  } else {
    formattedValue.value = '';
    emits('update:modelValue', 0);
  }
};

watch(() => props.modelValue, (value) => {
  if (value > 0) {
    formattedValue.value = formatCurrency(value);
  } else {
    formattedValue.value = '';
  }
}, { immediate: true });
</script>

