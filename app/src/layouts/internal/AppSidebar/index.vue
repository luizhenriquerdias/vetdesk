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
              :to="ROUTE_TRANSACTIONS"
              icon="receipt"
              label="Transactions"
            />
            <SidebarItem
              :to="ROUTE_APPOINTMENTS"
              icon="calendar"
              label="Appointments"
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Records</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
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
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div class="flex-1" />

      <SidebarGroup>
        <SidebarGroupLabel>Administration</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarItem
              :to="ROUTE_USERS"
              icon="users"
              label="Users"
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
import { ROUTE_HOME, ROUTE_USERS, ROUTE_DOCTORS, ROUTE_SPECIALTIES, ROUTE_TRANSACTIONS, ROUTE_APPOINTMENTS } from '@/router/routes';
import SidebarItem from './SidebarItem.vue';
</script>

