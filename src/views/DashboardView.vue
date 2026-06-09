<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)
const role = computed(() => user.value?.roles?.[0]?.name ?? 'visitor')

const firstName = computed(() => {
  const name = user.value?.name ?? ''
  return name.split(' ')[0]
})

interface DashCard {
  titleKey: string
  descKey: string
  to: string
  icon: string
  accent?: string
  roles?: string[]
}

const allCards: DashCard[] = [
  // Student / team_leader
  {
    titleKey: 'dashboard.card_team',
    descKey: 'dashboard.card_team_desc',
    to: '/team',
    icon: 'team',
    roles: ['student', 'team_leader'],
  },
  {
    titleKey: 'dashboard.card_calls',
    descKey: 'dashboard.card_calls_desc',
    to: '/calls',
    icon: 'calls',
    roles: ['student', 'team_leader', 'evaluator', 'admin', 'super_admin'],
  },
  {
    titleKey: 'dashboard.card_applications',
    descKey: 'dashboard.card_applications_desc',
    to: '/applications',
    icon: 'apps',
    roles: ['student', 'team_leader'],
  },
  {
    titleKey: 'dashboard.card_project',
    descKey: 'dashboard.card_project_desc',
    to: '/project',
    icon: 'project',
    roles: ['student', 'team_leader', 'mentor'],
  },
  // Company
  {
    titleKey: 'dashboard.card_challenges',
    descKey: 'dashboard.card_challenges_desc',
    to: '/challenges',
    icon: 'challenges',
    roles: ['company'],
  },
  {
    titleKey: 'dashboard.card_organization',
    descKey: 'dashboard.card_organization_desc',
    to: '/organization',
    icon: 'org',
    roles: ['company'],
  },
  // Mentor
  {
    titleKey: 'dashboard.card_mentorships',
    descKey: 'dashboard.card_mentorships_desc',
    to: '/mentorships',
    icon: 'mentor',
    roles: ['mentor', 'admin', 'super_admin'],
  },
  // Documents
  {
    titleKey: 'dashboard.card_documents',
    descKey: 'dashboard.card_documents_desc',
    to: '/documents',
    icon: 'documents',
    roles: ['student', 'team_leader', 'mentor', 'company', 'admin', 'super_admin'],
  },
  // Admin
  {
    titleKey: 'dashboard.card_admin',
    descKey: 'dashboard.card_admin_desc',
    to: '/admin',
    icon: 'admin',
    roles: ['admin', 'super_admin'],
  },
  // Settings - everyone (except visitor)
  {
    titleKey: 'dashboard.card_settings',
    descKey: 'dashboard.card_settings_desc',
    to: '/settings',
    icon: 'settings',
    roles: ['student', 'team_leader', 'company', 'mentor', 'evaluator', 'content_editor', 'admin', 'super_admin'],
  },
]

const visibleCards = computed(() =>
  allCards.filter(card =>
    !card.roles || card.roles.includes(role.value)
  )
)

const navigate = (to: string) => router.push(to)
</script>

<template>
  <div class="dashboard">
    <div class="dashboard-inner">

      <div class="dash-header">
        <div class="dash-greeting">
          <span class="greeting-text">{{ $t('dashboard.greeting', { name: firstName }) }}</span>
          <span class="role-badge">{{ role }}</span>
        </div>
        <p class="dash-subtitle">{{ $t('dashboard.subtitle') }}</p>
      </div>

      <div v-if="role === 'visitor'" class="visitor-notice">
        <div class="notice-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div>
          <h3>{{ $t('dashboard.visitor_title') }}</h3>
          <p>{{ $t('dashboard.visitor_desc') }}</p>
        </div>
      </div>

      <div v-else class="cards-grid">
        <button
            v-for="card in visibleCards"
            :key="card.to"
            class="dash-card"
            @click="navigate(card.to)"
        >
          <div class="card-icon">
            <!-- team -->
            <svg v-if="card.icon === 'team'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <!-- calls -->
            <svg v-else-if="card.icon === 'calls'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <!-- apps -->
            <svg v-else-if="card.icon === 'apps'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <!-- project -->
            <svg v-else-if="card.icon === 'project'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
            <!-- challenges -->
            <svg v-else-if="card.icon === 'challenges'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <!-- org -->
            <svg v-else-if="card.icon === 'org'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <!-- mentor -->
            <svg v-else-if="card.icon === 'mentor'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <!-- documents -->
            <svg v-else-if="card.icon === 'documents'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <!-- admin -->
            <svg v-else-if="card.icon === 'admin'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <!-- settings -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>

          <div class="card-body">
            <span class="card-title">{{ $t(card.titleKey) }}</span>
            <span class="card-desc">{{ $t(card.descKey) }}</span>
          </div>

          <div class="card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </div>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.dashboard {
  font-family: var(--font-main), sans-serif;
  background: var(--bg-color);
  min-height: calc(100vh - 75px);
  padding: 48px 40px;
  color: var(--text-color);
  box-sizing: border-box;
}

.dashboard-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.dash-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dash-greeting {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.greeting-text {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: -0.5px;
}

.role-badge {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  padding: 4px 12px;
  border-radius: 100px;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  border: 1px solid color-mix(in srgb, var(--main-color) 20%, transparent);
}

.dash-subtitle {
  font-size: 15px;
  color: var(--text-color);
  opacity: 0.65;
  margin: 0;
}

.visitor-notice {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  padding: 28px 32px;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  color: var(--text-color);
}

.notice-icon {
  color: var(--wait-color);
  flex-shrink: 0;
  margin-top: 2px;
}

.visitor-notice h3 {
  margin: 0 0 6px 0;
  font-size: 17px;
  font-weight: 700;
}

.visitor-notice p {
  margin: 0;
  font-size: 14px;
  opacity: 0.75;
  line-height: 1.6;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.dash-card {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  width: 100%;
  box-sizing: border-box;
}

.dash-card:hover {
  border-color: var(--main-color);
  background: var(--card-bg-color-hover);
  transform: translateY(-2px);
}

.dash-card:hover .card-icon {
  background: var(--main-color);
  color: #fff;
}

.dash-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--main-color);
}

.card-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--main-color-light);
  color: var(--main-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, color 0.2s ease;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 12.5px;
  color: var(--text-color);
  opacity: 0.6;
  line-height: 1.4;
}

.card-arrow {
  color: var(--main-color);
  flex-shrink: 0;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

@media (max-width: 600px) {
  .dashboard {
    padding: 32px 20px;
  }
  .cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
