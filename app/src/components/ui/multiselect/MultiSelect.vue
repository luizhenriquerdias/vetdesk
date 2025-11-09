<template>
  <div class="relative">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          :class="cn('w-full justify-between', !modelValue?.length && 'text-muted-foreground', props.class)"
        >
          <span class="truncate">
            {{ selectedLabelsText || placeholder }}
          </span>
          <Icon
            name="chevron-down"
            class="ml-2 h-4 w-4 shrink-0 opacity-50"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        class="w-(--radix-dropdown-menu-trigger-width) p-0"
        align="start"
      >
        <div class="max-h-[300px] overflow-auto p-1">
          <div
            v-for="option in options"
            :key="option.value"
            class="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
            @click="toggleOption(option.value)"
          >
            <div
              class="flex h-4 w-4 items-center justify-center rounded-sm border border-primary"
              :class="isSelected(option.value) ? 'bg-primary text-primary-foreground' : ''"
            />
            <span>{{ option.label }}</span>
          </div>
          <div
            v-if="options.length === 0"
            class="px-2 py-1.5 text-sm text-muted-foreground"
          >
            No options available
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface Props {
  modelValue?: string[];
  options: MultiSelectOption[];
  placeholder?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: 'Select options...',
});

const emits = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const modelValue = useVModel(props, 'modelValue', emits);

const getOptionLabel = (value: string) => {
  return props.options.find((opt) => opt.value === value)?.label ?? value;
};

const selectedLabelsText = computed(() => {
  if (!modelValue.value || modelValue.value.length === 0) {
    return '';
  }
  return modelValue.value
    .map((id) => getOptionLabel(id))
    .join(', ');
});

const isSelected = (value: string) => {
  return modelValue.value?.includes(value) ?? false;
};

const toggleOption = (value: string) => {
  const current = modelValue.value ?? [];
  if (isSelected(value)) {
    modelValue.value = current.filter((v) => v !== value);
  } else {
    modelValue.value = [...current, value];
  }
};
</script>

