<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import TheHeader from '@/layouts/AppHeader.vue'
import TheFooter from '@/layouts/AppFooter.vue'

const authStore = useAuthStore()

onMounted(() => {
  // Проверяем авторизацию при загрузке страницы
  authStore.fetchMe()
})
</script>

<template>
  <div class="app-layout">
    <TheHeader />

    <main class="main-content">
      <router-view /> <!-- Здесь будут меняться страницы -->
    </main>

    <TheFooter />
  </div>
</template>

<style>
/* Глобальные стили для всей страницы */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

.main-content {
  flex: 1; /* Растягивает контент, чтобы футер всегда был внизу */
}
</style>