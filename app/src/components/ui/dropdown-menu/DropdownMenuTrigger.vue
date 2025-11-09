<template>
  <DropdownMenuTrigger
    data-slot="dropdown-menu-trigger"
    v-bind="props"
    class="cursor-pointer"
  >
    <slot />
  </DropdownMenuTrigger>
</template>

<script setup lang="ts">
import { type DropdownMenuTriggerProps, DropdownMenuTrigger } from 'reka-ui';

const props = defineProps<DropdownMenuTriggerProps>();
</script>

