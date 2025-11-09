<template>
  <Sidebar variant="inset">
    <SidebarHeader />
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Application</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarItem
              :to="ROUTE_HOME"
              icon="home"
              label="Home"
            />
            <SidebarItem
              :to="ROUTE_USERS"
              icon="users"
              label="Users"
            />
            <SidebarItem
              :to="ROUTE_DOCTORS"
              icon="stethoscope"
              label="Doctors"
            />
            <SidebarItem
              :to="ROUTE_SPECIALTIES"
              icon="tag"
              label="Specialties"
            />
            <SidebarItem
              :to="ROUTE_TRANSACTIONS"
              icon="receipt"
              label="Transactions"
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter />
  </Sidebar>
</template>

<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';
import { ROUTE_HOME, ROUTE_USERS, ROUTE_DOCTORS, ROUTE_SPECIALTIES, ROUTE_TRANSACTIONS } from '@/router/routes';
import SidebarItem from './SidebarItem.vue';
</script>

