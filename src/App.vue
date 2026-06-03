<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import TheHeader from '@/components/layout/AppHeader.vue'
import TheFooter from '@/components/layout/AppFooter.vue'

const authStore = useAuthStore()
const route = useRoute()

// Следим за мета-полем роута для динамического переключения светлой темы
watch(
    () => route.meta.isWhitePage,
    (isWhite) => {
      if (isWhite) {
        document.body.classList.add('white-theme')
      } else {
        document.body.classList.remove('white-theme')
      }
    },
    { immediate: true }
)

onMounted(() => {
  // Автоматически запрашиваем данные текущего пользователя при монтировании приложения
  authStore.fetchMe()
})
</script>

<template>
  <div class="app-layout">
    <TheHeader />

    <main class="main-content">
      <RouterView />
    </main>

    <TheFooter />
  </div>
</template>

<style>
/* Глобальные базовые стили для всего приложения */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Обертка, растягивающая контент на весь экран и прижимающая футер к низу */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* Центральная часть занимает все свободное пространство */
.main-content {
  flex: 1 0 auto;
}
</style>