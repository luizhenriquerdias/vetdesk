<template>
  <SelectGroup
    data-slot="select-group"
    v-bind="props"
  >
    <slot />
  </SelectGroup>
</template>

<script setup lang="ts">
import { type SelectGroupProps, SelectGroup } from 'reka-ui';

const props = defineProps<SelectGroupProps>();
</script>
