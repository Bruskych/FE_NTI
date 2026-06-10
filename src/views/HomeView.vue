<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePostsStore, type Post } from '@/stores/posts'
import { usePartnersStore, type Partner } from '@/stores/partners'
import { useCallsStore } from '@/stores/calls'
import api from '@/core/api/axios'

import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const postsStore = usePostsStore()
const partnersStore = usePartnersStore()
const callsStore = useCallsStore()

const isLoggedIn = computed(() => authStore.isAuthenticated)

const goRegister = () => router.push('/register')
const goLogin    = () => router.push('/login')

let observer: IntersectionObserver | null = null

const faqPosts = ref<Post[]>([])
const faqLoading = ref(false)
const openFaqId = ref<number | null>(null)

const storiesPosts = ref<Post[]>([])
const storiesLoading = ref(false)

function toggleFaq(id: number) {
  openFaqId.value = openFaqId.value === id ? null : id
}

async function fetchTypedPosts(type: 'faq' | 'success_story'): Promise<Post[]> {
  try {
    const { data } = await api.get('/posts', { params: { type } })
    const payload = data as { data?: Post[] } | Post[]
    const list = Array.isArray(payload) ? payload : (payload.data ?? [])
    return list.filter((p: Post) => p.status.is_published)
  } catch {
    return []
  }
}

const apiOrigin = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '')

function featuredImageUrl(path: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//.test(path)) return path
  return `${apiOrigin}/storage/${path}`
}

onMounted(async () => {
  const targets = document.querySelectorAll('.reveal-card')
  if (targets.length > 0) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          observer?.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    })
    targets.forEach(el => observer?.observe(el))
  }

  faqLoading.value = true
  storiesLoading.value = true
  await Promise.all([
    postsStore.fetchPosts('article'),
    partnersStore.fetchPartners(),
    callsStore.fetchOpenCalls(),
    fetchTypedPosts('faq').then(list => { faqPosts.value = list }),
    fetchTypedPosts('success_story').then(list => { storiesPosts.value = list }),
  ])
  faqLoading.value = false
  storiesLoading.value = false
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

const newsList = computed(() =>
  postsStore.posts.filter((p: Post) => p.status.is_published).slice(0, 3)
)

const successList = computed(() => storiesPosts.value.slice(0, 3))

const partnerNames = computed(() =>
  partnersStore.partners.map((p: Partner) => p.organization?.name ?? p.website_link)
)

const upcomingCalls = computed(() => callsStore.openCalls.slice(0, 6))

function formatPostDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('sk-SK', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
</script>

<template>
  <main class="v-workspace">
    <div class="v-blur-spot spot-1" aria-hidden="true"></div>
    <div class="v-blur-spot spot-2" aria-hidden="true"></div>

    <section class="v-hero-block section-padding" aria-labelledby="hero-heading">
      <div class="v-container hero-layout">
        <div class="hero-left reveal-card">
          <div class="inline-badge">
            <span class="badge-dot"></span>
            <span>{{ $t('home.heroLabel') }}</span>
          </div>
          <h1 id="hero-heading" class="hero-main-title">
            {{ $t('home.heroTitle') }}
          </h1>
          <p class="hero-description">{{ $t('home.heroSubtitle') }}</p>
          
          <div class="hero-buttons" v-if="!isLoggedIn">
            <BaseButton size="large" @click="goRegister" class="v-btn-primary">
              <span>{{ $t('home.getStarted') }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </BaseButton>
            <SecondaryButton size="large" @click="goLogin" class="v-btn-secondary">
              {{ $t('header.log_in') }}
            </SecondaryButton>
          </div>
          <div class="hero-buttons" v-else>
            <BaseButton size="large" to="/dashboard" class="v-btn-primary">{{ $t('home.goToDashboard') }}</BaseButton>
          </div>
        </div>

        <div class="hero-right reveal-card" aria-hidden="true">
          <div class="interactive-dashboard-mockup">
            <div class="mockup-header">
              <span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span>
            </div>
            <div class="mockup-grid">
              <div class="mockup-box box-a element-float-1">
                <span class="m-badge m-badge-a">Program A</span>
                <p>{{ $t('home.visualCardA') }}</p>
              </div>
              <div class="mockup-box box-b element-float-2">
                <span class="m-badge m-badge-b">Program B</span>
                <p>{{ $t('home.visualCardB') }}</p>
              </div>
              <div class="mockup-box box-c element-float-3">
                <div class="huge-metric">2 → ∞</div>
                <p>{{ $t('home.visualCardC') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="v-stats-bar" aria-label="Statistika">
      <div class="v-container stats-grid-layout">
        <div class="stat-node">
          <div class="stat-number">2</div>
          <div class="stat-label">{{ $t('home.statsPrograms') }}</div>
        </div>
        <div class="stat-node">
          <div class="stat-number neon-blue">10+</div>
          <div class="stat-label">{{ $t('home.statsSpecializations') }}</div>
        </div>
        <div class="stat-node">
          <div class="stat-number text-white">UKF</div>
          <div class="stat-label">{{ $t('home.statsUniversity') }}</div>
        </div>
        <div class="stat-node">
          <div class="stat-number neon-emerald">9</div>
          <div class="stat-label">{{ $t('home.statsRoles') }}</div>
        </div>
      </div>
    </section>

    <section id="about-us" class="section-padding" aria-labelledby="about-heading">
      <div class="v-container">
        <div class="center-meta mb-12">
          <span class="v-label">{{ $t('home.aboutSectionLabel') }}</span>
          <h2 id="about-heading" class="v-title">{{ $t('home.aboutTitle') }}</h2>
        </div>

        <div class="bento-grid-about">
          <div class="bento-cell cell-text reveal-card">
            <p class="p-lead">{{ $t('home.aboutText1') }}</p>
            <p class="p-sub text-muted">{{ $t('home.aboutText2') }}</p>
          </div>

          <div class="bento-cell cell-value reveal-card">
            <div class="v-icon-box box-blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5s3 1.5 5 0c.37-.28.67-.62.92-1" /><path d="M12 12c1.5-1.5 3-4 4.5-6.5C18 3 21 3 21 3s0 3-2.5 5.5C16 10 13.5 11.5 12 12Z" /></svg>
            </div>
            <h3>{{ $t('home.aboutVal1Title') }}</h3>
            <p>{{ $t('home.aboutVal1Desc') }}</p>
          </div>

          <div class="bento-cell cell-value reveal-card">
            <div class="v-icon-box box-emerald">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" /><path d="m15 18 3 3 5-5" /></svg>
            </div>
            <h3>{{ $t('home.aboutVal2Title') }}</h3>
            <p>{{ $t('home.aboutVal2Desc') }}</p>
          </div>

          <div class="bento-cell cell-value reveal-card">
            <div class="v-icon-box box-purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /></svg>
            </div>
            <h3>{{ $t('home.aboutVal3Title') }}</h3>
            <p>{{ $t('home.aboutVal3Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="programs" class="section-padding bg-darker" aria-labelledby="programs-heading">
      <div class="v-container">
        <div class="center-meta mb-16">
          <span class="v-label">{{ $t('home.programsSectionLabel') }}</span>
          <h2 id="programs-heading" class="v-title">{{ $t('home.programsTitle') }}</h2>
          <p class="v-subtitle">{{ $t('home.programsSubtitle') }}</p>
        </div>

        <div class="programs-split-grid">
          <div class="premium-program-card prg-a reveal-card">
            <div class="corner-glow"></div>
            <div class="card-head">
              <span class="p-badge blue">{{ $t('home.tagGrant') }}</span>
              <h3>{{ $t('home.programATitle') }}</h3>
              <p class="desc">{{ $t('home.programADesc') }}</p>
            </div>
            <ul class="feature-checklist text-white">
              <li><span class="check-icon">✓</span> {{ $t('home.programAFeature1') }}</li>
              <li><span class="check-icon">✓</span> {{ $t('home.programAFeature2') }}</li>
              <li><span class="check-icon">✓</span> {{ $t('home.programAFeature3') }}</li>
              <li><span class="check-icon">✓</span> {{ $t('home.programAFeature4') }}</li>
            </ul>
            <div class="card-foot-tags">
              <span>#{{ $t('home.tagStudents') }}</span>
              <span>#{{ $t('home.tagMentor') }}</span>
            </div>
          </div>

          <div class="premium-program-card prg-b reveal-card">
            <div class="corner-glow"></div>
            <div class="card-head">
              <span class="p-badge emerald">{{ $t('home.tagCompanies') }}</span>
              <h3>{{ $t('home.programBTitle') }}</h3>
              <p class="desc">{{ $t('home.programBDesc') }}</p>
            </div>
            <ul class="feature-checklist text-white">
              <li><span class="check-icon">✓</span> {{ $t('home.programBFeature1') }}</li>
              <li><span class="check-icon">✓</span> {{ $t('home.programBFeature2') }}</li>
              <li><span class="check-icon">✓</span> {{ $t('home.programBFeature3') }}</li>
              <li><span class="check-icon">✓</span> {{ $t('home.programBFeature4') }}</li>
            </ul>
            <div class="card-foot-tags">
              <span>#{{ $t('home.tagStudents') }}</span>
              <span>#{{ $t('home.tagLivePractice') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="open-calls" class="section-padding" aria-labelledby="calls-heading">
      <div class="v-container">
        <div class="center-meta mb-12">
          <span class="v-label">{{ $t('home.callsSectionLabel') }}</span>
          <h2 id="calls-heading" class="v-title">{{ $t('home.callsTitle') }}</h2>
          <p class="v-subtitle">{{ $t('home.callsSubtitle') }}</p>
        </div>

        <div v-if="callsStore.loading" class="v-loader-wrapper">
          <div class="shimmer-card" v-for="n in 3" :key="n"></div>
        </div>
        
        <div v-else-if="upcomingCalls.length === 0" class="v-empty-box">
          <p>{{ $t('home.callsEmpty') }}</p>
        </div>

        <div v-else class="calls-modern-grid">
          <div v-for="call in upcomingCalls" :key="call.id" class="modern-call-card reveal-card">
            <div class="call-top-row">
              <span v-if="call.program" class="mini-tag" :class="call.program.is_grant ? 't-blue' : 't-emerald'">
                {{ call.program.is_grant ? 'Program A' : 'Program B' }}
              </span>
              <span class="time-left">
                <span class="pulse-indicator"></span>
                {{ daysUntil(call.deadline) }} {{ $t('home.callsDaysLeft') }}
              </span>
            </div>
            <h3 class="call-title">{{ call.title }}</h3>
            <p class="call-desc" v-if="call.description">{{ call.description }}</p>
            
            <div class="call-meta-footer">
              <div class="deadline-data">
                <span class="label">{{ $t('home.callsDeadline') }}</span>
                <span class="val">{{ formatDeadline(call.deadline) }}</span>
              </div>
              <div class="budget-data" v-if="call.budget">
                {{ Number(call.budget).toLocaleString() }} €
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-padding bg-darker" aria-labelledby="workflow-heading">
      <div class="v-container">
        <div class="center-meta mb-16">
          <span class="v-label">{{ $t('home.howSectionLabel') }}</span>
          <h2 id="workflow-heading" class="v-title">{{ $t('home.howTitle') }}</h2>
        </div>

        <div class="workflow-timeline-wrapper">
          <div class="timeline-pipe"></div>
          <div class="timeline-nodes-grid">
            <div class="timeline-step reveal-card" v-for="step in ['1', '2', '3', '4']" :key="step">
              <div class="node-index">0{{ step }}</div>
              <div class="node-bullet"></div>
              <div class="node-content">
                <h4>{{ $t(`home.step${step}Title`) }}</h4>
                <p>{{ $t(`home.step${step}Desc`) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="partners" class="v-marquee-section" aria-labelledby="partners-heading">
      <h2 id="partners-heading" class="sr-only">{{ $t('home.partnersTitle') }}</h2>
      <div class="marquee-scroller-container">
        <div class="marquee-scroller-track">
          <div class="marquee-group" v-if="partnerNames.length > 0">
            <div v-for="(name, idx) in [...partnerNames, ...partnerNames, ...partnerNames]" :key="'marquee-'+idx" class="marquee-item">
              <span class="item-separator">✦</span>
              <span class="item-text">{{ name }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="news" class="section-padding" aria-labelledby="news-heading">
      <div class="v-container">
        <div class="center-meta mb-12">
          <span class="v-label">{{ $t('home.newsSectionLabel') }}</span>
          <h2 id="news-heading" class="v-title">{{ $t('home.newsTitle') }}</h2>
        </div>

        <div v-if="postsStore.loading" class="v-loader-wrapper">
          <div class="shimmer-card" v-for="n in 3" :key="n"></div>
        </div>
        <div v-else-if="newsList.length === 0" class="v-empty-box">
          <p>{{ $t('home.newsEmpty') }}</p>
        </div>

        <div v-else class="news-asymmetric-grid">
          <article v-for="post in newsList" :key="post.id" class="asymmetric-news-card reveal-card">
            <div class="card-meta">
              <span class="tag-label">{{ $t('home.newsTagArticle') }}</span>
              <span class="date-label">{{ formatPostDate(post.status.published_at) }}</span>
            </div>
            <h3 class="news-title">{{ post.title }}</h3>
            <p class="news-excerpt">{{ post.excerpt ?? '' }}</p>
            <div class="news-action-trigger">
              <span>{{ $t('home.readMore') }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="success-stories" class="section-padding bg-darker" aria-labelledby="stories-heading">
      <div class="v-container">
        <div class="center-meta mb-12">
          <span class="v-label">{{ $t('home.storiesSectionLabel') }}</span>
          <h2 id="stories-heading" class="v-title">{{ $t('home.storiesTitle') }}</h2>
          <p class="v-subtitle">{{ $t('home.storiesSubtitle') }}</p>
        </div>

        <div v-if="storiesLoading" class="v-loader-wrapper">
          <div class="shimmer-card" v-for="n in 3" :key="n"></div>
        </div>
        <div v-else-if="successList.length === 0" class="v-empty-box">
          <p>{{ $t('home.storiesEmpty') }}</p>
        </div>

        <div v-else class="stories-magazine-grid">
          <article v-for="post in successList" :key="post.id" class="story-magazine-card reveal-card">
            <div v-if="post.featured_image" class="media-container">
              <img :src="featuredImageUrl(post.featured_image) ?? ''" :alt="post.title" loading="lazy" />
            </div>
            <div class="story-body">
              <span class="story-badge">{{ $t('home.storiesTag') }}</span>
              <h3 class="story-title">{{ post.title }}</h3>
              <p class="story-excerpt">{{ post.excerpt ?? '' }}</p>
              <div v-if="post.author" class="story-author-node">
                <div class="author-avatar">{{ post.author.name.charAt(0) }}</div>
                <span class="author-name">{{ post.author.name }}</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="faq" class="section-padding" aria-labelledby="faq-heading">
      <div class="v-container max-w-3xl">
        <div class="center-meta mb-12">
          <span class="v-label">{{ $t('home.faqSectionLabel') }}</span>
          <h2 id="faq-heading" class="v-title">{{ $t('home.faqTitle') }}</h2>
        </div>

        <div v-if="faqLoading" class="space-y-4">
          <div class="shimmer-bar" v-for="n in 4" :key="n"></div>
        </div>
        <div v-else-if="faqPosts.length === 0" class="v-empty-box">
          <p>{{ $t('home.faqEmpty') }}</p>
        </div>

        <div v-else class="faq-clean-wrapper">
          <div v-for="post in faqPosts" :key="post.id" class="faq-item-container" :class="{ 'is-expanded': openFaqId === post.id }">
            <button type="button" @click="toggleFaq(post.id)" class="faq-toggle-trigger" :aria-expanded="openFaqId === post.id">
              <span class="question-text">{{ post.title }}</span>
              <span class="icon-indicator"></span>
            </button>
            <div v-show="openFaqId === post.id" class="faq-dropdown-panel" v-html="post.content"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="v-container section-padding" v-if="!isLoggedIn" aria-labelledby="cta-heading">
      <div class="premium-cta-box reveal-card">
        <div class="cta-mesh-overlay"></div>
        <div class="cta-inner-content">
          <h2 id="cta-heading">{{ $t('home.ctaTitle', 'Ready to Launch Your Project?') }}</h2>
          <p>{{ $t('home.ctaSubtitle', 'Register today and transform your knowledge into a successful technology product under expert guidance.') }}</p>
          <div class="cta-actions-row">
            <BaseButton size="large" @click="goRegister" class="v-btn-primary dark-labels">
              {{ $t('home.getStarted', 'Get Started') }}
            </BaseButton>
            <SecondaryButton size="large" @click="goLogin" class="v-btn-secondary border-white">
              {{ $t('header.log_in', 'Log In') }}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* СТИЛІЗАЦІЯ ПРЕМІУМ WORKSPACE */
.v-workspace {
  --bg-main: #07090e;
  --bg-card: rgba(15, 22, 36, 0.65);
  --bg-dark-accent: #0b0f17;
  --border-glow: rgba(255, 255, 255, 0.06);
  
  --c-blue: #3b82f6;
  --c-emerald: #10b981;
  --c-text-primary: #f8fafc;
  --c-text-muted: #94a3b8;
  
  --fx-transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  --fx-blur: blur(16px);

  background-color: var(--bg-main);
  color: var(--c-text-primary);
  font-family: var(--font-main), system-ui, sans-serif;
  overflow-x: hidden;
  position: relative;
  width: 100%;
}

.v-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}
.max-w-3xl { max-width: 768px; }
.section-padding { padding: 120px 0; }
.bg-darker { background-color: var(--bg-dark-accent); }
.mb-12 { margin-bottom: 48px; }
.mb-16 { margin-bottom: 64px; }
.text-muted { color: var(--c-text-muted); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

/* Динамічне підсвічування фону */
.v-blur-spot {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  opacity: 0.12;
  filter: blur(130px);
}
.spot-1 { background: var(--c-blue); top: -5%; left: -10%; }
.spot-2 { background: var(--c-emerald); top: 40%; right: -10%; }

/* Контролери плавної появи (Scroll Reveal) */
.reveal-card {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-card.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Компоненти заголовків */
.center-meta { text-align: center; display: flex; flex-direction: column; align-items: center; }
.v-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--c-blue);
  margin-bottom: 14px;
}
.v-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
  line-height: 1.2;
}
.v-subtitle {
  font-size: 16px;
  color: var(--c-text-muted);
  max-width: 560px;
  margin: 16px auto 0;
  line-height: 1.6;
}

/* Скелетони завантаження даних */
.v-loader-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
.shimmer-card {
  height: 240px;
  background: linear-gradient(90deg, #0f1624 25%, #172237 50%, #0f1624 75%);
  background-size: 200% 100%;
  animation: shimmerAnim 1.5s infinite linear;
  border-radius: 20px;
}
.shimmer-bar {
  height: 56px;
  background: linear-gradient(90deg, #0f1624 25%, #172237 50%, #0f1624 75%);
  background-size: 200% 100%;
  animation: shimmerAnim 1.5s infinite linear;
  border-radius: 12px;
}
@keyframes shimmerAnim { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

.v-empty-box { text-align: center; padding: 60px 24px; color: var(--c-text-muted); font-size: 15px; }

/* КНОПКИ */
.v-btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #fff !important;
  border: none;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.25);
  transition: var(--fx-transition);
}
.v-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
}
.v-btn-secondary {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-glow) !important;
  color: #fff !important;
  font-weight: 600;
  padding: 14px 28px;
  border-radius: 12px;
  backdrop-filter: var(--fx-blur);
  transition: var(--fx-transition);
}
.v-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* HERO BLOCK */
.v-hero-block { position: relative; z-index: 2; overflow: hidden; }
.hero-layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; }
@media(max-width: 968px) { .hero-layout { grid-template-columns: 1fr; gap: 40px; text-align: center; } .hero-buttons { justify-content: center; } .hero-left { display: flex; flex-direction: column; align-items: center; } }

.inline-badge {
  display: inline-flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-glow); padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; margin-bottom: 24px;
}
.badge-dot { width: 6px; height: 6px; background: var(--c-emerald); border-radius: 50%; box-shadow: 0 0 10px var(--c-emerald); }
.hero-main-title {
  font-size: clamp(36px, 5.2vw, 60px); font-weight: 900; line-height: 1.1; letter-spacing: -1.5px; margin: 0;
  background: linear-gradient(135deg, #ffffff 30%, #a5f3fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-description { font-size: 18px; line-height: 1.6; color: var(--c-text-muted); margin: 24px 0 32px; max-width: 520px; }
.hero-buttons { display: flex; gap: 16px; flex-wrap: wrap; }

/* Інтерактивний макет приладової панелі */
.interactive-dashboard-mockup {
  background: rgba(10, 15, 26, 0.4); border: 1px solid var(--border-glow); border-radius: 24px;
  padding: 24px; backdrop-filter: var(--fx-blur); display: flex; flex-direction: column; gap: 20px; position: relative;
}
.mockup-header { display: flex; gap: 6px; }
.mockup-header span { width: 8px; height: 8px; border-radius: 50%; display: block; }
.dot-red { background: #ef4444; } .dot-yellow { background: #f59e0b; } .dot-green { background: #10b981; }

.mockup-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.mockup-box { background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 16px; padding: 20px; transition: var(--fx-transition); }
.mockup-box:hover { border-color: var(--c-blue); transform: scale(1.02); }
.box-a { grid-column: 1; }
.box-b { grid-column: 2; }
.box-c { grid-column: 1 / -1; }

.m-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 12px; }
.m-badge-a { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.m-badge-b { background: rgba(16, 185, 129, 0.1); color: #34d399; }
.huge-metric { font-size: 32px; font-weight: 800; color: var(--c-blue); margin-bottom: 4px; text-shadow: 0 0 15px rgba(59,130,246,0.25); }
.mockup-box p { font-size: 13px; color: var(--c-text-muted); margin: 0; line-height: 1.4; }

/* Легкі мікро-анімації похитування */
.element-float-1 { animation: floatY 6s ease-in-out infinite alternate; }
.element-float-2 { animation: floatY 5s ease-in-out infinite alternate-reverse; }
.element-float-3 { animation: floatY 5.5s ease-in-out infinite alternate; }
@keyframes floatY { 0% { transform: translateY(0px); } 100% { transform: translateY(-8px); } }

/* СМУГА СТАТИСТИКИ */
.v-stats-bar { background: rgba(255, 255, 255, 0.01); border-top: 1px solid var(--border-glow); border-bottom: 1px solid var(--border-glow); padding: 40px 0; }
.stats-grid-layout { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; text-align: center; }
.stat-node { display: flex; flex-direction: column; gap: 8px; position: relative; }
.stat-node:not(:last-child)::after { content: ''; position: absolute; right: 0; top: 20%; width: 1px; height: 60%; background: var(--border-glow); }
@media(max-width: 768px) { .stat-node:not(:last-child)::after { display: none; } }

.stat-number { font-size: clamp(32px, 4.5vw, 48px); font-weight: 900; color: var(--c-blue); line-height: 1; letter-spacing: -1px; }
.stat-number.neon-blue { color: #38bdf8; }
.stat-number.neon-emerald { color: #34d399; }
.stat-label { font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 1.5px; color: var(--c-text-muted); }

/* BENTO BOX ABOUT */
.bento-grid-about { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto; }
.bento-cell { background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 24px; padding: 36px; transition: var(--fx-transition); }
.bento-cell:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-4px); }
.cell-text { grid-column: 1 / -1; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; align-items: center; }
@media(max-width: 868px) { .bento-grid-about { grid-template-columns: 1fr; } .cell-text { grid-template-columns: 1fr; gap: 16px; } }

.p-lead { font-size: 18px; line-height: 1.6; font-weight: 500; margin: 0; }
.p-sub { font-size: 14.5px; line-height: 1.6; margin: 0; }

.v-icon-box { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px; }
.box-blue { background: rgba(59, 130, 246, 0.1); color: var(--c-blue); }
.box-emerald { background: rgba(16, 185, 129, 0.1); color: var(--c-emerald); }
.box-purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

.bento-cell h3 { font-size: 18px; font-weight: 700; margin: 0 0 10px; }
.bento-cell Richmond, .bento-cell p { font-size: 14px; color: var(--c-text-muted); line-height: 1.5; margin: 0; }

/* КАРТКИ ПРОГРАМ */
.programs-split-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 32px; }
@media(max-width: 480px) { .programs-split-grid { grid-template-columns: 1fr; } }

.premium-program-card {
  background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 32px; padding: 48px;
  position: relative; overflow: hidden; display: flex; flex-direction: column; gap: 36px; transition: var(--fx-transition);
}
.premium-program-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
.prg-a { border-top: 4px solid var(--c-blue); }
.prg-b { border-top: 4px solid var(--c-emerald); }

.corner-glow { position: absolute; width: 160px; height: 160px; top: -50px; right: -50px; border-radius: 50%; pointer-events: none; opacity: 0; transition: var(--fx-transition); }
.prg-a:hover .corner-glow { background: radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%); opacity: 1; }
.prg-b:hover .corner-glow { background: radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%); opacity: 1; }

.p-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 100px; display: inline-block; width: max-content; }
.p-badge.blue { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.p-badge.emerald { background: rgba(16, 185, 129, 0.1); color: #34d399; }

.card-head h3 { font-size: 24px; font-weight: 800; margin: 16px 0 10px; }
.card-head .desc { font-size: 15px; color: var(--c-text-muted); line-height: 1.6; margin: 0; }

.feature-checklist { list-style: none; padding: 24px 0 0; margin: 0; border-top: 1px solid var(--border-glow); display: flex; flex-direction: column; gap: 14px; flex: 1; }
.feature-checklist li { font-size: 14.5px; opacity: 0.9; display: flex; gap: 10px; align-items: center; }
.check-icon { font-weight: bold; }
.prg-a .check-icon { color: var(--c-blue); }
.prg-b .check-icon { color: var(--c-emerald); }
.card-foot-tags { display: flex; gap: 12px; font-size: 13px; color: var(--c-text-muted); font-weight: 500; }

/* OPEN CALLS */
.calls-modern-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
.modern-call-card {
  background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 24px; padding: 32px;
  display: flex; flex-direction: column; gap: 20px; transition: var(--fx-transition);
}
.modern-call-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }

.call-top-row { display: flex; justify-content: space-between; align-items: center; }
.mini-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; }
.t-blue { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
.t-emerald { background: rgba(16, 185, 129, 0.1); color: #34d399; }

.time-left { font-size: 12px; font-weight: 600; color: var(--c-blue); display: inline-flex; align-items: center; gap: 6px; }
.pulse-indicator { width: 6px; height: 6px; background: var(--c-blue); border-radius: 50%; animation: indicatorPulse 2s infinite ease-in-out; }
@keyframes indicatorPulse { 0%, 100% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.2); } }

.call-title { font-size: 18px; font-weight: 700; margin: 0; line-height: 1.4; }
.call-desc { font-size: 14px; color: var(--c-text-muted); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }

.call-meta-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 16px; border-top: 1px solid var(--border-glow); margin-top: auto; }
.deadline-data { display: flex; flex-direction: column; gap: 2px; }
.deadline-data .label { font-size: 11px; text-transform: uppercase; color: var(--c-text-muted); font-weight: 500; }
.deadline-data .val { font-size: 13.5px; font-weight: 600; }
.budget-data { background: rgba(255,255,255,0.04); border: 1px solid var(--border-glow); padding: 4px 12px; border-radius: 8px; font-size: 13.5px; font-weight: 700; color: var(--c-blue); }

/* WORKFLOW TIMELINE */
.workflow-timeline-wrapper { position: relative; padding: 20px 0; }
.timeline-pipe { position: absolute; top: 112px; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, transparent, var(--border-glow) 20%, var(--border-glow) 80%, transparent); }
@media(max-width: 768px) { .timeline-pipe { display: none; } }

.timeline-nodes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
.timeline-step { display: flex; flex-direction: column; align-items: center; text-align: center; }
.node-index { font-size: 14px; font-weight: 700; color: var(--c-blue); margin-bottom: 12px; opacity: 0.6; }
.node-bullet { width: 12px; height: 12px; background: var(--bg-main); border: 3px solid var(--c-blue); border-radius: 50%; margin-bottom: 24px; z-index: 2; box-shadow: 0 0 10px rgba(59,130,246,0.3); }
.node-content h4 { font-size: 16px; font-weight: 700; margin: 0 0 8px; }
.node-content p { font-size: 13.5px; color: var(--c-text-muted); line-height: 1.5; margin: 0; padding: 0 8px; }

/* INFINITE MARQUEE PARTNERS */
.v-marquee-section { padding: 60px 0; border-top: 1px solid var(--border-glow); border-bottom: 1px solid var(--border-glow); overflow: hidden; background: rgba(255,255,255,0.002); }
.marquee-scroller-container { display: flex; width: 100%; mask-image: linear-gradient(90deg, transparent, #000 15%, #000 85%, transparent); }
.marquee-scroller-track { display: flex; width: max-content; }
.marquee-group { display: flex; gap: 60px; animation: marqueeShift 30s linear infinite; }
@keyframes marqueeShift { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-33.33%,0,0); } }
.marquee-item { display: flex; align-items: center; gap: 16px; }
.item-separator { color: var(--c-blue); font-size: 14px; }
.item-text { font-size: 18px; font-weight: 600; opacity: 0.6; white-space: nowrap; }

/* NEWS ASSYMETRIC GRID */
.news-asymmetric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
.asymmetric-news-card {
  background: var(--bg-card); border: 1px solid var(--border-glow); padding: 36px; border-radius: 24px;
  display: flex; flex-direction: column; gap: 16px; transition: var(--fx-transition); position: relative;
}
.asymmetric-news-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-4px); }

.card-meta { display: flex; justify-content: space-between; font-size: 12px; color: var(--c-text-muted); }
.tag-label { color: var(--c-blue); font-weight: 700; }
.news-title { font-size: 19px; font-weight: 700; margin: 4px 0 0; line-height: 1.4; }
.news-excerpt { font-size: 14px; color: var(--c-text-muted); line-height: 1.6; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.news-action-trigger { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; color: var(--c-blue); margin-top: auto; padding-top: 12px; }

/* SUCCESS STORIES MAGAZINE */
.stories-magazine-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 32px; }
.story-magazine-card { background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 28px; overflow: hidden; display: flex; flex-direction: column; transition: var(--fx-transition); }
.story-magazine-card:hover { border-color: var(--c-blue); transform: translateY(-4px); }

.media-container { width: 100%; height: 200px; overflow: hidden; background: #101520; }
.media-container img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.story-magazine-card:hover .media-container img { transform: scale(1.03); }

.story-body { padding: 36px; display: flex; flex-direction: column; gap: 16px; flex: 1; }
.story-badge { background: rgba(16, 185, 129, 0.1); color: #34d399; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; width: max-content; }
.story-title { font-size: 18px; font-weight: 700; margin: 0; line-height: 1.4; }
.story-excerpt { font-size: 14px; color: var(--c-text-muted); line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.story-author-node { display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-glow); }
.author-avatar { width: 28px; height: 28px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-glow); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--c-blue); }
.author-name { font-size: 13px; font-weight: 500; color: var(--c-text-muted); }

/* FAQ CLEAN ACCORDION */
.faq-clean-wrapper { display: flex; flex-direction: column; gap: 12px; }
.faq-item-container { background: var(--bg-card); border: 1px solid var(--border-glow); border-radius: 16px; overflow: hidden; transition: var(--fx-transition); }
.faq-item-container:hover { border-color: rgba(255,255,255,0.1); }
.faq-item-container.is-expanded { border-color: var(--c-blue); }

.faq-toggle-trigger {
  width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 20px 28px;
  background: transparent; border: none; color: inherit; font-weight: 600; text-align: left; cursor: pointer;
}
.question-text { font-size: 15.5px; line-height: 1.4; }
.icon-indicator { position: relative; width: 14px; height: 14px; flex-shrink: 0; }
.icon-indicator::before, .icon-indicator::after { content: ''; position: absolute; background: var(--c-blue); transition: transform 0.25s ease; }
/* Горизонтальна лінія */
.icon-indicator::before { top: 6px; left: 0; width: 14px; height: 2px; }
/* Вертикальна лінія */
.icon-indicator::after { top: 0; left: 6px; width: 2px; height: 14px; }
.is-expanded .icon-indicator::after { transform: rotate(90deg); opacity: 0; }
.is-expanded .icon-indicator::before { transform: rotate(180deg); }

.faq-dropdown-panel { padding: 0 28px 24px; font-size: 14.5px; line-height: 1.6; color: var(--c-text-muted); }

/* PREMIUM CTA BOX */
.premium-cta-box {
  background: radial-gradient(circle at top left, #121826, #070a10); border: 1px solid var(--border-glow);
  padding: 72px 24px; border-radius: 40px; text-align: center; position: relative; overflow: hidden;
}
.cta-mesh-overlay { position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 75%); bottom: -100px; right: -50px; pointer-events: none; }
.cta-inner-content { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; align-items: center; position: relative; z-index: 2; }
.cta-inner-content h2 { font-size: clamp(26px, 3.8vw, 36px); font-weight: 800; letter-spacing: -1px; margin: 0; }
.cta-inner-content p { font-size: 16px; color: var(--c-text-muted); line-height: 1.6; margin: 0; }
.cta-actions-row { display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }

/* Додаткові фікси станів */
.dark-labels { background: #fff !important; color: #000 !important; box-shadow: 0 4px 25px rgba(255,255,255,0.12); }
.dark-labels:hover { box-shadow: 0 6px 30px rgba(255,255,255,0.25); }
.border-white { border-color: rgba(255,255,255,0.15) !important; }
</style>