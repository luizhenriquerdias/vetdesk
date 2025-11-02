<template>
  <CollapsibleTrigger
    data-slot="collapsible-trigger"
    v-bind="props"
  >
    <slot />
  </CollapsibleTrigger>
</template>

<script setup lang="ts">
import { type CollapsibleTriggerProps, CollapsibleTrigger } from 'reka-ui';

const props = defineProps<CollapsibleTriggerProps>();
</script>
