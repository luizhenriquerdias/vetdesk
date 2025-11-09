<template>
  <div
    :class="cn(
      'inline-flex items-center justify-center rounded-md border bg-muted p-1 text-muted-foreground',
      props.class,
    )"
    role="group"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  modelValue?: string
  class?: HTMLAttributes['class']
}>();

const emits = defineEmits<{
  'update:modelValue': [value: string]
}>();

const selectValue = (value: string) => {
  emits('update:modelValue', value);
};

provide('toggleGroup', {
  selectedValue: computed(() => props.modelValue),
  selectValue,
});
</script>

