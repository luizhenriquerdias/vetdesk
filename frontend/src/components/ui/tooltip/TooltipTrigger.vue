<template>
  <TooltipTrigger
    data-slot="tooltip-trigger"
    v-bind="props"
  >
    <slot />
  </TooltipTrigger>
</template>

<script setup lang="ts">
import { type TooltipTriggerProps, TooltipTrigger } from 'reka-ui';

const props = defineProps<TooltipTriggerProps>();
</script>
