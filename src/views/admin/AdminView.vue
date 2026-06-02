<!--
  Страница админа
-->

<script setup lang="ts">

import NavCardItem from '@/components/ui/NavCardItem.vue'
import UsersIcon from '@/assets/icons/users.svg'

</script>

<template>
  <div class="admin-page">

    <aside class="admin-sidebar">
      <div class="sidebar-menu">
        <NavCardItem
            :label="$t('adminPanel.student_applications')"
            to="/admin/students"
            :roles="['admin', 'super_admin']"
            :icon="UsersIcon"
        />
        <NavCardItem
            :label="$t('adminPanel.company_applications')"
            to="/admin/companies"
            :roles="['admin', 'super_admin']"
            :icon="UsersIcon"
        />
      </div>
    </aside>

    <main class="admin-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<style scoped>
.admin-page {
  font-weight: 550;

  min-height: 100%;
  display: flex;
  width: 100%;
  overflow: hidden;
  color: var(--text-color);
}
.admin-sidebar {
  min-height: 100%;
  flex: 0 0 20%;
  min-width: 250px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  box-sizing: border-box;
}
.sidebar-header h1 {
  font-size: 20px;
  margin: 0;
}
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 3px;
  overflow-y: auto;
}
.admin-content {
  flex: 1;
  height: 100%;
  padding: 40px;
  overflow-y: auto;
  box-sizing: border-box;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>