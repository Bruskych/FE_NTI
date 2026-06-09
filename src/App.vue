<script setup lang="ts">
import { RouterView } from 'vue-router'
import { watch } from 'vue'
import { useRoute } from 'vue-router'


import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CookieConsent from '@/components/ui/CookieConsent.vue'

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
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <main class="app-main">
      <RouterView />
    </main>

    <AppFooter />
    <CookieConsent />
  </div>
</template>

<style>
</style>