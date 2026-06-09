<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isVisible = ref(false)
const isMarketingChecked = ref(false)

onMounted(() => {
  const hasConsent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='))
  if (!hasConsent) {
    setTimeout(() => { isVisible.value = true }, 1000)
  }
})

const acceptCookies = () => {
  document.cookie = "cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax"
  document.cookie = "cookie_marketing=accepted; max-age=31536000; path=/; SameSite=Lax"
  isVisible.value = false
}

const acceptSelectedCookies = () => {
  document.cookie = "cookie_consent=essential; max-age=31536000; path=/; SameSite=Lax"
  const marketingStatus = isMarketingChecked.value ? 'accepted' : 'declined'
  document.cookie = `cookie_marketing=${marketingStatus}; max-age=31536000; path=/; SameSite=Lax`
  isVisible.value = false
}
</script>

<template>
  <transition name="slide-up">
    <div v-if="isVisible" class="cookie-banner" role="dialog" aria-label="Cookie settings">

      <div class="cookie-header">
        <div class="cookie-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
            <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
          </svg>
        </div>
        <span class="cookie-title">{{ $t('notification.cookie.necessary') }}</span>
      </div>

      <p class="cookie-desc">{{ $t('notification.cookie.cookie_desc') }}</p>

      <div class="cookie-toggles">
        <!-- Essential — always on -->
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">{{ $t('notification.cookie.necessary') }}</span>
            <div class="tooltip-wrap">
              <span class="help-dot">?</span>
              <div class="tooltip-box">{{ $t('notification.cookie.necessary_tooltip') }}</div>
            </div>
          </div>
          <div class="toggle-switch toggle-locked" aria-disabled="true">
            <div class="toggle-thumb"></div>
          </div>
        </div>

        <!-- Marketing — toggleable -->
        <div class="toggle-row">
          <div class="toggle-info">
            <span class="toggle-label">{{ $t('notification.cookie.marketing') }}</span>
            <div class="tooltip-wrap">
              <span class="help-dot">?</span>
              <div class="tooltip-box">{{ $t('notification.cookie.marketing_tooltip') }}</div>
            </div>
          </div>
          <button
            type="button"
            class="toggle-switch"
            :class="{ 'toggle-on': isMarketingChecked }"
            :aria-checked="isMarketingChecked"
            role="switch"
            @click="isMarketingChecked = !isMarketingChecked"
          >
            <div class="toggle-thumb"></div>
          </button>
        </div>
      </div>

      <div class="cookie-actions">
        <button type="button" class="btn-secondary" @click="acceptSelectedCookies">
          {{ $t('notification.cookie.allow_selected') }}
        </button>
        <button type="button" class="btn-primary" @click="acceptCookies">
          {{ $t('notification.cookie.allow_all') }}
        </button>
      </div>

    </div>
  </transition>
</template>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  width: 400px;
  max-width: calc(100vw - 32px);
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 18px;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0,0,0,0.12);
  padding: 20px 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: var(--font-main), sans-serif;
}

/* Header */
.cookie-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cookie-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--main-color-light);
  color: var(--main-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cookie-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-color);
  letter-spacing: -0.2px;
}

/* Description */
.cookie-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--text-color);
  opacity: 0.7;
}

/* Toggle rows */
.cookie-toggles {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--menu-border);
  border-radius: 12px;
  /* НЕ overflow:hidden — tooltip позиціонується абсолютно, його не можна клопувати */
}

.toggle-row:first-child { border-radius: 12px 12px 0 0; }
.toggle-row:last-child  { border-radius: 0 0 12px 12px; }

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 14px;
  background: color-mix(in srgb, var(--bg-color) 40%, transparent);
}

.toggle-row + .toggle-row {
  border-top: 1px solid var(--menu-border);
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.toggle-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

/* Tooltip */
.tooltip-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.help-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  background: var(--menu-border);
  color: var(--text-color);
  cursor: default;
  opacity: 0.65;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  flex-shrink: 0;
  user-select: none;
}

.tooltip-wrap:hover .help-dot {
  opacity: 1;
  background: color-mix(in srgb, var(--main-color) 18%, transparent);
  color: var(--main-color);
}

.tooltip-box {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 230px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--text-color);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  z-index: 10002;
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform: translateY(6px);
  white-space: normal;
}

.tooltip-wrap:hover .tooltip-box {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Toggle switch — div (locked) і button (interactive) */
.toggle-switch {
  width: 40px;
  height: 22px;
  border-radius: 100px;
  background: var(--menu-border);
  border: none;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
  /* Надійний позиційний підхід замість flex + translateX */
  position: relative;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
}

.toggle-switch:focus-visible {
  outline: 2px solid var(--main-color);
  outline-offset: 2px;
}

.toggle-on {
  background: var(--main-color);
}

.toggle-locked {
  background: color-mix(in srgb, var(--main-color) 55%, transparent);
  cursor: not-allowed;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-on .toggle-thumb,
.toggle-locked .toggle-thumb {
  left: calc(100% - 19px); /* 40 - 3 - 16 - 2 = 19px від правого краю */
}

/* Actions */
.cookie-actions {
  display: flex;
  gap: 8px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 9px 12px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.18s, border-color 0.18s, transform 0.12s;
  white-space: nowrap;
}

.btn-secondary {
  background: transparent;
  border-color: var(--menu-border);
  color: var(--text-color);
}

.btn-secondary:hover {
  border-color: var(--main-color);
  color: var(--main-color);
}

.btn-primary {
  background: var(--main-color);
  color: #fff;
}

.btn-primary:hover {
  background: var(--main-color-dark);
  transform: translateY(-1px);
}

.btn-secondary:active,
.btn-primary:active {
  transform: scale(0.97);
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}

@media (max-width: 480px) {
  .cookie-banner {
    bottom: 12px;
    right: 12px;
    left: 12px;
    width: auto;
    max-width: 100%;
  }
}
</style>
