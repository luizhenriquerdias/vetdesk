<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :class="cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      props.class,
    )"
    v-bind="delegatedProps"
  >
    <slot />
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { type DropdownMenuItemProps, DropdownMenuItem } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<DropdownMenuItemProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

