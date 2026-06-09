<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDocumentsStore } from '@/stores/documents'
import { useAuthStore } from '@/stores/auth'
import type { DocumentClassification, Document } from '@/stores/documents'

const store = useDocumentsStore()
const authStore = useAuthStore()

function canDownload(doc: Document): boolean {
  if (doc.classification === 'public') return true
  if (authStore.user?.id === doc.uploaded_by) return true
  if (authStore.hasAnyRole(['admin', 'super_admin', 'evaluator'])) return true
  return false
}

type FilterTab = 'all' | DocumentClassification
const filterTabs: FilterTab[] = ['all', 'public', 'internal', 'confidential']
const activeFilter = ref<FilterTab>('all')

const filtered = computed(() => {
  if (activeFilter.value === 'all') return store.documents
  return store.documents.filter((d: Document) => d.classification === activeFilter.value)
})

// Upload modal
const showUpload = ref(false)
const uploadFile = ref<File | null>(null)
const uploadType = ref('')
const uploadClass = ref<DocumentClassification>('public')
const uploadError = ref<string | null>(null)
const uploadSuccess = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const uploadFileExt = computed(() => {
  if (!uploadFile.value) return ''
  const parts = uploadFile.value.name.split('.')
  return parts.length > 1 ? parts.at(-1)!.toUpperCase().slice(0, 4) : 'FILE'
})

function formatFileBytes(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} B`
}

function onFileChange(e: Event) {
  uploadFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadFile.value = file
}

function removeFile() {
  uploadFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function submitUpload() {
  if (!uploadFile.value) return
  uploadError.value = null
  const fd = new FormData()
  fd.append('file', uploadFile.value)
  fd.append('classification', uploadClass.value)
  if (uploadType.value.trim()) fd.append('type', uploadType.value.trim())
  try {
    await store.uploadDocument(fd)
    uploadSuccess.value = true
    setTimeout(() => {
      showUpload.value = false
      uploadSuccess.value = false
      uploadFile.value = null
      uploadType.value = ''
      uploadClass.value = 'public'
    }, 1200)
  } catch (err: unknown) {
    uploadError.value = (err as Error).message
  }
}

function closeUpload() {
  showUpload.value = false
  uploadFile.value = null
  uploadType.value = ''
  uploadClass.value = 'public'
  uploadError.value = null
  uploadSuccess.value = false
}

// Delete
async function handleDelete(id: number) {
  if (!confirm(t('documents.delete_confirm'))) return
  try {
    await store.deleteDocument(id)
  } catch {
    // error is in store
  }
}

// Download / confidential code flow
const codeDocId = ref<number | null>(null)
const codeValue = ref('')
const codeRequesting = ref(false)
const codeSent = ref(false)
const codeError = ref<string | null>(null)

async function handleDownload(id: number, classification: DocumentClassification) {
  if (classification === 'confidential') {
    codeDocId.value = id
    codeValue.value = ''
    codeSent.value = false
    codeError.value = null
    codeRequesting.value = true
    try {
      await store.requestAccessCode(id)
      codeSent.value = true
    } catch (err: unknown) {
      codeError.value = (err as Error).message
    } finally {
      codeRequesting.value = false
    }
    return
  }
  await store.downloadDocument(id)
}

async function submitCode() {
  if (!codeDocId.value || !codeValue.value.trim()) return
  codeError.value = null
  try {
    await store.downloadDocument(codeDocId.value, codeValue.value.trim())
    codeDocId.value = null
  } catch (err: unknown) {
    const e = err as Error
    codeError.value = e.message ?? t('documents.code_error')
  }
}

function closeCodeModal() {
  codeDocId.value = null
  codeValue.value = ''
  codeSent.value = false
  codeError.value = null
}

// Preview
const previewDoc = ref<Document | null>(null)
const previewUrl = ref<string | null>(null)
const previewLoading = ref(false)

async function handlePreview(doc: Document) {
  previewDoc.value = doc
  previewUrl.value = null
  previewLoading.value = true
  try {
    previewUrl.value = await store.getPreviewUrl(doc.id)
  } catch {
    // interceptor shows error toast
    previewDoc.value = null
  } finally {
    previewLoading.value = false
  }
}

function closePreview() {
  previewDoc.value = null
  previewUrl.value = null
}

// Helpers
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

function formatSize(kb: number): string {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fileIcon(mime: string): string {
  if (mime.includes('pdf')) return 'pdf'
  if (mime.includes('word') || mime.includes('docx')) return 'doc'
  if (mime.includes('image')) return 'img'
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'xls'
  return 'file'
}

onMounted(() => store.fetchDocuments())
</script>

<template>
  <div class="documents-page">
    <div class="page-inner">

      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <h1>{{ $t('documents.title') }}</h1>
          <p class="subtitle">{{ $t('documents.subtitle') }}</p>
        </div>
        <button class="btn-upload" @click="showUpload = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ $t('documents.upload') }}
        </button>
      </div>

      <!-- Filters -->
      <div class="filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab"
          class="filter-tab"
          :class="{ active: activeFilter === tab }"
          @click="activeFilter = tab"
        >
          {{ $t(`documents.filter_${tab}`) }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="store.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('documents.loading') }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="empty-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p class="empty-title">{{ $t('documents.empty') }}</p>
        <p class="empty-desc">{{ $t('documents.empty_desc') }}</p>
      </div>

      <!-- Document list -->
      <div v-else class="doc-list">
        <div v-for="doc in filtered" :key="doc.id" class="doc-row">

          <div class="doc-icon" :class="`icon-${fileIcon(doc.mime_type)}`">
            <!-- PDF -->
            <svg v-if="fileIcon(doc.mime_type) === 'pdf'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <!-- DOC -->
            <svg v-else-if="fileIcon(doc.mime_type) === 'doc'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
            </svg>
            <!-- IMG -->
            <svg v-else-if="fileIcon(doc.mime_type) === 'img'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <!-- Generic file -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>

          <div class="doc-info">
            <div class="doc-name-row">
              <span class="doc-name">{{ doc.file_name }}</span>
              <span class="class-badge" :class="`class-${doc.classification}`">
                {{ $t(`documents.class_${doc.classification}`) }}
              </span>
              <span v-if="doc.version > 1" class="version-badge">
                {{ $t('documents.version', { n: doc.version }) }}
              </span>
            </div>
            <div class="doc-meta">
              <span v-if="doc.type" class="meta-item">{{ doc.type }}</span>
              <span class="meta-item">{{ formatSize(doc.size_kb) }}</span>
              <span class="meta-item">{{ $t('documents.uploaded') }}: {{ formatDate(doc.created_at) }}</span>
              <span v-if="doc.project_id" class="meta-item meta-link">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/>
                </svg>
                {{ $t('documents.project') }} #{{ doc.project_id }}
              </span>
              <span v-else-if="doc.application_id" class="meta-item meta-link">
                {{ $t('documents.application') }} #{{ doc.application_id }}
              </span>
            </div>
          </div>

          <div class="doc-actions">
            <button
              class="action-btn action-preview"
              :disabled="store.actionLoading || previewLoading"
              @click="handlePreview(doc)"
              :title="$t('documents.action_preview')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button
              v-if="canDownload(doc)"
              class="action-btn action-download"
              :disabled="store.actionLoading"
              @click="handleDownload(doc.id, doc.classification)"
              :title="doc.classification === 'confidential' ? $t('documents.action_request_code') : $t('documents.action_download')"
            >
              <svg v-if="doc.classification === 'confidential'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button
              class="action-btn action-delete"
              :disabled="store.actionLoading"
              @click="handleDelete(doc.id)"
              :title="$t('documents.action_delete')"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Upload Modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="showUpload" class="modal-overlay" @click.self="closeUpload">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ $t('documents.upload_title') }}</h3>
            <button class="modal-close" @click="closeUpload">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- File drop zone -->
            <div
              class="file-drop"
              :class="{ 'has-file': uploadFile, 'is-dragging': isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="onDrop"
              @click="fileInputRef?.click()"
            >
              <input ref="fileInputRef" type="file" style="display:none" @change="onFileChange" />

              <template v-if="!uploadFile">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="drop-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p class="drop-hint-text">{{ $t('documents.upload_drop_hint') }}</p>
                <span class="drop-hint-sub">{{ $t('documents.upload_drop_sub') }}</span>
              </template>

              <div v-else class="file-preview" @click.stop>
                <div class="file-ext-badge">{{ uploadFileExt }}</div>
                <div class="file-info">
                  <span class="file-name">{{ uploadFile.name }}</span>
                  <span class="file-size">{{ formatFileBytes(uploadFile.size) }}</span>
                </div>
                <button class="file-remove" type="button" @click.stop="removeFile">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <label class="form-label">
              {{ $t('documents.upload_type_label') }}
              <input v-model="uploadType" type="text" class="form-input" :placeholder="$t('documents.upload_type_placeholder')" />
            </label>

            <label class="form-label">
              {{ $t('documents.upload_class_label') }}
              <select v-model="uploadClass" class="form-select">
                <option value="public">{{ $t('documents.class_public') }}</option>
                <option value="internal">{{ $t('documents.class_internal') }}</option>
                <option value="confidential">{{ $t('documents.class_confidential') }}</option>
              </select>
            </label>

            <p v-if="uploadError" class="form-error">{{ uploadError }}</p>
            <p v-if="uploadSuccess" class="form-success">{{ $t('documents.upload_success') }}</p>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeUpload">{{ $t('challenges.form_cancel') }}</button>
            <button
              class="btn-submit"
              :disabled="!uploadFile || store.actionLoading"
              @click="submitUpload"
            >
              {{ store.actionLoading ? $t('documents.uploading') : $t('documents.upload_submit') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Confidential code modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="codeDocId !== null" class="modal-overlay" @click.self="closeCodeModal">
        <div class="modal-box modal-box--sm">
          <div class="modal-header">
            <h3>{{ $t('documents.code_title') }}</h3>
            <button class="modal-close" @click="closeCodeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="codeRequesting" class="code-loading">
              <div class="spinner-sm"></div>
              <span>{{ $t('documents.code_requesting') }}</span>
            </div>
            <template v-else>
              <p v-if="codeSent" class="code-sent-msg">{{ $t('documents.code_sent') }}</p>
              <p v-if="codeError && !codeSent" class="form-error">{{ codeError }}</p>
              <p class="code-desc">{{ $t('documents.code_desc') }}</p>
              <label class="form-label">
                {{ $t('documents.code_label') }}
                <input
                  v-model="codeValue"
                  type="text"
                  class="form-input code-input"
                  :placeholder="$t('documents.code_placeholder')"
                  maxlength="10"
                  @keydown.enter="submitCode"
                />
              </label>
              <p v-if="codeError && codeSent" class="form-error">{{ codeError }}</p>
            </template>
          </div>

          <div class="modal-footer">
            <button class="btn-cancel" @click="closeCodeModal">{{ $t('challenges.action_cancel') ?? 'Cancel' }}</button>
            <button
              class="btn-submit"
              :disabled="!codeValue.trim() || codeRequesting"
              @click="submitCode"
            >
              {{ $t('documents.code_submit') }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>

  <!-- Preview Modal -->
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="previewDoc" class="modal-overlay preview-overlay" @click.self="closePreview">
        <div class="modal-box preview-box">
          <div class="modal-header">
            <h3 class="preview-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {{ previewDoc.file_name }}
            </h3>
            <button class="modal-close" @click="closePreview">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div class="preview-body">
            <div v-if="previewLoading" class="preview-loading">
              <div class="spinner"></div>
              <p>{{ $t('documents.preview_loading') }}</p>
            </div>
            <template v-else-if="previewUrl">
              <img
                v-if="previewDoc.mime_type.startsWith('image/')"
                :src="previewUrl"
                class="preview-img"
                :alt="previewDoc.file_name"
              />
              <iframe
                v-else
                :src="previewUrl"
                class="preview-iframe"
                :title="previewDoc.file_name"
              />
            </template>
          </div>

          <div class="modal-footer">
            <a
              v-if="previewUrl"
              :href="previewUrl"
              target="_blank"
              rel="noopener"
              class="btn-open-new"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              {{ $t('documents.preview_open_new') }}
            </a>
            <button class="btn-cancel" @click="closePreview">{{ $t('challenges.form_cancel') }}</button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.documents-page {
  font-family: var(--font-main), sans-serif;
  background: var(--bg-color);
  min-height: calc(100vh - 75px);
  color: var(--text-color);
}

.page-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px 0;
}

.subtitle {
  font-size: 15px;
  opacity: 0.65;
  margin: 0;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 11px;
  background: var(--main-color);
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s;
  flex-shrink: 0;
}

.btn-upload:hover { background: var(--main-color-dark); transform: translateY(-1px); }

/* Filters */
.filter-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-tab {
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid var(--menu-border);
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.filter-tab:hover { border-color: var(--main-color); color: var(--main-color); }
.filter-tab.active { background: var(--main-color); border-color: var(--main-color); color: #fff; }

/* States */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-height: 200px;
  justify-content: center;
  opacity: 0.6;
}

.empty-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 40px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  text-align: center;
}

.empty-icon { color: var(--main-color); opacity: 0.4; }
.empty-title { font-size: 17px; font-weight: 800; margin: 0; }
.empty-desc { font-size: 14px; opacity: 0.6; margin: 0; }

.spinner {
  width: 32px; height: 32px;
  border: 5px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-sm {
  width: 20px; height: 20px;
  border: 3px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Document list */
.doc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.doc-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  transition: border-color 0.18s;
}

.doc-row:hover { border-color: var(--main-color); }

/* File icon */
.doc-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-pdf   { background: color-mix(in srgb, #ef4444 12%, transparent); color: #ef4444; }
.icon-doc   { background: color-mix(in srgb, var(--main-color) 12%, transparent); color: var(--main-color); }
.icon-img   { background: color-mix(in srgb, #10b981 12%, transparent); color: #10b981; }
.icon-xls   { background: color-mix(in srgb, #16a34a 12%, transparent); color: #16a34a; }
.icon-file  { background: color-mix(in srgb, var(--text-color) 10%, transparent); color: var(--text-color); opacity: 0.7; }

/* Info */
.doc-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

.doc-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.doc-name {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

/* Classification badges */
.class-badge {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.7px;
  padding: 2px 8px; border-radius: 100px;
  flex-shrink: 0;
}

.class-public       { background: color-mix(in srgb, var(--good-color) 12%, transparent); color: var(--good-color); }
.class-internal     { background: color-mix(in srgb, var(--main-color) 12%, transparent); color: var(--main-color); }
.class-confidential { background: color-mix(in srgb, var(--error-color) 12%, transparent); color: var(--error-color); }

.version-badge {
  font-size: 10px; font-weight: 700;
  padding: 2px 7px; border-radius: 100px;
  background: var(--menu-border);
  color: var(--text-color);
  opacity: 0.75;
}

.doc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.meta-item {
  font-size: 12px;
  opacity: 0.55;
  display: flex;
  align-items: center;
  gap: 3px;
}

.meta-link { opacity: 0.7; color: var(--main-color); }

/* Actions */
.doc-actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

.action-btn {
  width: 34px; height: 34px;
  border-radius: 9px;
  border: 1px solid var(--menu-border);
  background: transparent;
  color: var(--text-color);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.action-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.action-preview:not(:disabled):hover  { background: color-mix(in srgb, var(--main-color) 15%, transparent); border-color: var(--main-color); color: var(--main-color); }
.action-download:not(:disabled):hover { background: var(--main-color); border-color: var(--main-color); color: #fff; }
.action-delete:not(:disabled):hover   { background: var(--error-color); border-color: var(--error-color); color: #fff; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  padding: 20px;
  color: var(--text-color);
}

.modal-box {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.modal-box--sm { max-width: 380px; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--menu-border);
}

.modal-header h3 { font-size: 16px; font-weight: 800; margin: 0; }

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.5;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  transition: opacity 0.15s;
}

.modal-close:hover { opacity: 1; }

.modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--menu-border);
}

/* Form */
.form-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text-color);
}

.form-input, .form-select {
  padding: 9px 13px;
  border-radius: 10px;
  border: 1px solid var(--menu-border);
  background: var(--bg-color);
  color: var(--text-color);
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.18s;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus { border-color: var(--main-color); }

/* File drop zone */
.file-drop {
  border: 2px dashed var(--menu-border);
  border-radius: 14px;
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: center;
  user-select: none;
}
.file-drop:hover,
.file-drop.is-dragging {
  border-color: var(--main-color);
  background: color-mix(in srgb, var(--main-color) 6%, transparent);
}
.file-drop.has-file {
  border-style: solid;
  padding: 14px 16px;
  cursor: default;
}
.drop-icon { color: var(--main-color); opacity: 0.55; pointer-events: none; }
.drop-hint-text { font-size: 14px; font-weight: 700; margin: 0; pointer-events: none; }
.drop-hint-sub  { font-size: 12px; opacity: 0.5; margin: 0; pointer-events: none; }

.file-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}
.file-ext-badge {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--main-color) 15%, transparent);
  color: var(--main-color);
  font-size: 9px; font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}
.file-name {
  font-size: 13px; font-weight: 700;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.file-size { font-size: 12px; opacity: 0.55; }
.file-remove {
  flex-shrink: 0;
  width: 28px; height: 28px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--menu-border);
  color: var(--text-color);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  opacity: 0.6;
  transition: opacity 0.15s, border-color 0.15s, color 0.15s;
}
.file-remove:hover { opacity: 1; border-color: var(--error-color); color: var(--error-color); }

.form-error   { font-size: 13px; color: var(--error-color); font-weight: 600; margin: 0; }
.form-success { font-size: 13px; color: var(--good-color); font-weight: 600; margin: 0; }

.btn-cancel {
  padding: 9px 18px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--menu-border);
  color: var(--text-color);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-cancel:hover { border-color: var(--main-color); color: var(--main-color); }

.btn-submit {
  padding: 9px 22px;
  border-radius: 10px;
  background: var(--main-color);
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, transform 0.12s;
}
.btn-submit:hover:not(:disabled) { background: var(--main-color-dark); transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

/* Code modal */
.code-loading { display: flex; align-items: center; gap: 10px; font-size: 14px; opacity: 0.7; }
.code-sent-msg { font-size: 13px; color: var(--good-color); font-weight: 700; margin: 0; }
.code-desc { font-size: 13px; opacity: 0.65; margin: 0; line-height: 1.5; }
.code-input { font-size: 18px; font-weight: 700; letter-spacing: 4px; text-align: center; }

/* Modal transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .doc-row { flex-wrap: wrap; }
  .doc-name { max-width: 200px; }
}

/* Preview modal */
.preview-overlay { align-items: stretch; padding: 20px; }
.preview-box {
  width: 100%;
  max-width: 960px;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}
.preview-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  border-radius: 10px;
  min-height: 300px;
}
.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  opacity: 0.6;
}
.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}
.preview-iframe {
  width: 100%;
  height: 100%;
  min-height: 520px;
  border: none;
  border-radius: 8px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--menu-border);
  margin-top: 16px;
}
.btn-open-new {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--main-color);
  border: 1.5px solid var(--main-color);
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-open-new:hover { background: color-mix(in srgb, var(--main-color) 20%, transparent); }
.btn-cancel {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1.5px solid var(--menu-border);
  background: transparent;
  color: var(--text-color);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-cancel:hover { border-color: var(--text-color); }
</style>
