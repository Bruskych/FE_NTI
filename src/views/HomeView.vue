<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePostsStore, type Post } from '@/stores/posts'
import { usePartnersStore } from '@/stores/partners'
import { useCallsStore } from '@/stores/calls'
import { useLanguage } from '@/composables/useLanguage'
import api from '@/core/api/axios'

import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import UsersIcon from '@/assets/icons/users.svg'
import EmptyIcon from '@/assets/icons/empty.svg'

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const partnersStore = usePartnersStore()
const callsStore = useCallsStore()
const { currentLang } = useLanguage()

const isLoggedIn = computed(() => authStore.isAuthenticated)

const goRegister = () => router.push('/register')
const goLogin = () => router.push('/login')
const goDashboard = () => router.push('/dashboard')

const faqPosts = ref<Post[]>([])
const faqLoading = ref(true)
const openFaqId = ref<number | null>(null)

const storyPosts = ref<Post[]>([])
const storiesLoading = ref(true)

const searchQuery = ref('')
const programFilter = ref<'all' | 'grant' | 'incubator'>('all')

function toggleFaq(id: number) {
  openFaqId.value = openFaqId.value === id ? null : id
}

// FAQ та історії успіху тягнемо напряму через API, бо postsStore.posts вже зайнятий статтями (type=article)
async function fetchTypedPosts(type: 'faq' | 'success_story'): Promise<Post[]> {
  try {
    const { data } = await api.get('/posts', { params: { type } })
    const list: Post[] = data.data ?? data
    return list.filter((p) => p.status.is_published)
  } catch {
    return []
  }
}

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '')

function mediaUrl(path: string | null): string {
  if (!path) return ''
  if (/^https?:\/\//.test(path)) return path
  return `${apiOrigin}/storage/${path}`
}

const dateLocale = computed(() => (currentLang.value === 'sk' ? 'sk-SK' : 'en-GB'))

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(dateLocale.value, { day: '2-digit', month: 'short', year: 'numeric' })
}

function daysLeft(dateStr: string | null): number {
  if (!dateStr) return 0
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}

const filteredCalls = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  return callsStore.openCalls.filter((call) => {
    const matchesSearch = call.title.toLowerCase().includes(query)
    if (programFilter.value === 'all') return matchesSearch
    const isGrant = !!call.program?.is_grant
    return programFilter.value === 'grant' ? isGrant && matchesSearch : !isGrant && matchesSearch
  })
})

const newsList = computed(() => postsStore.posts.filter((p) => p.status.is_published).slice(0, 3))
const storiesList = computed(() => storyPosts.value.slice(0, 3))

onMounted(() => {
  callsStore.fetchOpenCalls()
  postsStore.fetchPosts('article')
  partnersStore.fetchPartners()
  fetchTypedPosts('faq').then((list) => {
    faqPosts.value = list
    faqLoading.value = false
  })
  fetchTypedPosts('success_story').then((list) => {
    storyPosts.value = list
    storiesLoading.value = false
  })
})
</script>

<template>
  <main class="home">
    <!-- HERO -->
    <section class="hero" aria-labelledby="hero-heading">
      <div class="container hero-grid">
        <div class="hero-copy fade-in">
          <span class="pill hero-pill">
            <span class="pulse-dot" aria-hidden="true"></span>
            {{ $t('home.heroLabel') }}
          </span>
          <h1 id="hero-heading" class="hero-title">{{ $t('home.heroTitle') }}</h1>
          <p class="hero-subtitle">{{ $t('home.heroSubtitle') }}</p>
          <div class="hero-actions">
            <template v-if="!isLoggedIn">
              <BaseButton class="btn-lg" @click="goRegister">
                {{ $t('home.getStarted') }}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </BaseButton>
              <SecondaryButton class="btn-lg" @click="goLogin">{{ $t('header.log_in') }}</SecondaryButton>
            </template>
            <BaseButton v-else class="btn-lg" @click="goDashboard">{{ $t('home.goToDashboard') }}</BaseButton>
          </div>
        </div>

        <div class="hero-highlights fade-in" style="animation-delay: 0.1s">
          <div class="highlight-card">
            <div class="highlight-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <p>{{ $t('home.visualCardA') }}</p>
          </div>
          <div class="highlight-card offset">
            <div class="highlight-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <p>{{ $t('home.visualCardB') }}</p>
          </div>
          <div class="highlight-card">
            <div class="highlight-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5Z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/></svg>
            </div>
            <p>{{ $t('home.visualCardC') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="stats" aria-label="Platform stats">
      <div class="container stats-grid">
        <div class="stat">
          <span class="stat-value">2</span>
          <span class="stat-label">{{ $t('home.statsPrograms') }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">10+</span>
          <span class="stat-label">{{ $t('home.statsSpecializations') }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">UKF</span>
          <span class="stat-label">{{ $t('home.statsUniversity') }}</span>
        </div>
        <div class="stat">
          <span class="stat-value">9</span>
          <span class="stat-label">{{ $t('home.statsRoles') }}</span>
        </div>
      </div>
    </section>

    <!-- ABOUT US -->
    <section id="about-us" class="section" aria-labelledby="about-heading">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.aboutSectionLabel') }}</span>
          <h2 id="about-heading" class="section-title">{{ $t('home.aboutTitle') }}</h2>
        </div>

        <div class="about-grid">
          <div class="about-text fade-in">
            <p>{{ $t('home.aboutText1') }}</p>
            <p class="muted">{{ $t('home.aboutText2') }}</p>
          </div>

          <div class="value-card fade-in">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.5.4.8 1 .8 1.7v.6h6.4v-.6c0-.7.3-1.3.8-1.7A7 7 0 0 0 12 2Z"/></svg>
            </div>
            <h3>{{ $t('home.aboutVal1Title') }}</h3>
            <p>{{ $t('home.aboutVal1Desc') }}</p>
          </div>

          <div class="value-card fade-in" style="animation-delay: 0.08s">
            <div class="value-icon">
              <UsersIcon />
            </div>
            <h3>{{ $t('home.aboutVal2Title') }}</h3>
            <p>{{ $t('home.aboutVal2Desc') }}</p>
          </div>

          <div class="value-card fade-in" style="animation-delay: 0.16s">
            <div class="value-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            </div>
            <h3>{{ $t('home.aboutVal3Title') }}</h3>
            <p>{{ $t('home.aboutVal3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PROGRAMS -->
    <section id="programs" class="section section-alt" aria-labelledby="programs-heading">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.programsSectionLabel') }}</span>
          <h2 id="programs-heading" class="section-title">{{ $t('home.programsTitle') }}</h2>
          <p class="section-subtitle">{{ $t('home.programsSubtitle') }}</p>
        </div>

        <div class="programs-grid">
          <article class="program-card fade-in">
            <span class="pill">{{ $t('home.tagGrant') }}</span>
            <h3>{{ $t('home.programATitle') }}</h3>
            <p class="muted">{{ $t('home.programADesc') }}</p>
            <ul class="feature-list">
              <li v-for="n in 4" :key="n">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {{ $t(`home.programAFeature${n}`) }}
              </li>
            </ul>
            <div class="card-tags">
              <span>#{{ $t('home.tagStudents') }}</span>
              <span>#{{ $t('home.tagMentor') }}</span>
            </div>
          </article>

          <article class="program-card fade-in" style="animation-delay: 0.08s">
            <span class="pill">{{ $t('home.tagCompanies') }}</span>
            <h3>{{ $t('home.programBTitle') }}</h3>
            <p class="muted">{{ $t('home.programBDesc') }}</p>
            <ul class="feature-list">
              <li v-for="n in 4" :key="n">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {{ $t(`home.programBFeature${n}`) }}
              </li>
            </ul>
            <div class="card-tags">
              <span>#{{ $t('home.tagStudents') }}</span>
              <span>#{{ $t('home.tagLivePractice') }}</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- OPEN CALLS -->
    <section class="section" aria-labelledby="calls-heading">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.callsSectionLabel') }}</span>
          <h2 id="calls-heading" class="section-title">{{ $t('home.callsTitle') }}</h2>
          <p class="section-subtitle">{{ $t('home.callsSubtitle') }}</p>
        </div>

        <div class="calls-toolbar">
          <label class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="searchQuery" :placeholder="$t('home.callsSearchPlaceholder')" />
          </label>
          <div class="filter-tabs">
            <button type="button" :class="{ active: programFilter === 'all' }" @click="programFilter = 'all'">{{ $t('home.filterAll') }}</button>
            <button type="button" :class="{ active: programFilter === 'grant' }" @click="programFilter = 'grant'">{{ $t('home.tagGrant') }}</button>
            <button type="button" :class="{ active: programFilter === 'incubator' }" @click="programFilter = 'incubator'">{{ $t('home.filterIncubators') }}</button>
          </div>
        </div>

        <div v-if="callsStore.loading" class="grid-3">
          <div class="skeleton-card" v-for="n in 3" :key="n"></div>
        </div>
        <div v-else-if="filteredCalls.length === 0" class="empty-state">
          <EmptyIcon />
          <p>{{ callsStore.openCalls.length === 0 ? $t('home.callsEmpty') : $t('home.callsNoResults') }}</p>
        </div>
        <div v-else class="grid-3">
          <article
            v-for="(call, index) in filteredCalls"
            :key="call.id"
            class="call-card fade-in"
            :style="{ animationDelay: `${(index % 3) * 0.08}s` }"
          >
            <div class="call-card-top">
              <span v-if="call.program" class="pill">
                {{ call.program.is_grant ? $t('home.tagGrant') : $t('home.tagIncubation') }}
              </span>
              <span class="days-left" :class="{ urgent: daysLeft(call.deadline) <= 7 }">
                {{ daysLeft(call.deadline) }} {{ $t('home.callsDaysLeft') }}
              </span>
            </div>
            <h3>{{ call.title }}</h3>
            <p v-if="call.description" class="muted clamp-2">{{ call.description }}</p>
            <div class="call-card-foot">
              <div>
                <span class="label">{{ $t('home.callsDeadline') }}</span>
                <span class="value">{{ formatDate(call.deadline) }}</span>
              </div>
              <span v-if="call.budget" class="budget">{{ Number(call.budget).toLocaleString() }} €</span>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="section section-alt" aria-labelledby="how-heading">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.howSectionLabel') }}</span>
          <h2 id="how-heading" class="section-title">{{ $t('home.howTitle') }}</h2>
        </div>

        <div class="steps-grid">
          <div v-for="n in 4" :key="n" class="step-card fade-in" :style="{ animationDelay: `${(n - 1) * 0.08}s` }">
            <span class="step-index">0{{ n }}</span>
            <h3>{{ $t(`home.step${n}Title`) }}</h3>
            <p class="muted">{{ $t(`home.step${n}Desc`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- PARTNERS -->
    <section id="partners" class="section" aria-labelledby="partners-heading">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.partnersSectionLabel') }}</span>
          <h2 id="partners-heading" class="section-title">{{ $t('home.partnersTitle') }}</h2>
        </div>

        <div v-if="partnersStore.loading" class="grid-4">
          <div class="skeleton-card small" v-for="n in 4" :key="n"></div>
        </div>
        <div v-else-if="partnersStore.partners.length === 0" class="empty-state">
          <EmptyIcon />
          <p>{{ $t('home.partnersEmpty') }}</p>
        </div>
        <div v-else class="partners-grid">
          <a
            v-for="(partner, index) in partnersStore.partners"
            :key="partner.id"
            :href="partner.website_link"
            target="_blank"
            rel="noopener"
            class="partner-tile fade-in"
            :style="{ animationDelay: `${(index % 6) * 0.05}s` }"
          >
            <img v-if="partner.logo_url" :src="partner.logo_url" :alt="partner.organization?.name ?? 'Partner'" loading="lazy" />
            <span v-else class="partner-name">{{ partner.organization?.name ?? partner.website_link }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- NEWS -->
    <section id="news" class="section section-alt" aria-labelledby="news-heading">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.newsSectionLabel') }}</span>
          <h2 id="news-heading" class="section-title">{{ $t('home.newsTitle') }}</h2>
        </div>

        <div v-if="postsStore.loading" class="grid-3">
          <div class="skeleton-card" v-for="n in 3" :key="n"></div>
        </div>
        <div v-else-if="newsList.length === 0" class="empty-state">
          <EmptyIcon />
          <p>{{ $t('home.newsEmpty') }}</p>
        </div>
        <div v-else class="grid-3">
          <RouterLink
            v-for="(post, index) in newsList"
            :key="post.id"
            :to="{ name: 'post', params: { slug: post.slug } }"
            class="content-card fade-in"
            :style="{ animationDelay: `${(index % 3) * 0.08}s` }"
          >
            <div v-if="post.featured_image" class="content-media">
              <img :src="mediaUrl(post.featured_image)" :alt="post.title" loading="lazy" />
            </div>
            <div class="content-body">
              <div class="content-meta">
                <span class="pill">{{ $t('home.newsTagArticle') }}</span>
                <span class="muted">{{ formatDate(post.status.published_at) }}</span>
              </div>
              <h3>{{ post.title }}</h3>
              <p v-if="post.excerpt" class="muted clamp-2">{{ post.excerpt }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- SUCCESS STORIES -->
    <section class="section" aria-labelledby="stories-heading">
      <div class="container">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.storiesSectionLabel') }}</span>
          <h2 id="stories-heading" class="section-title">{{ $t('home.storiesTitle') }}</h2>
          <p class="section-subtitle">{{ $t('home.storiesSubtitle') }}</p>
        </div>

        <div v-if="storiesLoading" class="grid-3">
          <div class="skeleton-card" v-for="n in 3" :key="n"></div>
        </div>
        <div v-else-if="storiesList.length === 0" class="empty-state">
          <EmptyIcon />
          <p>{{ $t('home.storiesEmpty') }}</p>
        </div>
        <div v-else class="grid-3">
          <RouterLink
            v-for="(post, index) in storiesList"
            :key="post.id"
            :to="{ name: 'post', params: { slug: post.slug } }"
            class="content-card fade-in"
            :style="{ animationDelay: `${(index % 3) * 0.08}s` }"
          >
            <div v-if="post.featured_image" class="content-media">
              <img :src="mediaUrl(post.featured_image)" :alt="post.title" loading="lazy" />
            </div>
            <div class="content-body">
              <span class="pill">{{ $t('home.storiesTag') }}</span>
              <h3>{{ post.title }}</h3>
              <p v-if="post.excerpt" class="muted clamp-2">{{ post.excerpt }}</p>
              <div v-if="post.author" class="author-row">
                <span class="author-avatar">{{ post.author.name.charAt(0) }}</span>
                <span>{{ post.author.name }}</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section section-alt" aria-labelledby="faq-heading">
      <div class="container container-narrow">
        <div class="section-head">
          <span class="eyebrow">{{ $t('home.faqSectionLabel') }}</span>
          <h2 id="faq-heading" class="section-title">{{ $t('home.faqTitle') }}</h2>
        </div>

        <div v-if="faqLoading" class="faq-list">
          <div class="skeleton-bar" v-for="n in 4" :key="n"></div>
        </div>
        <div v-else-if="faqPosts.length === 0" class="empty-state">
          <EmptyIcon />
          <p>{{ $t('home.faqEmpty') }}</p>
        </div>
        <div v-else class="faq-list">
          <div v-for="post in faqPosts" :key="post.id" class="faq-item" :class="{ open: openFaqId === post.id }">
            <button type="button" class="faq-question" :aria-expanded="openFaqId === post.id" @click="toggleFaq(post.id)">
              <span>{{ post.title }}</span>
              <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div v-show="openFaqId === post.id" class="faq-answer" v-html="post.content"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section v-if="!isLoggedIn" class="section" aria-labelledby="cta-heading">
      <div class="container">
        <div class="cta-box fade-in">
          <h2 id="cta-heading">{{ $t('home.ctaTitle') }}</h2>
          <p>{{ $t('home.ctaSubtitle') }}</p>
          <div class="cta-actions">
            <BaseButton class="btn-lg cta-primary" @click="goRegister">{{ $t('home.getStarted') }}</BaseButton>
            <SecondaryButton class="btn-lg cta-secondary" @click="goLogin">{{ $t('header.log_in') }}</SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
}

.container {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
}
.container-narrow {
  max-width: 820px;
}

.section {
  padding: 88px 0;
}
.section-alt {
  background: var(--menu-color);
  border-top: 1px solid var(--menu-border);
  border-bottom: 1px solid var(--menu-border);
}

.section-head {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2.5px;
  color: var(--main-color);
}
.section-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 10px 0 0;
  color: var(--text-color);
}
.section-subtitle {
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text-color-unimp);
  margin: 14px 0 0;
}
.muted {
  color: var(--text-color-unimp);
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  white-space: nowrap;
}

.btn-lg {
  padding: 14px 30px !important;
  font-size: 1rem;
  gap: 10px;
  border-radius: 10px;
}
.btn-lg svg {
  width: 18px;
  height: 18px;
}

/* FADE IN */
.fade-in {
  animation: fadeInUp 0.6s ease both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* HERO */
.hero {
  padding: 72px 0 56px;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 64px;
  align-items: center;
}
.hero-pill {
  margin-bottom: 20px;
}
.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--good-color);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.35;
  }
}
.hero-title {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -1px;
  color: var(--text-color);
  margin: 0 0 18px;
}
.hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--text-color-unimp);
  max-width: 520px;
  margin: 0 0 32px;
}
.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.hero-highlights {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.highlight-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 22px 24px;
}
.highlight-card.offset {
  margin-left: 32px;
}
.highlight-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--main-color-light);
  color: var(--main-color);
}
.highlight-icon svg {
  width: 22px;
  height: 22px;
}
.highlight-card p {
  margin: 0;
  padding-top: 8px;
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--card-text-color);
}

/* STATS */
.stats {
  padding: 36px 0;
  border-top: 1px solid var(--menu-border);
  border-bottom: 1px solid var(--menu-border);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  text-align: center;
}
.stat {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.stat:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -12px;
  top: 15%;
  bottom: 15%;
  width: 1px;
  background: var(--menu-border);
}
.stat-value {
  font-size: 2.1rem;
  font-weight: 800;
  color: var(--main-color);
}
.stat-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-color-unimp);
}

/* ABOUT */
.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.about-text {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 32px;
}
.about-text p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--card-text-color);
}
.value-card {
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 28px;
}
.value-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--main-color-light);
  color: var(--main-color);
  margin-bottom: 18px;
}
.value-icon svg {
  width: 22px;
  height: 22px;
}
.value-card h3 {
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--card-text-color);
}
.value-card p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-color-unimp);
}

/* PROGRAMS */
.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 28px;
}
.program-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  padding: 36px;
  transition: border-color 0.2s ease;
}
.program-card h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--card-text-color);
}
.program-card > p {
  margin: 0;
  line-height: 1.65;
}
.feature-list {
  list-style: none;
  margin: 0;
  padding: 20px 0 0;
  border-top: 1px solid var(--menu-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.feature-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.92rem;
  color: var(--card-text-color);
}
.feature-list svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--good-color);
}
.card-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-color-unimp);
}

/* TOOLBAR */
.calls-toolbar {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  padding: 14px 20px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 220px;
  color: var(--text-color-unimp);
}
.search-box svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.search-box input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.92rem;
  color: var(--text-color);
}
.search-box input::placeholder {
  color: var(--text-color-unimp);
}
.filter-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 10px;
  padding: 4px;
}
.filter-tabs button {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-unimp);
}
.filter-tabs button.active {
  background: var(--main-color);
  color: var(--button-text-color);
}

/* GRIDS */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
.grid-4 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

/* CALL CARDS */
.call-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 24px;
  transition: border-color 0.2s ease;
}
.call-card:hover,
.content-card:hover,
.program-card:hover,
.value-card:hover,
.partner-tile:hover,
.step-card:hover {
  border-color: var(--main-color);
}
.call-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.days-left {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-color-unimp);
}
.days-left::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--good-color);
}
.days-left.urgent {
  color: var(--error-color);
}
.days-left.urgent::before {
  background: var(--error-color);
}
.call-card h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--card-text-color);
}
.clamp-2 {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.call-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--menu-border);
}
.call-card-foot .label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-color-unimp);
}
.call-card-foot .value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--card-text-color);
}
.budget {
  font-size: 1rem;
  font-weight: 800;
  color: var(--main-color);
}

/* EMPTY / SKELETON */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 56px 24px;
  text-align: center;
  color: var(--text-color-unimp);
  background: var(--card-bg-color);
  border: 1px dashed var(--menu-border);
  border-radius: 16px;
}
.empty-state svg {
  width: 40px;
  height: 40px;
  opacity: 0.6;
}
.skeleton-card,
.skeleton-bar {
  background: linear-gradient(90deg, var(--card-bg-color) 25%, var(--card-bg-color-hover) 50%, var(--card-bg-color) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite linear;
  border-radius: 16px;
}
.skeleton-card {
  height: 220px;
}
.skeleton-card.small {
  height: 100px;
}
.skeleton-bar {
  height: 56px;
  border-radius: 12px;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* STEPS */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
.step-card {
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  padding: 28px;
  transition: border-color 0.2s ease;
}
.step-index {
  display: inline-block;
  margin-bottom: 12px;
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--main-color);
}
.step-card h3 {
  margin: 0 0 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--card-text-color);
}
.step-card p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* PARTNERS */
.partners-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}
.partner-tile {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  padding: 20px;
  background: var(--main-light-1);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  text-decoration: none;
  color: var(--main-dark-1);
  transition: border-color 0.2s ease;
}
.partner-tile img {
  max-width: 100%;
  max-height: 48px;
  object-fit: contain;
}
.partner-name {
  font-weight: 700;
  font-size: 0.95rem;
  text-align: center;
}

/* CONTENT CARDS (news / stories) */
.content-card {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 16px;
  transition: border-color 0.2s ease;
}
.content-media {
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: var(--menu-color);
}
.content-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.content-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  flex: 1;
}
.content-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.78rem;
}
.content-card h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--card-text-color);
}
.author-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: auto;
  padding-top: 8px;
}
.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--main-color);
  color: var(--button-text-color);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}
.author-row span:last-child {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-color-unimp);
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.faq-item {
  background: var(--card-bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.faq-item.open {
  border-color: var(--main-color);
}
.faq-question {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  text-align: left;
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--card-text-color);
}
.faq-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
  color: var(--text-color-unimp);
}
.faq-item.open .faq-icon {
  transform: rotate(180deg);
  color: var(--main-color);
}
.faq-answer {
  padding: 0 24px 22px;
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--text-color-unimp);
}
.faq-answer :deep(p) {
  margin: 0 0 12px;
}
.faq-answer :deep(p:last-child) {
  margin-bottom: 0;
}
.faq-answer :deep(a) {
  color: var(--main-color);
}
.faq-answer :deep(ul),
.faq-answer :deep(ol) {
  padding-left: 20px;
  margin: 0 0 12px;
}
.faq-answer :deep(strong) {
  color: var(--card-text-color);
}

/* CTA */
.cta-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 64px 40px;
  border-radius: 24px;
  background: linear-gradient(135deg, var(--main-color) 0%, var(--main-color-dark) 100%);
  color: var(--main-light-1);
}
.cta-box h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 800;
}
.cta-box p {
  margin: 0;
  max-width: 580px;
  line-height: 1.65;
  opacity: 0.92;
}
.cta-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}
.cta-primary {
  background: var(--main-light-1) !important;
  color: var(--main-color-dark) !important;
}
.cta-secondary {
  border-color: var(--main-light-1) !important;
  color: var(--main-light-1) !important;
  background: transparent !important;
}

/* SCROLL ANCHORS */
#about-us,
#programs,
#news,
#partners {
  scroll-margin-top: 92px;
}

/* RESPONSIVE */
@media (max-width: 992px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .hero-highlights {
    order: -1;
  }
  .highlight-card.offset {
    margin-left: 0;
  }
  .about-grid {
    grid-template-columns: 1fr;
  }
  .about-text {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
@media (max-width: 768px) {
  .container {
    padding: 0 20px;
  }
  .section {
    padding: 56px 0;
  }
  .section-head {
    margin-bottom: 36px;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px 16px;
  }
  .stat::after {
    display: none !important;
  }
  .calls-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
@media (max-width: 640px) {
  .hero {
    padding: 48px 0 40px;
  }
  .hero-actions {
    flex-direction: column;
  }
  .hero-actions > * {
    width: 100%;
    justify-content: center;
  }
}
</style>
