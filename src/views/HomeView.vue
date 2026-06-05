<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Импорт базовых UI-компонентов
import BaseButton from '@/components/ui/BaseButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'

const router = useRouter()
const authStore = useAuthStore()

// Проверка статуса авторизации пользователя
const isLoggedIn = computed(() => authStore.isAuthenticated)

// Методы навигации по страницам
const goRegister = () => router.push('/register')
const goLogin    = () => router.push('/login')

// Ссылка на экземпляр IntersectionObserver для управления анимацией появления блоков
let observer: IntersectionObserver | null = null

onMounted(() => {
  const targets = document.querySelectorAll('.reveal-node')

  // Инициализируем observer только если на странице присутствуют элементы для анимации
  if (targets.length > 0) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Когда элемент входит во вьюпорт (зону видимости) на 8%
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
          // Прекращаем наблюдение за элементом после того, как он один раз анимировался
          observer?.unobserve(entry.target)
        }
      })
    }, {
      threshold: 0.08,        // Процент видимости элемента для срабатывания
      rootMargin: '0px 0px -40px 0px' // Отступ снизу для более мягкого эффекта появления
    })

    targets.forEach(el => observer?.observe(el))
  }
})

onUnmounted(() => {
  // Полное и безопасное отключение наблюдателя для предотвращения утечек памяти
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

/**
 * Массив локализованных новостей.
 * Вместо жесткого кодирования строк используются ключи интернационализации ($t).
 */
const mockNews = [
  { id: 1, date: '15. 05. 2026', labelKey: 'home.newsTagCall',    titleKey: 'home.news1Title', excerptKey: 'home.news1Excerpt' },
  { id: 2, date: '28. 04. 2026', labelKey: 'home.newsTagPartner', titleKey: 'home.news2Title', excerptKey: 'home.news2Excerpt' },
  { id: 3, date: '10. 04. 2026', labelKey: 'home.newsTagEvent',   titleKey: 'home.news3Title', excerptKey: 'home.news3Excerpt' },
]

// Список партнеров для бесконечной бегущей строки (Marquee)
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
      <div class="cta-card">
        <div class="cta-glow"></div>
        <div class="cta-inner">
          <h2 id="cta-title">{{ $t('home.ctaTitle') }}</h2>
          <p>{{ $t('home.ctaSubtitle') }}</p>
          <div class="cta-actions">
            <BaseButton size="large" @click="goRegister" class="pulse-btn">
              {{ $t('home.getStarted') }}
            </BaseButton>
            <SecondaryButton size="large" variant="dark" @click="goLogin">
              {{ $t('header.log_in') }}
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<style scoped>
.home {
  font-family: var(--font-main), sans-serif;
  color: var(--text-color);
  background: var(--bg-color);
  overflow-x: hidden;
}

/* ===== СТИЛИ ДЛЯ СКРОЛЛ-АНИМАЦИЙ (REVEAL EFFECTS) ===== */
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

/* ===== ШАПКИ СЕКЦИЙ ===== */
.section-header { text-align: center; margin-bottom: 60px; }
.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: var(--main-color);
  margin-bottom: 12px;
}
.section-header h2 {
  font-size: clamp(28px, 3.5vw, 42px);
  font-weight: 800;
  letter-spacing: -0.8px;
  margin: 0 0 16px 0;
  color: var(--text-color);
}
.section-subtitle {
  font-size: 16.5px;
  color: var(--text-color);
  opacity: 0.85;
  margin: 0 auto;
  max-width: 580px;
  line-height: 1.65;
}

/* ===== ГЛАВНЫЙ ЭКРАН (HERO СЕКЦИЯ) ===== */
.hero { padding: 120px 24px 90px; position: relative; }
.hero-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 60px;
  align-items: center;
}
.hero-content { display: flex; flex-direction: column; align-items: flex-start; gap: 28px; }
.hero-badge-wrapper {
  background: var(--main-color-light);
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid color-mix(in srgb, var(--main-color) 15%, transparent);
}
.dark .hero-badge-wrapper { background: var(--menu-border); border-color: var(--main-color-dark); }
.hero-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--main-color-dark); }
.dark .hero-label { color: var(--main-color); }
.hero-title {
  font-size: clamp(36px, 4.8vw, 58px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -1.8px;
  margin: 0;
  background: linear-gradient(135deg, var(--text-color) 30%, var(--main-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-subtitle { font-size: 18px; line-height: 1.7; color: var(--text-color); opacity: 0.85; margin: 0; max-width: 540px; }
.hero-actions { display: flex; gap: 16px; flex-wrap: wrap; }

/* Интерактивный визуал с карточками в Hero */
.hero-visual { position: relative; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px; }
.visual-glow {
  position: absolute; width: 320px; height: 320px; background: var(--main-color);
  filter: blur(130px); opacity: 0.18; top: 10%; left: 20%; pointer-events: none;
}
.visual-card {
  position: relative; background: color-mix(in srgb, var(--card-bg-color) 75%, transparent);
  backdrop-filter: blur(16px); border: 1px solid var(--menu-border);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.03); border-radius: 20px; padding: 24px;
  z-index: 1; color: var(--card-text-color);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.3s;
}
.visual-card:hover {
  transform: scale(1.03) translateY(-8px) !important;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08); border-color: var(--main-color);
}
.visual-card--a { grid-column: 1; transform: translateY(-15px); }
.visual-card--b { grid-column: 2; transform: translateY(15px); }
.visual-card--c { grid-column: 1 / -1; margin-top: 10px; }

.visual-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  padding: 4px 10px; border-radius: 8px; letter-spacing: 1px;
  display: inline-block; margin-bottom: 12px;
}
.badge-a { background: var(--main-color-light); color: var(--main-color-dark); }
.dark .badge-a { background: var(--main-dark-4); color: var(--main-color); }
.badge-b { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.visual-stat { font-size: 28px; font-weight: 800; color: var(--main-color); display: block; margin-bottom: 6px; }
.visual-card p { font-size: 13.5px; color: var(--text-color); opacity: 0.9; margin: 0; line-height: 1.5; }

/* CSS Анимации покачивания (Floating Effects) */
.float-anim-slow { animation: floatKey 6s ease-in-out infinite alternate; }
.float-anim-mid { animation: floatKey 5s ease-in-out infinite alternate-reverse; }
.float-anim-fast { animation: floatKey 4s ease-in-out infinite alternate; }
@keyframes floatKey {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-14px); }
}

/* ===== СЕКЦИЯ СТАТИСТИКИ ===== */
.stats { padding: 50px 24px; background: var(--menu-color); border-top: 1px solid var(--menu-border); border-bottom: 1px solid var(--menu-border); }
.stats-grid { max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.stat-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.stat-divider { width: 1px; height: 52px; background: var(--menu-border); }
.stat-number { font-size: clamp(30px, 3.8vw, 44px); font-weight: 800; color: var(--main-color); letter-spacing: -1px; line-height: 1; }
.stat-label { font-size: 11.5px; color: var(--text-color); opacity: 0.8; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; }

/* ===== СЕКЦИЯ ПРОГРАММ ===== */
.programs { padding: 120px 24px; }
.programs-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 40px; }
.program-card {
  position: relative; background: var(--card-bg-color); border: 1px solid var(--menu-border); border-radius: 28px;
  padding: 44px; display: flex; flex-direction: column; gap: 32px; overflow: hidden;
  transition: border-color 0.4s ease, box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s;
}
.program-card:hover {
  transform: translateY(-6px); background: var(--card-bg-color-hover);
  border-color: color-mix(in srgb, var(--main-color) 35%, transparent); box-shadow: 0 25px 50px rgba(0, 0, 0, 0.06);
}
.program-card-glow {
  position: absolute; width: 200px; height: 200px; background: var(--main-color);
  filter: blur(90px); opacity: 0; top: -65px; right: -65px; transition: opacity 0.4s ease; pointer-events: none;
}
.program-card:hover .program-card-glow { opacity: 0.15; }
.program-badge { display: inline-flex; padding: 5px 16px; border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
.program-badge--a { background: var(--main-color-light); color: var(--main-color-dark); }
.dark .program-badge--a { background: var(--main-dark-4); color: var(--main-color); }
.program-badge--b { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.program-card h3 { font-size: 24px; font-weight: 800; color: var(--card-text-color); margin: 0 0 12px 0; }
.program-card:hover h3 { color: var(--card-text-color-hover); }
.program-desc { font-size: 15.5px; line-height: 1.65; color: var(--text-color); opacity: 0.85; margin: 0; }
.program-features { list-style: none; padding: 24px 0 0 0; margin: 0; display: flex; flex-direction: column; gap: 14px; flex: 1; border-top: 1px solid var(--menu-border); }
.program-features li { font-size: 15px; padding-left: 28px; position: relative; color: var(--text-color); opacity: 0.95; line-height: 1.45; }
.program-features li::before { content: '✓'; position: absolute; left: 0; color: var(--main-color); font-weight: 900; }
.program-footer { display: flex; gap: 10px; flex-wrap: wrap; }
.program-tag { padding: 5px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--text-color); background: var(--bg-color); border: 1px solid var(--menu-border); opacity: 0.95; }

/* ===== ИНФОГРАФИКА ШАГОВ ===== */
.how-it-works { padding: 120px 24px; background: var(--menu-color); border-top: 1px solid var(--menu-border); border-bottom: 1px solid var(--menu-border); }
.steps-container { max-width: 1140px; margin: 0 auto; position: relative; }
.steps-connecting-line {
  position: absolute; top: 56px; left: 8%; right: 8%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--menu-border) 15%, var(--menu-border) 85%, transparent); z-index: 0;
}
.steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; position: relative; z-index: 1; }
.step-card { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; padding: 0 12px; }
.step-dot {
  width: 14px; height: 14px; border-radius: 50%; background: var(--bg-color);
  border: 3.5px solid var(--main-color); box-shadow: 0 0 0 6px var(--menu-color);
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.step-card:hover .step-dot { transform: scale(1.4); }
.step-number-flow { font-size: 38px; font-weight: 800; color: var(--main-color); opacity: 0.35; font-variant-numeric: tabular-nums; line-height: 1; }
.step-card h4 { font-size: 17px; font-weight: 700; color: var(--text-color); margin: 4px 0 0 0; }
.step-card p { font-size: 14px; line-height: 1.6; color: var(--text-color); opacity: 0.8; margin: 0; }

/* ===== ЛЕНТА ПАРТНЕРОВ (MARQUEE) ===== */
.partners { padding: 100px 0; }
.marquee-wrapper { overflow: hidden; width: 100%; position: relative; padding: 15px 0; }
.marquee-wrapper::before, .marquee-wrapper::after { content: ''; position: absolute; top: 0; bottom: 0; width: 200px; z-index: 2; pointer-events: none; }
.marquee-wrapper::before { left: 0; background: linear-gradient(90deg, var(--bg-color), transparent); }
.marquee-wrapper::after { right: 0; background: linear-gradient(-90deg, var(--bg-color), transparent); }
.marquee-track { display: flex; width: max-content; gap: 50px; animation: marqueeRun 28s linear infinite; }
.partner-item { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; color: var(--text-color); opacity: 0.6; display: flex; align-items: center; gap: 14px; transition: opacity 0.3s ease, transform 0.3s ease; }
.partner-item:hover { opacity: 0.95; transform: scale(1.04); }
.partner-dot { color: var(--main-color); font-size: 16px; }
@keyframes marqueeRun {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ===== СЕКЦИЯ НОВОСТЕЙ ===== */
.news { padding: 120px 24px; background: var(--menu-color); border-top: 1px solid var(--menu-border); }
.news-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
.news-card {
  background: var(--card-bg-color); border: 1px solid var(--menu-border); border-radius: 24px; padding: 36px;
  display: flex; flex-direction: column; gap: 18px; transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, background-color 0.3s;
}
.news-card:hover { transform: translateY(-8px); background: var(--card-bg-color-hover); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05); }
.news-meta { display: flex; align-items: center; justify-content: space-between; }
.news-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--main-color); }
.news-date { font-size: 12.5px; color: var(--text-color); opacity: 0.6; }
.news-card h4 { font-size: 18px; font-weight: 700; line-height: 1.45; color: var(--card-text-color); margin: 0; }
.news-card:hover h4 { color: var(--card-text-color-hover); }
.news-card p { font-size: 14.5px; line-height: 1.65; color: var(--text-color); opacity: 0.8; margin: 0; }
.news-arrow {
  margin-top: auto; font-size: 13.5px; font-weight: 700; color: var(--main-color);
  display: flex; align-items: center; gap: 8px; opacity: 0; transform: translateX(-6px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.news-card:hover .news-arrow { opacity: 1; transform: translateX(0); }

/* ===== СЕКЦИЯ CTA ВЫЗОВА ===== */
.cta { padding: 100px 24px; }
.cta-card {
  max-width: 1000px; margin: 0 auto; background: linear-gradient(135deg, var(--main-dark-2) 0%, var(--main-dark-4) 100%);
  border-radius: 36px; padding: 70px 40px; position: relative; overflow: hidden; text-align: center;
  border: 1px solid var(--main-dark-5); box-shadow: 0 25px 60px rgba(0, 0, 0, 0.16);
}
.cta-glow { position: absolute; width: 280px; height: 280px; background: var(--main-color); filter: blur(110px); opacity: 0.22; bottom: -60px; right: -60px; }
.cta-inner { position: relative; z-index: 1; max-width: 620px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; }
.cta-card h2 { color: var(--main-light-1); font-size: clamp(26px, 3.8vw, 40px); font-weight: 800; letter-spacing: -0.6px; margin: 0; }
.cta-card p { color: var(--main-light-4); font-size: 17px; line-height: 1.65; margin: 0; }
.cta-actions { display: flex; gap: 18px; margin-top: 10px; }

/* Микро-взаимодействие: Кнопка с эффектом пульсации */
.pulse-btn:hover { animation: pulseEff 1.4s infinite; }
@keyframes pulseEff {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--main-color) 45%, transparent); }
  70% { box-shadow: 0 0 0 14px color-mix(in srgb, var(--main-color) 0%, transparent); }
  100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--main-color) 0%, transparent); }
}

/* ===== МЕДИА-ЗАПРОСЫ ДЛЯ АДАПТИВНОСТИ РАЗМЕТКИ ===== */
@media (max-width: 1100px) {
  .hero-inner { grid-template-columns: 1fr; gap: 50px; text-align: center; }
  .hero-content { align-items: center; }
  .hero-visual { max-width: 540px; margin: 0 auto; }
  .steps-connecting-line { display: none; }
  .steps-grid { grid-template-columns: 1fr; gap: 36px; }
  .step-card { flex-direction: row; text-align: left; gap: 24px; padding: 0; }
  .step-dot { box-shadow: none; flex-shrink: 0; }
  .step-number-flow { font-size: 32px; width: 45px; }
}

@media (max-width: 768px) {
  .hero { padding: 80px 20px 50px; }
  .programs { padding: 80px 20px; }
  .programs-grid { grid-template-columns: 1fr; }
  .stats-grid { flex-direction: column; gap: 32px; }
  .stat-divider { display: none; }
  .cta-card { padding: 50px 24px; }
  .cta-actions { flex-direction: column; width: 100%; }
  .cta-actions > * { width: 100%; }
}
</style>