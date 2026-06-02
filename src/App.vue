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
  <div class="app-container">
    <TheHeader />

    <main class="main-content">
      <RouterView />
    </main>

    <TheFooter />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1 0 auto;
}

header {
  line-height: 1.55;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: 1rem;
  }
}
</style>