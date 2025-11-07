<template>
  <component
    :is="icon"
    :size="computedSize"
    :color="color"
    :stroke-width="strokeWidth"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ICON_MAP, type IconName } from '@/components/ui/icon/Icon.types';

defineOptions({
  name: 'Icon',
});

const props = defineProps<{
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}>();

const icon = computed(() => ICON_MAP[props.name]);

// gives a size to use that matches tailwind classes (e.g. size-4 = 16)
const computedSize = computed(() => (props.size || 4) * 4);
</script>

