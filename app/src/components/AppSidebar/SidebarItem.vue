<template>
  <SidebarMenuItem>
    <SidebarMenuButton as-child>
      <RouterLink :to="{ name: to }">
        <Icon :name="icon" />
        <span>{{ label }}</span>
      </RouterLink>
    </SidebarMenuButton>
  </SidebarMenuItem>
</template>

<script setup lang="ts">
import { Icon } from '@/components/ui/icon';
import {
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

defineProps<{
  to: string;
  icon: string;
  label: string;
}>();
</script>

