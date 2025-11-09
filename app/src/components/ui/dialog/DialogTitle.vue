<template>
  <DialogTitle
    data-slot="dialog-title"
    :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)"
    v-bind="delegatedProps"
  >
    <slot />
  </DialogTitle>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { type DialogTitleProps, DialogTitle } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

