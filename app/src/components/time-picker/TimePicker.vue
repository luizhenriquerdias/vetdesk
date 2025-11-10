<template>
  <div class="space-y-2 w-full">
    <Label
      v-if="label"
      :for="id"
    >
      {{ label }}
    </Label>

    <Input
      :id="id"
      v-model="modelValue"
      type="time"
      :required="required"
      class="w-full bg-background cursor-pointer"
      @click="handleTimeInputClick"
    />
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

defineProps<{
  id?: string;
  label?: string;
  required?: boolean;
}>();

const modelValue = defineModel<string>('modelValue', { required: true });

const handleTimeInputClick = (event: MouseEvent) => {
  const input = event.target as HTMLInputElement;
  if (input && 'showPicker' in input && typeof input.showPicker === 'function') {
    input.showPicker();
  }
};
</script>

