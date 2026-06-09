<script setup lang="ts">
import { ref } from 'vue'

const accepted = ref(!!localStorage.getItem('cookie_consent'))

function accept() {
  localStorage.setItem('cookie_consent', '1')
  accepted.value = true
}
</script>

<template>
  <Transition name="cookie-slide">
    <div v-if="!accepted" class="cookie-bar">
      <div class="cookie-inner">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="cookie-icon" aria-hidden="true">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
          <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
        </svg>
        <p class="cookie-text">{{ $t('cookie.message') }}</p>
        <button class="cookie-btn" @click="accept">{{ $t('cookie.accept') }}</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-bar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: calc(100% - 48px);
  max-width: 720px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  font-family: var(--font-main), sans-serif;
}

.cookie-inner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
}

.cookie-icon {
  flex-shrink: 0;
  color: var(--main-color);
}

.cookie-text {
  flex: 1;
  margin: 0;
  font-size: 13.5px;
  line-height: 1.5;
  color: var(--text-color);
  opacity: 0.85;
}

.cookie-btn {
  flex-shrink: 0;
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  background: var(--main-color);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s, transform 0.15s;
  white-space: nowrap;
}
.cookie-btn:hover { opacity: 0.88; transform: translateY(-1px); }

/* Transition */
.cookie-slide-enter-active,
.cookie-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.cookie-slide-enter-from,
.cookie-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

@media (max-width: 540px) {
  .cookie-inner { flex-wrap: wrap; }
  .cookie-btn { width: 100%; text-align: center; }
}
</style>
