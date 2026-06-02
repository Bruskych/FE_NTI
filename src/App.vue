<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import TheHeader from '@/components/layout/AppHeader.vue'
import TheFooter from '@/components/layout/AppFooter.vue'

const authStore = useAuthStore()
const route = useRoute()

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
/* Глобальні базові стилі для всього додатку */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}

/* Обгортка, яка розтягує контент на весь екран і притискає футер до низу */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
}

/* Центральна частина займає весь вільний простір */
.main-content {
  flex: 1 0 auto;
}
</style>