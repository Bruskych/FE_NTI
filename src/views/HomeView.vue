<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Імпорт базових UI-компонентів
import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'

const router = useRouter()
const authStore = useAuthStore()

// Перевірка статуса авторизації користувача
const isLoggedIn = computed(() => authStore.isAuthenticated)

// Методи навігації
const goRegister = () => router.push('/register')
const goLogin    = () => router.push('/login')

// Екземпляр IntersectionObserver для керування анімацією появи блоків при скролі
let observer: IntersectionObserver | null = null

onMounted(() => {
  const targets = document.querySelectorAll('.reveal-node')

  if (targets.length > 0) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
          observer?.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    })

    targets.forEach(el => observer?.observe(el))
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

/**
 * Масив локалізованих новин інкубатора
 */
const mockNews = [
  { id: 1, date: '15. 05. 2026', labelKey: 'home.newsTagCall',    titleKey: 'home.news1Title', excerptKey: 'home.news1Excerpt' },
  { id: 2, date: '28. 04. 2026', labelKey: 'home.newsTagPartner', titleKey: 'home.news2Title', excerptKey: 'home.news2Excerpt' },
  { id: 3, date: '10. 04. 2026', labelKey: 'home.newsTagEvent',   titleKey: 'home.news3Title', excerptKey: 'home.news3Excerpt' },
]

// Список партнерів для безкінечного рухомого рядка (Marquee)
const partnersList = ['UKF Nitra', 'ESET', 'T-Systems', 'Slovensko.Digital', 'Accenture', 'Tempest']
</script>

<template>
  <main class="home">

    <section class="hero reveal-node reveal-fade-in" aria-labelledby="hero-title">
      <div class="hero-inner">
        <div class="hero-content">
          <div class="hero-badge-wrapper">
            <span class="hero-label">{{ $t('home.heroLabel') }}</span>
          </div>
          <h1 id="hero-title" class="hero-title">
            {{ $t('home.heroTitle') }}
          </h1>
          <p class="hero-subtitle">{{ $t('home.heroSubtitle') }}</p>

          <div class="hero-actions" v-if="!isLoggedIn">
            <BaseButton size="large" @click="goRegister" class="pulse-btn">
              {{ $t('home.getStarted') }}
            </BaseButton>
            <SecondaryButton size="large" @click="goLogin">
              {{ $t('header.log_in') }}
            </SecondaryButton>
          </div>
          <div class="hero-actions" v-else>
            <BaseButton size="large" to="/dashboard">{{ $t('home.goToDashboard') }}</BaseButton>
          </div>
        </div>

        <div class="hero-visual" aria-hidden="true">
          <div class="visual-glow"></div>
          <div class="visual-card visual-card--a float-anim-slow">
            <span class="visual-badge badge-a">Program A</span>
            <p>{{ $t('home.visualCardA') }}</p>
          </div>
          <div class="visual-card visual-card--b float-anim-fast">
            <span class="visual-badge badge-b">Program B</span>
            <p>{{ $t('home.visualCardB') }}</p>
          </div>
          <div class="visual-card visual-card--c float-anim-mid">
            <span class="visual-stat">2 → ∞</span>
            <p>{{ $t('home.visualCardC') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="stats reveal-node reveal-fade-in" aria-label="Statistika">
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">2</span>
          <span class="stat-label">{{ $t('home.statsPrograms') }}</span>
        </div>
        <div class="stat-divider" aria-hidden="true" />
        <div class="stat-item">
          <span class="stat-number">10+</span>
          <span class="stat-label">{{ $t('home.statsSpecializations') }}</span>
        </div>
        <div class="stat-divider" aria-hidden="true" />
        <div class="stat-item">
          <span class="stat-number">UKF</span>
          <span class="stat-label">{{ $t('home.statsUniversity') }}</span>
        </div>
        <div class="stat-divider" aria-hidden="true" />
        <div class="stat-item">
          <span class="stat-number">9</span>
          <span class="stat-label">{{ $t('home.statsRoles') }}</span>
        </div>
      </div>
    </section>

    <section id="about-us" class="about-us reveal-node reveal-slide-up" aria-labelledby="about-title">
      <div class="about-inner">
        <div class="about-info">
          <p class="section-label">{{ $t('home.aboutSectionLabel') }}</p>
          <h2 id="about-title">{{ $t('home.aboutTitle') }}</h2>
          <p class="about-text">
            {{ $t('home.aboutText1') }}
          </p>
          <p class="about-text text-secondary">
            {{ $t('home.aboutText2') }}
          </p>
        </div>

        <div class="about-values-grid">
          <div class="value-mini-card">
            <div class="value-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2.5 3.19-2.5 5.5s3 1.5 5 0c.37-.28.67-.62.92-1" />
                <path d="M12 12c1.5-1.5 3-4 4.5-6.5C18 3 21 3 21 3s0 3-2.5 5.5C16 10 13.5 11.5 12 12Z" />
                <path d="m9 15 3-3" />
                <path d="M19 9c.5.5 1.5 1 2.5.5M5 19c.5-1 0-2-.5-2.5" />
                <path d="M15 5c.5.5 1 1.5.5 2.5M9 13.5c-1-.5-2 0-2.5.5" />
              </svg>
            </div>
            <div class="value-content">
              <h4>{{ $t('home.aboutVal1Title') }}</h4>
              <p>{{ $t('home.aboutVal1Desc') }}</p>
            </div>
          </div>

          <div class="value-mini-card">
            <div class="value-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4" />
                <path d="M16 14a2 2 0 0 0-2.83 0l-1.59 1.59a2 2 0 0 1-2.83 0l-1.17-1.17a2 2 0 0 0-2.83 0L3 16" />
                <path d="m15 18 3 3 5-5" />
              </svg>
            </div>
            <div class="value-content">
              <h4>{{ $t('home.aboutVal2Title') }}</h4>
              <p>{{ $t('home.aboutVal2Desc') }}</p>
            </div>
          </div>

          <div class="value-mini-card">
            <div class="value-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
                <path d="M6 12.5v5c0 1.25 1.62 2.5 4 2.5M18 12.5v5c0 1.25-1.62 2.5-4 2.5" />
                <path d="M21.5 11v6" />
              </svg>
            </div>
            <div class="value-content">
              <h4>{{ $t('home.aboutVal3Title') }}</h4>
              <p>{{ $t('home.aboutVal3Desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="programs" class="programs reveal-node reveal-slide-up" aria-labelledby="programs-title">
      <header class="section-header">
        <p class="section-label">{{ $t('home.programsSectionLabel') }}</p>
        <h2 id="programs-title">{{ $t('home.programsTitle') }}</h2>
        <p class="section-subtitle">{{ $t('home.programsSubtitle') }}</p>
      </header>

      <div class="programs-grid">
        <div class="program-card program-a">
          <div class="program-card-glow"></div>
          <div class="program-card-header">
            <div class="program-badge program-badge--a">Program A</div>
            <h3>{{ $t('home.programATitle') }}</h3>
            <p class="program-desc">{{ $t('home.programADesc') }}</p>
          </div>
          <ul class="program-features">
            <li>{{ $t('home.programAFeature1') }}</li>
            <li>{{ $t('home.programAFeature2') }}</li>
            <li>{{ $t('home.programAFeature3') }}</li>
            <li>{{ $t('home.programAFeature4') }}</li>
          </ul>
          <div class="program-footer">
            <span class="program-tag">{{ $t('home.tagStudents') }}</span>
            <span class="program-tag">{{ $t('home.tagGrant') }}</span>
            <span class="program-tag">{{ $t('home.tagMentor') }}</span>
          </div>
        </div>

        <div class="program-card program-b">
          <div class="program-card-glow"></div>
          <div class="program-card-header">
            <div class="program-badge program-badge--b">Program B</div>
            <h3>{{ $t('home.programBTitle') }}</h3>
            <p class="program-desc">{{ $t('home.programBDesc') }}</p>
          </div>
          <ul class="program-features">
            <li>{{ $t('home.programBFeature1') }}</li>
            <li>{{ $t('home.programBFeature2') }}</li>
            <li>{{ $t('home.programBFeature3') }}</li>
            <li>{{ $t('home.programBFeature4') }}</li>
          </ul>
          <div class="program-footer">
            <span class="program-tag">{{ $t('home.tagStudents') }}</span>
            <span class="program-tag">{{ $t('home.tagCompanies') }}</span>
            <span class="program-tag">{{ $t('home.tagLivePractice') }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="how-it-works reveal-node reveal-slide-up" aria-labelledby="how-title">
      <header class="section-header">
        <p class="section-label">{{ $t('home.howSectionLabel') }}</p>
        <h2 id="how-title">{{ $t('home.howTitle') }}</h2>
      </header>

      <div class="steps-container">
        <div class="steps-connecting-line" aria-hidden="true"></div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number-flow">01</div>
            <div class="step-dot"></div>
            <h4>{{ $t('home.step1Title') }}</h4>
            <p>{{ $t('home.step1Desc') }}</p>
          </div>
          <div class="step-card">
            <div class="step-number-flow">02</div>
            <div class="step-dot"></div>
            <h4>{{ $t('home.step2Title') }}</h4>
            <p>{{ $t('home.step2Desc') }}</p>
          </div>
          <div class="step-card">
            <div class="step-number-flow">03</div>
            <div class="step-dot"></div>
            <h4>{{ $t('home.step3Title') }}</h4>
            <p>{{ $t('home.step3Desc') }}</p>
          </div>
          <div class="step-card">
            <div class="step-number-flow">04</div>
            <div class="step-dot"></div>
            <h4>{{ $t('home.step4Title') }}</h4>
            <p>{{ $t('home.step4Desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <section id="partners" class="partners reveal-node reveal-fade-in" aria-labelledby="partners-title">
      <header class="section-header">
        <p class="section-label">{{ $t('home.partnersSectionLabel') }}</p>
        <h2 id="partners-title">{{ $t('home.partnersTitle') }}</h2>
      </header>

      <div class="marquee-wrapper">
        <div class="marquee-track">
          <div v-for="(name, idx) in partnersList" :key="'p1-'+idx" class="partner-item">
            <span class="partner-dot">✦</span> {{ name }}
          </div>
          <div v-for="(name, idx) in partnersList" :key="'p2-'+idx" class="partner-item">
            <span class="partner-dot">✦</span> {{ name }}
          </div>
        </div>
      </div>
    </section>

    <section id="news" class="news reveal-node reveal-slide-up" aria-labelledby="news-title">
      <header class="section-header">
        <p class="section-label">{{ $t('home.newsSectionLabel') }}</p>
        <h2 id="news-title">{{ $t('home.newsTitle') }}</h2>
      </header>

      <div class="news-grid">
        <article v-for="item in mockNews" :key="item.id" class="news-card">
          <div class="news-meta">
            <span class="news-tag">{{ $t(item.labelKey) }}</span>
            <span class="news-date">{{ item.date }}</span>
          </div>
          <h4>{{ $t(item.titleKey) }}</h4>
          <p>{{ $t(item.excerptKey) }}</p>
          <div class="news-arrow">
            <span>{{ $t('home.readMore') }}</span> →
          </div>
        </article>
      </div>
    </section>

    <section class="cta reveal-node reveal-fade-in" v-if="!isLoggedIn" aria-labelledby="cta-title">
      <div class="cta-glow" aria-hidden="true"></div>
      <div class="cta-container">
        <h2 id="cta-title">{{ $t('home.ctaTitle', 'Ready to Launch Your Project?') }}</h2>
        <p class="cta-desc">{{ $t('home.ctaSubtitle', 'Register today and transform your knowledge into a successful technology product under expert guidance.') }}</p>

        <div class="cta-actions">
          <BaseButton size="large" @click="goRegister" class="pulse-btn cta-btn-primary">
            {{ $t('home.getStarted', 'Get Started') }}
          </BaseButton>
          <SecondaryButton size="large" @click="goLogin" class="cta-btn-secondary">
            {{ $t('header.log_in', 'Log In') }}
          </SecondaryButton>
        </div>
      </div>
    </section>

  </main>
</template>

<style scoped>
.home {
  font-family: var(--font-main), sans-serif;
  color: var(--text-color, #f8fafc);
  background: var(--bg-color, #0b0f12);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ===== СТИЛИ ДЛЯ СКРОЛЛ-АНІМАЦІЙ ===== */
.reveal-node {
  opacity: 0;
  transition: opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
}
.reveal-fade-in { transform: scale(0.97); }
.reveal-slide-up { transform: translateY(40px); }
.reveal-active {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* ===== ШАПКИ СЕКЦІЙ ===== */
.section-header { text-align: center; margin-bottom: 60px; }
.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--main-color, #3b82f6);
  margin-bottom: 12px;
}
.section-header h2 {
  font-size: clamp(28px, 3.5vw, 42px);
  font-weight: 800;
  letter-spacing: -0.8px;
  margin: 0 0 16px 0;
  color: var(--text-color, #f8fafc);
}
.section-subtitle {
  font-size: 16.5px;
  color: var(--text-color, #f8fafc);
  opacity: 0.85;
  margin: 0 auto;
  max-width: 580px;
  line-height: 1.65;
}

/* ===== СЕКЦИЯ ABOUT US ===== */
.about-us { padding: 120px 24px; }
.about-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: stretch;
}
.about-info { display: flex; flex-direction: column; align-items: flex-start; text-align: left; justify-content: center; }
.about-info h2 { font-size: clamp(26px, 3vw, 36px); font-weight: 800; letter-spacing: -0.5px; margin: 8px 0 20px 0; line-height: 1.2; }
.about-text { font-size: 16px; line-height: 1.65; color: var(--text-color, #f8fafc); opacity: 0.9; margin: 0 0 16px 0; }
.about-text.text-secondary { opacity: 0.7; }
.about-values-grid { display: flex; flex-direction: column; gap: 20px; justify-content: center; }
.value-mini-card {
  background: var(--card-bg-color, #11161a);
  border: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05));
  padding: 24px;
  border-radius: 16px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  text-align: left;
  transition: transform 0.2s, border-color 0.2s;
}
.value-mini-card:hover { transform: translateX(6px); border-color: var(--main-color, #3b82f6); }
.value-icon {
  color: var(--main-color, #3b82f6);
  background: var(--main-color-light, rgba(59, 130, 246, 0.1));
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
  transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
}
.value-mini-card:hover .value-icon { transform: scale(1.05); background: var(--main-color, #3b82f6); color: #ffffff; }
.value-content { display: flex; flex-direction: column; gap: 4px; }
.value-mini-card h4 { margin: 0; font-size: 17px; font-weight: 700; color: var(--text-color, #f8fafc); }
.value-mini-card p { margin: 0; font-size: 14px; color: var(--text-color, #f8fafc); opacity: 0.75; line-height: 1.5; }

/* ===== HERO СЕКЦІЯ ===== */
.hero { padding: 120px 24px 90px; position: relative; }
.hero-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; }
.hero-content { display: flex; flex-direction: column; align-items: flex-start; gap: 28px; }
.hero-badge-wrapper {
  background: var(--main-color-light, rgba(59, 130, 246, 0.1));
  padding: 6px 16px; border-radius: 100px; border: 1px solid color-mix(in srgb, var(--main-color, #3b82f6) 15%, transparent);
}
.dark .hero-badge-wrapper { background: var(--menu-border, rgba(255, 255, 255, 0.05)); border-color: var(--main-color-dark, #1d4ed8); }
.hero-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--main-color-dark, #1d4ed8); }
.dark .hero-label { color: var(--main-color, #3b82f6); }
.hero-title {
  font-size: clamp(36px, 4.8vw, 58px); font-weight: 800; line-height: 1.1; letter-spacing: -1.8px; margin: 0;
  background: linear-gradient(135deg, var(--text-color, #f8fafc) 30%, var(--main-color, #3b82f6) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-subtitle { font-size: 18px; line-height: 1.7; color: var(--text-color, #f8fafc); opacity: 0.85; margin: 0; max-width: 540px; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }

/* Карточки в Hero */
.hero-visual { position: relative; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px; }
.visual-glow { position: absolute; width: 320px; height: 320px; background: var(--main-color, #3b82f6); filter: blur(130px); opacity: 0.18; top: 10%; left: 20%; pointer-events: none; }
.visual-card {
  position: relative; background: color-mix(in srgb, var(--card-bg-color, #11161a) 75%, transparent);
  backdrop-filter: blur(16px); border: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05));
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.03); border-radius: 20px; padding: 24px; z-index: 1; color: var(--text-color, #f8fafc);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.3s;
}
.visual-card:hover { transform: scale(1.03) translateY(-8px) !important; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08); border-color: var(--main-color, #3b82f6); }
.visual-card--a { grid-column: 1; transform: translateY(-15px); }
.visual-card--b { grid-column: 2; transform: translateY(15px); }
.visual-card--c { grid-column: 1 / -1; margin-top: 10px; }
.visual-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; letter-spacing: 1px; display: inline-block; margin-bottom: 12px; }
.dark .badge-a { background: var(--menu-border, rgba(255, 255, 255, 0.05)); color: var(--main-color, #3b82f6); }
.badge-b { background: color-mix(in srgb, #10b981 15%, transparent); color: #10b981; }
.visual-stat { font-size: 28px; font-weight: 800; color: var(--main-color, #3b82f6); display: block; margin-bottom: 6px; }
.visual-card p { font-size: 13.5px; color: var(--text-color, #f8fafc); opacity: 0.9; margin: 0; line-height: 1.5; }

.float-anim-slow { animation: floatKey 6s ease-in-out infinite alternate; }
.float-anim-mid { animation: floatKey 5s ease-in-out infinite alternate-reverse; }
.float-anim-fast { animation: floatKey 4s ease-in-out infinite alternate; }
@keyframes floatKey { 0% { transform: translateY(0px); } 100% { transform: translateY(-14px); } }

/* ===== СЕКЦІЯ СТАТИСТИКИ ===== */
.stats { padding: 50px 24px; background: transparent; border-top: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05)); border-bottom: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05)); }
.stats-grid { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.stat-divider { width: 1px; height: 52px; background: var(--menu-border, rgba(255, 255, 255, 0.05)); }
.stat-number { font-size: clamp(30px, 3.8vw, 44px); font-weight: 800; color: var(--main-color, #3b82f6); letter-spacing: -1px; line-height: 1; }
.stat-label { font-size: 11.5px; color: var(--text-color, #f8fafc); opacity: 0.8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; }

/* ===== СЕКЦІЯ ПРОГРАМ ===== */
.programs { padding: 120px 24px; }
.programs-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 40px; }
.program-card {
  position: relative; background: var(--card-bg-color, #11161a); border: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05)); border-radius: 28px;
  padding: 44px; display: flex; flex-direction: column; gap: 32px; overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s;
}
.program-card:hover { transform: translateY(-6px); background: var(--card-bg-color-hover, #1e293b); border-color: color-mix(in srgb, var(--main-color, #3b82f6) 35%, transparent); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.06); }
.program-card-glow { position: absolute; width: 200px; height: 200px; background: var(--main-color, #3b82f6); filter: blur(90px); opacity: 0; top: -65px; right: -65px; transition: opacity 0.4s ease; pointer-events: none; }
.program-card:hover .program-card-glow { opacity: 0.15; }
.program-badge { display: inline-flex; padding: 5px 16px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
.dark .program-badge--a { background: var(--menu-border, rgba(255, 255, 255, 0.05)); color: var(--main-color, #3b82f6); }
.program-badge--b { background: color-mix(in srgb, #10b981 15%, transparent); color: #10b981; }
.program-card h3 { font-size: 24px; font-weight: 800; color: var(--text-color, #f8fafc); margin: 0 0 12px 0; }
.program-desc { font-size: 15.5px; line-height: 1.65; color: var(--text-color, #f8fafc); opacity: 0.85; margin: 0; }
.program-features { list-style: none; padding: 24px 0 0 0; margin: 0; display: flex; flex-direction: column; gap: 14px; flex: 1; border-top: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05)); }
.program-features li { font-size: 15px; padding-left: 28px; position: relative; color: var(--text-color, #f8fafc); opacity: 0.95; line-height: 1.45; }
.program-features li::before { content: '✓'; position: absolute; left: 0; color: var(--main-color, #3b82f6); font-weight: 900; }
.program-footer { display: flex; gap: 10px; flex-wrap: wrap; }
.program-tag { padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--text-color, #f8fafc); background: var(--bg-color, #0b0f12); border: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05)); opacity: 0.95; }

/* ===== СЕКЦІЯ ЯК ЦЕ ПРАЦЮЄ ===== */
.how-it-works { padding: 120px 24px; background: transparent; border-top: 1px solid var(--menu-border, rgba(0, 0, 0, 0.05)); border-bottom: 1px solid var(--menu-border, rgba(0, 0, 0, 0.05)); }
.steps-container { max-width: 1140px; margin: 0 auto; position: relative; }
.steps-connecting-line { position: absolute; top: 56px; left: 8%; right: 8%; height: 2px; background: linear-gradient(90deg, transparent, var(--text-color, #334155) 15%, var(--text-color, #334155) 85%, transparent); opacity: 0.15; z-index: 0; }
.steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; position: relative; z-index: 1; }
.step-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; padding: 0 12px; }
.step-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--bg-color, #ffffff); border: 3.5px solid var(--main-color, #3b82f6); box-shadow: 0 0 0 6px var(--bg-color, #ffffff); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.step-card:hover .step-dot { transform: scale(1.4); }
.step-number-flow { font-size: 38px; font-weight: 800; color: var(--main-color, #3b82f6); opacity: 0.4; font-variant-numeric: tabular-nums; line-height: 1; }
.step-card h4 { font-size: 17px; font-weight: 700; color: var(--text-color, #0f172a); margin: 4px 0 0 0; }
.step-card p { font-size: 14px; line-height: 1.6; color: var(--text-color, #334155); opacity: 0.8; margin: 0; }

/* ===== ЛЕНТА ПАРТНЕРОВ ===== */
.partners { padding: 100px 0; }
.marquee-wrapper { overflow: hidden; width: 100%; position: relative; padding: 15px 0; }
.marquee-wrapper::before, .marquee-wrapper::after { content: ''; position: absolute; top: 0; bottom: 0; width: 200px; z-index: 2; pointer-events: none; }
.marquee-wrapper::before { left: 0; background: linear-gradient(90deg, var(--bg-color, #0b0f12), transparent); }
.marquee-wrapper::after { right: 0; background: linear-gradient(-90deg, var(--bg-color, #0b0f12), transparent); }
.marquee-track { display: flex; width: max-content; gap: 50px; animation: marqueeRun 28s linear infinite; }
.partner-item { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--text-color, #f8fafc); opacity: 0.6; display: flex; align-items: center; gap: 14px; transition: opacity 0.3s ease, transform 0.3s ease; }
.partner-item:hover { opacity: 0.95; transform: scale(1.04); }
.partner-dot { color: var(--main-color, #3b82f6); font-size: 16px; }
@keyframes marqueeRun { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

/* ===== СЕКЦІЯ НОВОСТЕЙ ===== */
.news { padding: 120px 24px; background: transparent; border-top: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05)); }
.news-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
.news-card {
  background: var(--card-bg-color, #11161a); border: 1px solid var(--menu-border, rgba(255, 255, 255, 0.05)); border-radius: 24px; padding: 36px;
  display: flex; flex-direction: column; gap: 18px; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, background-color 0.3s;
}
.news-card:hover { transform: translateY(-8px); background: var(--card-bg-color-hover, #1e293b); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05); }
.news-meta { display: flex; align-items: center; justify-content: space-between; }
.news-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--main-color, #3b82f6); }
.news-date { font-size: 12.5px; color: var(--text-color, #f8fafc); opacity: 0.6; }
.news-card h4 { font-size: 18px; font-weight: 700; line-height: 1.45; color: var(--text-color, #f8fafc); margin: 0; }
.news-card p { font-size: 14.5px; line-height: 1.65; color: var(--text-color, #f8fafc); opacity: 0.8; margin: 0; }
.news-arrow { margin-top: auto; font-size: 13.5px; font-weight: 700; color: var(--main-color, #3b82f6); display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateX(-6px); transition: opacity 0.3s ease, transform 0.3s ease; }
.news-card:hover .news-arrow { opacity: 1; transform: translateX(0); }

/* ===== ІНТЕГРОВАНА СЕКЦІЯ CTA (Класичний колір як у всього сайту) ===== */
.cta {
  position: relative;
  width: 100%;
  /* Колір тепер строго відповідає фону інших секцій лендінгу */
  background: var(--bg-color, #0b0f12);
  padding: 100px 24px;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Легке преміальне розділення між секціями */
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.cta-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 24px;
  position: relative;
  z-index: 2;
}

.cta-container h2 {
  color: #ffffff;
  font-size: clamp(32px, 4vw, 46px);
  font-weight: 800;
  letter-spacing: -1px;
  margin: 0;
  line-height: 1.15;
}

.cta-desc {
  color: #8c9ba5;
  font-size: clamp(15px, 1.5vw, 17.5px);
  line-height: 1.6;
  margin: 0;
  max-width: 620px;
}

/* Контейнер кнопок: вирівнювання строго в один рядок */
.cta-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  width: 100%;
  flex-wrap: wrap;
}

/* Кастомні класи кнопок всередині CTA */
.cta-btn-primary {
  min-width: 160px;
  font-weight: 600;
}

.cta-btn-secondary {
  background-color: rgba(255, 255, 255, 0.03) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  min-width: 160px;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.cta-btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

/* Сяяння по центру */
.cta-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

/* Анімація для головної кнопки */
.pulse-btn:hover {
  animation: pulseEff 1.4s infinite;
}
@keyframes pulseEff {
  0% { box-shadow: 0 0 0 0 rgba(224, 110, 117, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(224, 110, 117, 0); }
  100% { box-shadow: 0 0 0 0 rgba(224, 110, 117, 0); }
}

/* ===== АДАПТИВНІСТЬ ===== */
@media (max-width: 1100px) {
  .hero-inner { grid-template-columns: 1fr; gap: 50px; text-align: center; }
  .hero-content { align-items: center; }
  .hero-visual { max-width: 540px; margin: 0 auto; }
  .about-inner { grid-template-columns: 1fr; gap: 40px; }
  .about-info { align-items: center; text-align: center; }

  .steps-connecting-line { display: none; }
  .steps-grid { grid-template-columns: 1fr; gap: 36px; }
  .step-card { flex-direction: row; text-align: left; gap: 24px; padding: 0; align-items: flex-start; }
  .step-dot { box-shadow: none; flex-shrink: 0; margin-top: 10px; }
  .step-number-flow { font-size: 32px; width: 45px; flex-shrink: 0; }
}

@media (max-width: 768px) {
  .hero { padding: 80px 20px 50px; }
  .programs { padding: 80px 20px; }
  .programs-grid { grid-template-columns: 1fr; }
  .stats-grid { flex-direction: column; gap: 32px; }
  .stat-divider { display: none; }
  .cta { padding: 80px 20px; }
  .cta-actions { flex-direction: column; width: 100%; gap: 12px; }
  .cta-actions > * { width: 100% !important; }
}
</style>