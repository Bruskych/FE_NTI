<!--
  Страница админа
-->

<script setup lang="ts">

import { onMounted } from 'vue'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const auth = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (!auth.hasAnyRole(['admin', 'super_admin'])) {
    router.push('/')
  }
})
</script>

<template>
  <div class="admin-page">
    <h1>Admin Dashboard</h1>
    <p>Only admins can see this page</p>
  </div>
</template>

<style scoped>

</style>