<template>
  <SidebarMenuItem>
    <SidebarMenuButton
      as-child
      :is-active="isActive"
    >
      <RouterLink :to="{ name: to }">
        <Icon :name="icon" />
        <span>{{ label }}</span>
      </RouterLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon/Icon.types';
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const props = defineProps<{
  to: string;
  icon: IconName;
  label: string;
}>();

const route = useRoute();
const isActive = computed(() => route.name === props.to);
</script>

