<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCmsStore } from '@/stores/cms'
import { useSeoMeta } from '@/composables/useSeoMeta'
import EmptyIcon from '@/assets/icons/empty.svg'

const route = useRoute()
const cmsStore = useCmsStore()

const slug = computed(() => route.params.slug as string)

onMounted(() => {
  cmsStore.fetchPages()
})

const page = computed(() => cmsStore.pages.find((p) => p.slug === slug.value && p.status.is_published) ?? null)
const notFound = computed(() => !cmsStore.pagesLoading && !page.value)

useSeoMeta(
  computed(() => page.value?.seo?.meta_title || page.value?.title),
  computed(() => page.value?.seo?.meta_description)
)
</script>

<template>
  <main class="page-page">
    <div class="container container-narrow">
      <RouterLink to="/" class="back-link">← {{ $t('cms.back_home') }}</RouterLink>

      <div v-if="cmsStore.pagesLoading" class="skeleton-wrap fade-in">
        <div class="skeleton-bar" style="width: 50%;"></div>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar" style="width: 80%;"></div>
      </div>

      <div v-else-if="notFound" class="empty-state fade-in">
        <EmptyIcon />
        <p>{{ $t('cms.page_not_found') }}</p>
        <RouterLink to="/" class="btn-link">{{ $t('cms.back_home') }}</RouterLink>
      </div>

      <article v-else-if="page" class="page-detail fade-in">
        <h1 class="page-title">{{ page.title }}</h1>
        <div class="page-content" v-html="page.content"></div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.page-page {
  padding: 40px 0 80px;
}
.container {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
}
.container-narrow {
  max-width: 820px;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--main-color, #ea6d7e);
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 24px;
}
@media (hover: hover) and (pointer: fine) {
  .back-link:hover {
    text-decoration: underline;
  }
}
.page-title {
  font-size: 2rem;
  margin: 0 0 20px;
  color: var(--text-color);
}
.page-content {
  color: var(--text-color);
  line-height: 1.7;
  font-size: 1.05rem;
}
.page-content :deep(p) {
  margin: 0 0 16px;
}
.page-content :deep(img) {
  max-width: 100%;
  border-radius: 12px;
}
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
.btn-link {
  color: var(--main-color, #ea6d7e);
  font-weight: 600;
  text-decoration: none;
}
@media (hover: hover) and (pointer: fine) {
  .btn-link:hover {
    text-decoration: underline;
  }
}
.skeleton-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.skeleton-bar {
  background: linear-gradient(90deg, var(--card-bg-color) 25%, var(--card-bg-color-hover) 50%, var(--card-bg-color) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite linear;
  height: 24px;
  border-radius: 8px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.fade-in {
  animation: fadeInUp 0.6s ease both;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
