<template>
  <button
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      isPressed
        ? 'bg-background text-foreground shadow-sm'
        : 'hover:bg-background/50 hover:text-foreground',
      props.class,
    )"
    :aria-pressed="isPressed"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, inject, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  value: string
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>();

const toggleGroup = inject<{
  selectedValue: { value: string | undefined }
  selectValue: (value: string) => void
    }>('toggleGroup');

const isPressed = computed(() => {
  if (toggleGroup) {
    return toggleGroup.selectedValue.value === props.value;
  }
  return false;
});

const handleClick = () => {
  if (toggleGroup) {
    toggleGroup.selectValue(props.value);
  }
};
</script>

