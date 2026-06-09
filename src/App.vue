<script setup lang="ts">
import { RouterView } from 'vue-router'
import { watch } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CookieConsent from '@/components/layout/CookieConsent.vue'

const route = useRoute()

watch(
    () => route.matched.some(r => (r.meta as Record<string, unknown>).isWhitePage),
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

    <CookieConsent />

    <AppFooter />
  </div>
</template>

<style>
</style>
