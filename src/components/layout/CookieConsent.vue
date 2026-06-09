<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'

const isVisible = ref(true)
const isMarketingChecked = ref(false)

onMounted(() => {
  const hasConsent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='))

  if (!hasConsent) {
    setTimeout(() => {
      isVisible.value = true
    }, 1000)
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
    <div v-if="isVisible" class="cookie-consent">
      <div class="cookie-content">
        <p class="cookie-text">
          {{ $t('notification.cookie.cookie_desc') }}
        </p>

        <div class="cookie-options">
          <div class="cookie-option-item">
            <input
                type="checkbox"
                id="essential-cookies"
                checked
                disabled
            />
            <label for="essential-cookies">
              {{ $t('notification.cookie.necessary') }}
            </label>

            <div class="cookie-tooltip-wrapper">
              <button type="button" class="btn-tooltip">?</button>
              <div class="tooltip-popup">
                <p>{{ $t('notification.cookie.necessary_tooltip') }}</p>
              </div>
            </div>

          </div>

          <div class="cookie-option-item interactive">
            <input
                type="checkbox"
                id="marketing-cookies"
                v-model="isMarketingChecked"
            />
            <label for="marketing-cookies">
              {{ $t('notification.cookie.marketing') }}
            </label>

            <div class="cookie-tooltip-wrapper">
              <button type="button" class="btn-tooltip">?</button>

              <div class="tooltip-popup">
                <p>{{ $t('notification.cookie.marketing_tooltip') }}</p>
              </div>
            </div>
          </div>

        </div>

        <div class="cookie-actions">
          <SecondaryButton @click="acceptSelectedCookies">
            {{ $t('notification.cookie.allow_selected') }}
          </SecondaryButton>

          <BaseButton @click="acceptCookies">
            {{ $t('notification.cookie.allow_all') }}
          </BaseButton>
        </div>

      </div>
    </div>
  </transition>
</template>

<style scoped>
.cookie-consent {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  width: 420px;
  max-width: calc(100vw - 48px);
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
  padding: 18px 20px;

  & .cookie-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  & .cookie-text {
    margin: 0;
    font-size: 0.85rem;
    line-height: 1.5;
    color: var(--text-color);
    opacity: 0.85;
  }

  & .cookie-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 2px 0;
  }

  & .cookie-option-item {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: var(--text-color);
    user-select: none;

    & input[type="checkbox"] {
      margin: 0 8px 0 0;
      cursor: not-allowed;
    }

    & label {
      font-weight: 550;
      opacity: 0.9;
      cursor: not-allowed;
    }

    &.interactive {
      & input[type="checkbox"], & label {
        cursor: pointer;
      }
    }

    & .cookie-tooltip-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-left: 6px;

      & .btn-tooltip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        padding: 0;
        font-size: 0.85rem;
        font-weight: 700;
        background: var(--menu-border);
        border: 1px solid var(--menu-border);
        border-radius: 50%;
        color: var(--text-color);
        cursor: pointer;
      }

      & .tooltip-popup {
        position: absolute;
        bottom: calc(100% + 12px);
        left: 50%;
        transform: translateX(-50%) translateY(8px);
        width: 280px;
        background: var(--menu-color);
        border: 1px solid var(--menu-border);
        padding: 12px 14px;
        border-radius: 8px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
        z-index: 10000;

        opacity: 0;
        visibility: hidden;
        pointer-events: none;

        & p {
          margin: 0;
          font-size: 0.85rem;
          line-height: 1.4;
          color: var(--text-color);
          opacity: 0.9;
          text-align: left;

          &:not(:last-child) {
            margin-bottom: 8px;
          }
        }

        &::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px;
          border-style: solid;
          border-color: var(--menu-border) transparent transparent transparent;
        }
      }

      &:hover {
        & .btn-tooltip {
          background: var(--menu-color);
          border-color: var(--main-color);
          transform: scale(1.05);
        }

        & .tooltip-popup {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
      }
    }
  }
  & .cookie-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;

    & :deep(.base-button) {
      font-size: 0.85rem;
      white-space: nowrap;
    }
  }
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(40px) scale(0.95);
  opacity: 0;
}
</style>