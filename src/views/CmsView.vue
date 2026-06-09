<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCmsStore, type Post, type Page } from '@/stores/cms'
import { useNotificationStore } from '@/stores/notifications'

const { t } = useI18n()
const store = useCmsStore()
const notif = useNotificationStore()

// ── Tabs ─────────────────────────────────────────────────────
type Tab = 'posts' | 'pages'
const activeTab = ref<Tab>('posts')

// ── Search ───────────────────────────────────────────────────
const search = ref('')

const filteredPosts = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return store.posts
  return store.posts.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
})

const filteredPages = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return store.pages
  return store.pages.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
})

// ── Post modal ───────────────────────────────────────────────
const showPostModal = ref(false)
const editingPost = ref<Post | null>(null)

const pTitle     = ref('')
const pSlug      = ref('')
const pExcerpt   = ref('')
const pContent   = ref('')
const pType      = ref<string>('article')
const pPublished = ref(false)
const pError     = ref<string | null>(null)

const POST_TYPES = ['article', 'faq', 'success_story'] as const

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function openCreatePost() {
  editingPost.value = null
  pTitle.value = pSlug.value = pExcerpt.value = pContent.value = ''
  pType.value = 'article'; pPublished.value = false; pError.value = null
  showPostModal.value = true
}

function openEditPost(post: Post) {
  editingPost.value = post
  pTitle.value     = post.title
  pSlug.value      = post.slug
  pExcerpt.value   = post.excerpt ?? ''
  pContent.value   = post.content
  pType.value      = post.type ?? 'article'
  pPublished.value = post.status.is_published
  pError.value     = null
  showPostModal.value = true
}

function onTitleInputPost() {
  if (!editingPost.value) pSlug.value = slugify(pTitle.value)
}

async function submitPost() {
  if (!pTitle.value.trim() || !pSlug.value.trim() || !pContent.value.trim()) {
    pError.value = t('cms.validation')
    return
  }
  pError.value = null
  const payload = {
    title: pTitle.value.trim(),
    slug: pSlug.value.trim(),
    excerpt: pExcerpt.value.trim() || undefined,
    content: pContent.value.trim(),
    type: pType.value,
    is_published: pPublished.value,
  }
  try {
    if (editingPost.value) {
      await store.updatePost(editingPost.value.id, payload)
      notif.add(t('cms.post_updated'), 'success')
    } else {
      await store.createPost(payload)
      notif.add(t('cms.post_created'), 'success')
    }
    showPostModal.value = false
  } catch { /* interceptor */ }
}

const confirmDeletePost = ref<Post | null>(null)
async function handleDeletePost() {
  if (!confirmDeletePost.value) return
  try {
    await store.deletePost(confirmDeletePost.value.id)
    notif.add(t('cms.post_deleted'), 'success')
    confirmDeletePost.value = null
  } catch { /* interceptor */ }
}

// ── Page modal ───────────────────────────────────────────────
const showPageModal = ref(false)
const editingPage = ref<Page | null>(null)

const pgTitle       = ref('')
const pgSlug        = ref('')
const pgContent     = ref('')
const pgMetaTitle   = ref('')
const pgMetaDesc    = ref('')
const pgPublished   = ref(false)
const pgError       = ref<string | null>(null)

function openCreatePage() {
  editingPage.value = null
  pgTitle.value = pgSlug.value = pgContent.value = pgMetaTitle.value = pgMetaDesc.value = ''
  pgPublished.value = false; pgError.value = null
  showPageModal.value = true
}

function openEditPage(page: Page) {
  editingPage.value = page
  pgTitle.value     = page.title
  pgSlug.value      = page.slug
  pgContent.value   = page.content
  pgMetaTitle.value = page.seo.meta_title ?? ''
  pgMetaDesc.value  = page.seo.meta_description ?? ''
  pgPublished.value = page.status.is_published
  pgError.value     = null
  showPageModal.value = true
}

function onTitleInputPage() {
  if (!editingPage.value) pgSlug.value = slugify(pgTitle.value)
}

async function submitPage() {
  if (!pgTitle.value.trim() || !pgSlug.value.trim() || !pgContent.value.trim()) {
    pgError.value = t('cms.validation')
    return
  }
  pgError.value = null
  const payload = {
    title: pgTitle.value.trim(),
    slug: pgSlug.value.trim(),
    content: pgContent.value.trim(),
    meta_title: pgMetaTitle.value.trim() || undefined,
    meta_description: pgMetaDesc.value.trim() || undefined,
    is_published: pgPublished.value,
  }
  try {
    if (editingPage.value) {
      await store.updatePage(editingPage.value.id, payload)
      notif.add(t('cms.page_updated'), 'success')
    } else {
      await store.createPage(payload)
      notif.add(t('cms.page_created'), 'success')
    }
    showPageModal.value = false
  } catch { /* interceptor */ }
}

const confirmDeletePage = ref<Page | null>(null)
async function handleDeletePage() {
  if (!confirmDeletePage.value) return
  try {
    await store.deletePage(confirmDeletePage.value.id)
    notif.add(t('cms.page_deleted'), 'success')
    confirmDeletePage.value = null
  } catch { /* interceptor */ }
}

// ── Helpers ───────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

onMounted(() => {
  store.fetchPosts()
  store.fetchPages()
})
</script>

<template>
  <div class="cms-page">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>{{ $t('cms.title') }}</h1>
        <p class="subtitle">{{ $t('cms.subtitle') }}</p>
      </div>
      <button v-if="activeTab === 'posts'" class="btn-new" @click="openCreatePost">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('cms.new_post') }}
      </button>
      <button v-else class="btn-new" @click="openCreatePage">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        {{ $t('cms.new_page') }}
      </button>
    </div>

    <!-- Tabs + Search row -->
    <div class="toolbar">
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'; search = ''">
          {{ $t('cms.tab_posts') }}
          <span v-if="store.posts.length" class="tab-count">{{ store.posts.length }}</span>
        </button>
        <button class="tab" :class="{ active: activeTab === 'pages' }" @click="activeTab = 'pages'; search = ''">
          {{ $t('cms.tab_pages') }}
          <span v-if="store.pages.length" class="tab-count">{{ store.pages.length }}</span>
        </button>
      </div>
      <div class="search-bar">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" type="text" class="search-input" :placeholder="$t('cms.search_placeholder')" />
      </div>
    </div>

    <!-- POSTS -->
    <template v-if="activeTab === 'posts'">
      <div v-if="store.postsLoading" class="state-box"><div class="spinner"></div></div>
      <div v-else-if="filteredPosts.length === 0" class="empty-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        <p>{{ search ? $t('cms.no_results') : $t('cms.posts_empty') }}</p>
      </div>
      <div v-else class="item-list">
        <div v-for="post in filteredPosts" :key="post.id" class="item-row">
          <div class="item-status" :class="post.status.is_published ? 'status-pub' : 'status-draft'">
            {{ post.status.is_published ? $t('cms.published') : $t('cms.draft') }}
          </div>
          <div class="item-info">
            <div class="item-title-row">
              <span class="item-title">{{ post.title }}</span>
              <span v-if="post.type" class="type-badge">{{ $t(`cms.type_${post.type}`) }}</span>
            </div>
            <p class="item-slug">/{{ post.slug }}</p>
            <p v-if="post.excerpt" class="item-preview">{{ post.excerpt.slice(0, 100) }}{{ post.excerpt.length > 100 ? '…' : '' }}</p>
          </div>
          <div class="item-actions">
            <button class="action-btn action-edit" @click="openEditPost(post)" :title="$t('cms.edit')">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn action-delete" @click="confirmDeletePost = post" :title="$t('cms.delete')">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- PAGES -->
    <template v-else>
      <div v-if="store.pagesLoading" class="state-box"><div class="spinner"></div></div>
      <div v-else-if="filteredPages.length === 0" class="empty-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>{{ search ? $t('cms.no_results') : $t('cms.pages_empty') }}</p>
      </div>
      <div v-else class="item-list">
        <div v-for="page in filteredPages" :key="page.id" class="item-row">
          <div class="item-status" :class="page.status.is_published ? 'status-pub' : 'status-draft'">
            {{ page.status.is_published ? $t('cms.published') : $t('cms.draft') }}
          </div>
          <div class="item-info">
            <span class="item-title">{{ page.title }}</span>
            <p class="item-slug">/{{ page.slug }}</p>
            <p v-if="page.seo.meta_description" class="item-preview">{{ page.seo.meta_description.slice(0, 100) }}{{ page.seo.meta_description.length > 100 ? '…' : '' }}</p>
          </div>
          <div class="item-actions">
            <button class="action-btn action-edit" @click="openEditPage(page)" :title="$t('cms.edit')">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="action-btn action-delete" @click="confirmDeletePage = page" :title="$t('cms.delete')">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </template>

  </div>

  <!-- Post Modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="showPostModal" class="modal-overlay" @click.self="showPostModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ editingPost ? $t('cms.edit_post_title') : $t('cms.create_post_title') }}</h3>
            <button class="modal-close" @click="showPostModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label>{{ $t('cms.field_title') }}</label>
                <input v-model="pTitle" type="text" class="form-input" @input="onTitleInputPost" />
              </div>
              <div class="form-group">
                <label>{{ $t('cms.field_type') }}</label>
                <select v-model="pType" class="form-select">
                  <option v-for="pt in POST_TYPES" :key="pt" :value="pt">{{ $t(`cms.type_${pt}`) }}</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>{{ $t('cms.field_slug') }}</label>
              <input v-model="pSlug" type="text" class="form-input mono" />
            </div>
            <div class="form-group">
              <label>{{ $t('cms.field_excerpt') }}</label>
              <textarea v-model="pExcerpt" class="form-textarea" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>{{ $t('cms.field_content') }}</label>
              <textarea v-model="pContent" class="form-textarea" rows="9"></textarea>
            </div>
            <label class="toggle-row">
              <input type="checkbox" v-model="pPublished" class="toggle-input" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">{{ $t('cms.field_published') }}</span>
            </label>
            <p v-if="pError" class="form-error">{{ pError }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showPostModal = false">{{ $t('challenges.form_cancel') }}</button>
            <button class="btn-save" :disabled="store.saving" @click="submitPost">
              <svg v-if="store.saving" class="spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ store.saving ? $t('cms.saving') : $t('cms.save') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Page Modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="showPageModal" class="modal-overlay" @click.self="showPageModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ editingPage ? $t('cms.edit_page_title') : $t('cms.create_page_title') }}</h3>
            <button class="modal-close" @click="showPageModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid-2">
              <div class="form-group">
                <label>{{ $t('cms.field_title') }}</label>
                <input v-model="pgTitle" type="text" class="form-input" @input="onTitleInputPage" />
              </div>
              <div class="form-group">
                <label>{{ $t('cms.field_slug') }}</label>
                <input v-model="pgSlug" type="text" class="form-input mono" />
              </div>
            </div>
            <div class="form-group">
              <label>{{ $t('cms.field_content') }}</label>
              <textarea v-model="pgContent" class="form-textarea" rows="8"></textarea>
            </div>
            <div class="form-group">
              <label>{{ $t('cms.field_meta_title') }}</label>
              <input v-model="pgMetaTitle" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>{{ $t('cms.field_meta_desc') }}</label>
              <textarea v-model="pgMetaDesc" class="form-textarea" rows="2"></textarea>
            </div>
            <label class="toggle-row">
              <input type="checkbox" v-model="pgPublished" class="toggle-input" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-label">{{ $t('cms.field_published') }}</span>
            </label>
            <p v-if="pgError" class="form-error">{{ pgError }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showPageModal = false">{{ $t('challenges.form_cancel') }}</button>
            <button class="btn-save" :disabled="store.saving" @click="submitPage">
              <svg v-if="store.saving" class="spin" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ store.saving ? $t('cms.saving') : $t('cms.save') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Delete Post confirm -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="confirmDeletePost" class="modal-overlay" @click.self="confirmDeletePost = null">
        <div class="modal-box modal-sm">
          <div class="modal-header">
            <h3>{{ $t('cms.delete_title') }}</h3>
            <button class="modal-close" @click="confirmDeletePost = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ $t('cms.delete_confirm', { title: confirmDeletePost?.title }) }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="confirmDeletePost = null">{{ $t('challenges.form_cancel') }}</button>
            <button class="btn-delete" @click="handleDeletePost">{{ $t('cms.delete') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Delete Page confirm -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="confirmDeletePage" class="modal-overlay" @click.self="confirmDeletePage = null">
        <div class="modal-box modal-sm">
          <div class="modal-header">
            <h3>{{ $t('cms.delete_title') }}</h3>
            <button class="modal-close" @click="confirmDeletePage = null">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p>{{ $t('cms.delete_confirm', { title: confirmDeletePage?.title }) }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="confirmDeletePage = null">{{ $t('challenges.form_cancel') }}</button>
            <button class="btn-delete" @click="handleDeletePage">{{ $t('cms.delete') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.cms-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: var(--font-main), sans-serif;
  color: var(--text-color);
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 32px;
  width: 100%;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.page-header h1 {
  font-size: clamp(20px, 2.5vw, 26px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.subtitle { font-size: 14px; opacity: 0.6; margin: 0; }

.btn-new {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 20px;
  background: var(--main-color); color: #fff;
  border: none; border-radius: 10px;
  font-family: inherit; font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  transition: opacity 0.15s;
}
.btn-new:hover { opacity: 0.88; }

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.tabs { display: flex; gap: 4px; }
.tab {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 16px;
  border-radius: 9px;
  border: 1.5px solid transparent;
  background: transparent;
  color: var(--text-color);
  font-family: inherit; font-size: 13px; font-weight: 700;
  cursor: pointer;
  opacity: 0.55;
  transition: background 0.15s, opacity 0.15s, border-color 0.15s;
}
.tab.active {
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  border-color: var(--main-color);
  color: var(--main-color);
  opacity: 1;
}
.tab-count {
  font-size: 10px; font-weight: 700;
  background: var(--main-color); color: #fff;
  padding: 1px 6px; border-radius: 100px;
}

.search-bar {
  flex: 1; min-width: 180px;
  display: flex; align-items: center; gap: 8px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 9px;
  padding: 0 12px;
}
.search-icon { opacity: 0.4; flex-shrink: 0; }
.search-input {
  flex: 1; background: none; border: none; outline: none;
  padding: 9px 0; font-family: inherit; font-size: 13px;
  color: var(--text-color);
}

/* States */
.state-box { display: flex; align-items: center; justify-content: center; padding: 40px; }
.spinner {
  width: 26px; height: 26px;
  border: 3px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin-anim 0.9s linear infinite;
}
.empty-box { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 48px; opacity: 0.5; }
.empty-icon { opacity: 0.5; }

/* Item list */
.item-list { display: flex; flex-direction: column; gap: 8px; }

.item-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  padding: 16px 20px;
  transition: border-color 0.15s;
}
.item-row:hover { border-color: color-mix(in srgb, var(--main-color) 40%, var(--menu-border)); }

.item-status {
  flex-shrink: 0;
  font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.5px;
  padding: 3px 9px; border-radius: 100px;
  margin-top: 3px;
  white-space: nowrap;
}
.status-pub   { background: color-mix(in srgb, var(--good-color) 15%, transparent); color: var(--good-color); }
.status-draft { background: color-mix(in srgb, #f59e0b 15%, transparent); color: #f59e0b; }

.item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.item-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.item-title { font-size: 15px; font-weight: 800; }
.type-badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
  padding: 2px 8px; border-radius: 5px;
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--main-color);
}
.item-slug { font-size: 12px; font-family: monospace; opacity: 0.45; margin: 0; }
.item-preview { font-size: 12.5px; opacity: 0.5; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.item-actions { display: flex; flex-direction: column; gap: 6px; flex-shrink: 0; }
.action-btn {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 8px; border: 1.5px solid var(--menu-border);
  background: transparent; color: var(--text-color); cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}
.action-edit:hover  { background: color-mix(in srgb, var(--main-color) 12%, transparent); border-color: var(--main-color); color: var(--main-color); }
.action-delete:hover { background: var(--error-color); border-color: var(--error-color); color: #fff; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex; align-items: center; justify-content: center;
  z-index: 1001; padding: 20px;
  color: var(--text-color);
}
.modal-box {
  background: var(--menu-color);
  border-radius: 18px;
  width: 100%; max-width: 680px;
  max-height: calc(100vh - 40px);
  display: flex; flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,0.35);
  animation: modal-in 0.18s ease;
}
.modal-sm { max-width: 420px; }

@keyframes modal-in {
  from { opacity: 0; transform: translateY(10px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--menu-border); flex-shrink: 0;
}
.modal-header h3 { font-size: 16px; font-weight: 800; margin: 0; }
.modal-close { background: none; border: none; cursor: pointer; color: var(--text-color); opacity: 0.5; padding: 4px; border-radius: 6px; display: flex; }
.modal-close:hover { opacity: 1; }

.modal-body {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 14px;
  overflow-y: auto;
}

.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.55; }

.form-input, .form-select, .form-textarea {
  width: 100%; box-sizing: border-box;
  padding: 10px 13px;
  background: var(--bg-color);
  border: 1.5px solid var(--menu-border);
  border-radius: 10px;
  font-family: inherit; font-size: 14px; color: var(--text-color);
  outline: none; transition: border-color 0.15s;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--main-color); }
.form-textarea { resize: vertical; min-height: 80px; }
.mono { font-family: monospace; }
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; cursor: pointer;
}

/* Toggle */
.toggle-row { display: flex; align-items: center; gap: 10px; cursor: pointer; user-select: none; }
.toggle-input { display: none; }
.toggle-track {
  width: 40px; height: 22px;
  background: var(--menu-border);
  border-radius: 100px; position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.toggle-input:checked + .toggle-track { background: var(--main-color); }
.toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px;
  background: #fff; border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.toggle-input:checked + .toggle-track .toggle-thumb { transform: translateX(18px); }
.toggle-label { font-size: 14px; font-weight: 700; }

.form-error { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 10px;
  padding: 16px 24px 20px; border-top: 1px solid var(--menu-border); flex-shrink: 0;
}
.btn-cancel {
  padding: 9px 18px; border-radius: 9px;
  border: 1.5px solid var(--menu-border); background: transparent; color: var(--text-color);
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
}
.btn-cancel:hover { border-color: var(--text-color); }
.btn-save {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; background: var(--main-color); color: #fff;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: opacity 0.15s;
}
.btn-save:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-save:hover:not(:disabled) { opacity: 0.88; }
.btn-delete {
  padding: 9px 18px; background: var(--error-color); color: #fff;
  border: none; border-radius: 9px;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
}
.btn-delete:hover { opacity: 0.88; }

@keyframes spin-anim { to { transform: rotate(360deg); } }
.spin { animation: spin-anim 0.8s linear infinite; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 700px) {
  .cms-page { padding: 24px 16px; }
  .form-grid-2 { grid-template-columns: 1fr; }
  .item-row { flex-wrap: wrap; }
  .item-actions { flex-direction: row; }
}
</style>
