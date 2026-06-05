<script setup lang="ts">
import { nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

/**
 * Интеллектуальная навигация по секциям.
 * Если пользователь находится не на главной странице ('/'),
 * скрипт сначала перенаправляет его на главную, дожидается обновления DOM
 * через nextTick(), а затем плавно скроллит к нужному элементу по ID.
 */
const navigateToSection = async (sectionId: string) => {
  if (route.path !== '/') {
    await router.push('/')
    await nextTick() // Ожидание полной отрисовки страницы во Vue
  }
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<template>
  <footer class="custom-footer">
    <div class="footer-wrap">
      <div class="footer-grid-system">

        <div class="footer-block block-main">
          <span class="footer-logo-text">NTI Portal</span>
          <p class="footer-description">
            Nitriansky technologický inkubátor UKF v Nitre spája talentovaných študentov, inovátorov a firmy pre budovanie úspešných technologických projektov.
          </p>

          <div class="footer-socials">
            <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn" class="social-icon-only">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram" class="social-icon-only">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" class="social-icon-only">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        <div class="footer-block block-center">
          <h4 class="block-title">{{ $t('footer.navigation') }}</h4>
          <nav class="block-links">
            <button @click="navigateToSection('programs')" class="interactive-link-btn">{{ $t('header.programs') }}</button>
            <button @click="navigateToSection('news')" class="interactive-link-btn">{{ $t('header.news') }}</button>
            <button @click="navigateToSection('partners')" class="interactive-link-btn">{{ $t('header.partners') }}</button>
            <router-link to="/about-us" class="interactive-link-btn router-style">{{ $t('footer.about_us') || 'O nás' }}</router-link>
          </nav>
        </div>

        <div class="footer-block block-right">
          <h4 class="block-title">{{ $t('footer.support') }}</h4>
          <div class="block-links">
            <a href="mailto:nti@ukf.sk" class="contact-link email-highlight">
              <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span class="link-text">nti@ukf.sk</span>
            </a>

            <a href="tel:+421900000000" class="contact-link">
              <svg class="contact-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 .8 2.81A2 2 0 0 1 22 16.92z"></path></svg>
              <span class="link-text">+421 9xx xxx xxx</span>
            </a>

            <a href="https://maps.google.com" target="_blank" rel="noopener" class="contact-link address-layout">
              <svg class="contact-icon address-icon-align" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span class="link-text">Trieda A. Hlinku 1,<br>949 01 Nitra, Slovakia</span>
            </a>
          </div>
        </div>

      </div>
    </div>

    <div class="footer-copyright-line">
      <div class="footer-wrap copyright-flex">
        <p class="copyright-text">© 2026 Nitriansky technologický inkubátor. {{ $t('footer.license') }}</p>
        <router-link to="/privacy" class="legal-bottom-link">
          {{ $t('footer.privacy_policy') }}
        </router-link>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.custom-footer {
  background: #090d10;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: #8c9ba5;
  padding-top: 40px;
  margin-top: auto;
  width: 100%;
  display: block;
  box-sizing: border-box;
}

.footer-wrap {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
  display: block;
}

.footer-grid-system {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 30px;
  padding-bottom: 20px;
  width: 100%;
}

.footer-block {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: flex-start;
  text-align: left;
}

.block-main { max-width: 440px; }
.block-center { padding-left: 40px; }
.block-right { justify-self: end; min-width: 260px; }

.footer-logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
}

.footer-description {
  font-size: 0.88rem;
  line-height: 1.5;
  margin: 0 0 16px 0;
  color: #8c9ba5;
}

.footer-socials {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.social-icon-only {
  color: #8c9ba5;
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icon-only:hover {
  color: #ffffff;
  transform: translateY(-1px);
}

.block-title {
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #ffffff;
  margin: 0 0 16px 0;
}

.block-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

/* Элементы управления с анимацией линии при наведении */
.interactive-link-btn {
  background: none;
  border: none;
  padding: 0;
  font-family: inherit;
  cursor: pointer;
  font-size: 0.88rem;
  color: #8c9ba5;
  text-align: left;
  line-height: 1.4;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
  position: relative;
  width: fit-content;
}

.interactive-link-btn.router-style { text-decoration: none; }

.interactive-link-btn::after, .contact-link .link-text::after {
  content: '';
  position: absolute;
  width: 100%;
  transform: scaleX(0);
  height: 1px;
  bottom: -1px;
  left: 0;
  background-color: #ffffff;
  transform-origin: bottom left;
  transition: transform 0.2s ease-out;
}

.interactive-link-btn:hover::after,
.contact-link:hover .link-text::after {
  transform: scaleX(1);
}

.interactive-link-btn:hover, .contact-link:hover { color: #ffffff; }

.contact-link {
  font-size: 0.88rem;
  color: #8c9ba5;
  text-decoration: none;
  line-height: 1.4;
  display: inline-flex;
  align-items: center;
  transition: color 0.2s ease;
  position: relative;
  width: fit-content;
}

.link-text { position: relative; padding-bottom: 2px; }

.contact-icon {
  margin-right: 10px;
  flex-shrink: 0;
  color: #52626d;
  transition: color 0.2s ease;
}

.contact-link:hover .contact-icon { color: #ffffff; }
.email-highlight { font-weight: 500; color: #cdd7de !important; }
.email-highlight:hover { color: #ffffff !important; }
.address-layout { display: flex; align-items: flex-start; }
.address-icon-align { margin-top: 4px; }

.legal-bottom-link {
  font-size: 0.8rem;
  color: #52626d;
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

.legal-bottom-link::after {
  content: '';
  position: absolute;
  width: 100%;
  transform: scaleX(0);
  height: 1px;
  bottom: -1px;
  left: 0;
  background-color: #8c9ba5;
  transform-origin: bottom left;
  transition: transform 0.2s ease-out;
}

.legal-bottom-link:hover { color: #8c9ba5; }
.legal-bottom-link:hover::after { transform: scaleX(1); }
.footer-copyright-line { border-top: 1px solid rgba(255, 255, 255, 0.04); padding: 16px 0; margin-top: 10px; }
.copyright-flex { display: flex; justify-content: space-between; align-items: center; }
.copyright-text { font-size: 0.8rem; margin: 0; color: #52626d; }

/* Медиа-запросы для адаптивной сетки футера */
@media (max-width: 992px) {
  .footer-grid-system { grid-template-columns: 1.2fr 1fr; gap: 30px; }
  .block-center { padding-left: 0; }
  .block-right { justify-self: start; min-width: auto; }
}

@media (max-width: 768px) {
  .footer-wrap { padding: 0 24px; }
  .footer-grid-system { grid-template-columns: 1fr; gap: 24px; padding-bottom: 20px; }
  .copyright-flex { flex-direction: column; text-align: center; gap: 8px; }
}
</style>