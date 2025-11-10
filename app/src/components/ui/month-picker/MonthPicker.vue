<template>
  <div class="space-y-2">
    <Label
      v-if="label"
      :for="id"
    >
      {{ label }}
    </Label>

    <Input
      :id="id"
      v-model="modelValue"
      type="month"
      class="w-auto bg-background cursor-pointer"
      @click="handleMonthInputClick"
    />
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps<{
  id?: string;
  label?: string;
}>();

const modelValue = defineModel<string>('modelValue', { required: true });

const handleMonthInputClick = (event: MouseEvent) => {
  const input = event.target as HTMLInputElement;
  if (input && 'showPicker' in input && typeof input.showPicker === 'function') {
    input.showPicker();
  }
};
</script>

