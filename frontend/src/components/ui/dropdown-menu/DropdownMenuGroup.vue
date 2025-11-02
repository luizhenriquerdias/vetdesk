<template>
  <DropdownMenuGroup
    data-slot="dropdown-menu-group"
    v-bind="props"
  >
    <slot />
  </DropdownMenuGroup>
</template>

<script setup lang="ts">
import { type DropdownMenuGroupProps, DropdownMenuGroup } from 'reka-ui';

const props = defineProps<DropdownMenuGroupProps>();
</script>
