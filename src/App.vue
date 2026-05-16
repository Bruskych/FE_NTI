<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/core/api/axios'

import TheHeader from '@/components/layout/AppHeader.vue'
import TheFooter from '@/components/layout/AppFooter.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchMe()
})
/* TEST AXIOS CONNECTION
onMounted(async () => {
  try {
    const response = await api.get('/test-connection')
    console.log('Axios работает, ответ:', response)
  } catch (error: any) {
    console.log('Связь с сервером есть, но маршрут не найден:', error.response)
  }
})
*/
</script>

<template>
  <div class="app-layout">
    <TheHeader />

    <main class="main-content">
      <router-view />
    </main>

    <TheFooter />
  </div>
</template>

<style>
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
  flex: 1;
}
</style>