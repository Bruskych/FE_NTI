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
.main-content {
  flex: 1 0 auto;
}
</style>