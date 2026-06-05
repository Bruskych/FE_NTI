<script setup lang="ts">
import NavCardItem from '@/components/ui/NavCardItem.vue'
import UserIcon from '@/assets/icons/user.svg'
</script>

<template>
  <div class="settings-page">

    <aside class="settings-sidebar">
      <div class="sidebar-menu">
        <NavCardItem
            :label="$t('userPanel.profile')"
            to="/settings/profile"
            :roles="[
                'super_admin',
                'admin',
                'content_editor',
                'evaluator',
                'company',
                'mentor',
                'team_leader',
                'student'
            ]"
            :icon="UserIcon"
        />
      </div>
    </aside>

    <main class="settings-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<style scoped>
.settings-page {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;
  display: flex;
  width: 100%;
  height: calc(100vh - 75px);
  overflow: hidden;
  color: var(--text-color);
  background: var(--bg-color);
}

.settings-sidebar {
  height: 100%;
  flex: 0 0 20%;
  min-width: 260px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  padding: 32px 16px;
  box-sizing: border-box;
  background: var(--menu-color);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

.settings-content {
  flex: 1;
  height: 100%;
  padding: 40px;
  overflow-y: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Анимация плавного переключения вкладок */
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