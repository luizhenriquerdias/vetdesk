<template>
  <TooltipRoot
    data-slot="tooltip"
    v-bind="forwarded"
  >
    <slot />
  </TooltipRoot>
</template>

<script setup lang="ts">
import { type TooltipRootEmits, type TooltipRootProps, TooltipRoot, useForwardPropsEmits } from 'reka-ui';

const props = defineProps<TooltipRootProps>();
const emits = defineEmits<TooltipRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>
