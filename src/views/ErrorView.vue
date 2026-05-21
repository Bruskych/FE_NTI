<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import WarningIcon from '@/assets/icons/warning.svg'
import {computed} from "vue";

const router = useRouter()
const route = useRoute()

const goHome = () => {
  router.push('/')
}
const requestedPage = computed(() => route.fullPath)
</script>

<template>
  <div class="error-page">
    <div class="error-box">

      <WarningIcon class="error-icon" />

      <h1 class="title">
        {{ $t('error.not_found_title') }}
      </h1>

      <p class="description">
        {{ $t('error.not_found_description1') }}
        <span class="page-name">
          "<b>{{ requestedPage }}</b>"
        </span>
        {{ $t('error.not_found_description2') }}
      </p>

      <BaseButton class="button" @click="goHome">{{ $t('error.home_button') }}</BaseButton>

    </div>
  </div>
</template>

<style scoped>
.error-icon {
  width: 200px;
  height: 200px;
  stroke-width: 1.0;
  color: var(--text-color);
  margin-bottom: 16px;
}
.error-page {
  font-family: var(--font-main), sans-serif;
  font-weight: 550;

  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
}
.error-box {
  text-align: center;
  max-width: 500px;

  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  color: var(--text-color);

  font-size: 40px;
  font-weight: 550;
  margin-bottom: 16px;
}
.description {
  color: var(--text-color);

  font-size: 20px;
  line-height: 1.6;
  margin-bottom: 20px;
  opacity: 0.9;
}
.page-name {
  color: var(--error-color);
}
.button {
  font-size: 18px;
  padding: 12px 24px;
}
</style>