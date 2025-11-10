<template>
  <Sidebar variant="inset">
    <SidebarHeader>
      <img
        :src="logoFull"
        alt="Logo"
        class="max-h-8 w-auto object-contain"
      >
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Aplicação</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarItem
              :to="ROUTE_HOME"
              icon="home"
              label="Início"
            />
            <SidebarItem
              :to="ROUTE_TRANSACTIONS"
              icon="receipt"
              label="Transações"
            />
            <SidebarItem
              :to="ROUTE_APPOINTMENTS"
              icon="calendar"
              label="Consultas"
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarItem
              :to="ROUTE_DOCTORS"
              icon="stethoscope"
              label="Médicos"
            />
            <SidebarItem
              :to="ROUTE_SPECIALTIES"
              icon="tag"
              label="Especialidades"
            />
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div class="flex-1" />

      <SidebarGroup>
        <SidebarGroupLabel>Administração</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarItem
              :to="ROUTE_USERS"
              icon="users"
              label="Usuários"
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
import logoFull from '@/assets/logo-full.png';
</script>

