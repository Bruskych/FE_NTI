<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
</script>

<template>
  <div class="app-layout">

    <AppHeader />

    <main class="app-main">
      <RouterView />
    </main>

    <AppFooter />

  </div>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #090d10 !important;
}

#app {
  height: 100%;
}

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #090d10;
}

.app-main {
  flex: 1 0 auto;
  width: 100%;
  box-sizing: border-box;
}

footer {
  flex-shrink: 0;
}
</style>