<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import TheHeader from '@/components/layout/AppHeader.vue'
import TheFooter from '@/components/layout/AppFooter.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchMe()
})
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