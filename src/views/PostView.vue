<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import { useLanguage } from '@/composables/useLanguage'
import { useSeoMeta } from '@/composables/useSeoMeta'
import EmptyIcon from '@/assets/icons/empty.svg'

const route = useRoute()
const postsStore = usePostsStore()
const { currentLang } = useLanguage()

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

const post = computed(() => postsStore.currentPost)
const notFound = computed(() => !postsStore.loading && !post.value)

watch(
  () => route.params.slug,
  (slug) => {
    if (typeof slug === 'string') postsStore.fetchPostBySlug(slug)
  },
  { immediate: true }
)

useSeoMeta(
  computed(() => post.value?.seo?.meta_title || post.value?.title),
  computed(() => post.value?.seo?.meta_description || post.value?.excerpt)
)
</script>

<template>
  <main class="post-page">
    <div class="container container-narrow">
      <RouterLink to="/" class="back-link">← {{ $t('cms.back_home') }}</RouterLink>

      <div v-if="postsStore.loading" class="skeleton-wrap fade-in">
        <div class="skeleton-bar" style="width: 50%;"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-bar"></div>
        <div class="skeleton-bar" style="width: 80%;"></div>
      </div>

      <div v-else-if="notFound" class="empty-state fade-in">
        <EmptyIcon />
        <p>{{ $t('cms.post_not_found') }}</p>
        <RouterLink to="/" class="btn-link">{{ $t('cms.back_home') }}</RouterLink>
      </div>

      <article v-else-if="post" class="post-detail fade-in">
        <div class="post-meta">
          <span v-if="post.author" class="author-row">
            <span class="author-avatar">{{ post.author.name.charAt(0) }}</span>
            <span>{{ post.author.name }}</span>
          </span>
          <span v-if="post.status.published_at" class="muted">{{ formatDate(post.status.published_at) }}</span>
        </div>
        <h1 class="post-title">{{ post.title }}</h1>
        <div v-if="post.featured_image" class="post-media">
          <img :src="mediaUrl(post.featured_image)" :alt="post.title" />
        </div>
        <div class="post-content" v-html="post.content"></div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.post-page {
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
.post-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.muted {
  color: var(--text-color-unimp);
  font-size: 0.9rem;
}
.post-title {
  font-size: 2rem;
  margin: 0 0 20px;
  color: var(--text-color);
}
.post-media {
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;
}
.post-media img {
  width: 100%;
  height: auto;
  display: block;
}
.post-content {
  color: var(--text-color);
  line-height: 1.7;
  font-size: 1.05rem;
}
.post-content :deep(p) {
  margin: 0 0 16px;
}
.post-content :deep(img) {
  max-width: 100%;
  border-radius: 12px;
}
.author-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color);
}
.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--main-color-light);
  color: var(--main-color-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  text-transform: uppercase;
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
.skeleton-card,
.skeleton-bar {
  background: linear-gradient(90deg, var(--card-bg-color) 25%, var(--card-bg-color-hover) 50%, var(--card-bg-color) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite linear;
  border-radius: 16px;
}
.skeleton-card {
  height: 280px;
}
.skeleton-bar {
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
