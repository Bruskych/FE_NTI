<script setup lang="ts">
import NavCardItem from '@/components/ui/NavCardItem.vue'
import UsersIcon from '@/assets/icons/users.svg'
import AdminIcon from '@/assets/icons/admin.svg'
import BellIcon from '@/assets/icons/bell.svg'
import DownloadIcon from '@/assets/icons/download.svg'
import MailIcon from '@/assets/icons/mail.svg'
import ShieldIcon from '@/assets/icons/shield.svg'
import DashboardIcon from '@/assets/icons/dashboard.svg'
</script>

<template>
  <div class="admin-page">

    <aside class="admin-sidebar">
      <div class="sidebar-menu">
        <NavCardItem
            :label="$t('adminPanel.dashboard')"
            to="/admin/dashboard"
            :roles="['admin', 'super_admin']"
            :icon="DashboardIcon"
        />
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
        <NavCardItem
            :label="$t('adminPanel.calls_management')"
            to="/admin/calls"
            :roles="['admin', 'super_admin']"
            :icon="AdminIcon"
        />
        <NavCardItem
            :label="$t('adminPanel.bulk_messages')"
            to="/admin/bulk-messages"
            :roles="['admin', 'super_admin']"
            :icon="BellIcon"
        />
        <NavCardItem
            :label="$t('adminPanel.exports')"
            to="/admin/exports"
            :roles="['admin', 'super_admin']"
            :icon="DownloadIcon"
        />
        <NavCardItem
            :label="$t('adminPanel.email_templates')"
            to="/admin/email-templates"
            :roles="['admin', 'super_admin']"
            :icon="MailIcon"
        />
        <NavCardItem
            :label="$t('adminPanel.gdpr')"
            to="/admin/gdpr"
            :roles="['admin', 'super_admin']"
            :icon="ShieldIcon"
        />
      </div>
    </aside>

    <main class="admin-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" :key="$route.name" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<style scoped>
.admin-page {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;
  display: flex;
  width: 100%;
  height: calc(100vh - 75px);
  overflow: hidden;
  color: var(--text-color);
  background: var(--bg-color);
}

.admin-sidebar {
  height: 100%;
  flex: 0 0 20%;
  min-width: 260px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  padding: 32px 16px;
  box-sizing: border-box;
  background: var(--menu-color);
  border-right: 1px solid var(--menu-border);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

.admin-content {
  flex: 1;
  height: 100%;
  padding: 40px;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>