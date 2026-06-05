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
/* 1. Глобальні налаштування для всієї сторінки */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background-color: #090d10 !important;
  color: #f8fafc;
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 2. Кореневий контейнер Vue програми */
#app {
  height: 100%;
}

/* 3. Головна обгортка компонентів сайту - Розумний Sticky Layout */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #090d10;
}

/* 4. Секція контенту */
.app-main {
  flex: 1; /* Розумно займає простір, але НЕ створює дірок між секціями контенту */
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* 5. Захист футера від стискання */
footer, .custom-footer {
  margin-top: auto; /* Надійно штовхає футер до низу екрана, якщо контенту мало */
  flex-shrink: 0;
}

/* Глобальний фікс для плавної зміни фону */
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>