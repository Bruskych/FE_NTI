<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useApplicationsStore } from '@/stores/applications'
import type { ApplicationDetail, SubmitEvaluationPayload } from '@/stores/applications'

const { t } = useI18n()
const appsStore = useApplicationsStore()

const evalApps = computed(() =>
  appsStore.applications.filter(a => a.status === 'in_evaluation')
)

// Evaluation modal state
const showModal = ref(false)
const modalLoading = ref(false)
const modalError = ref<string | null>(null)
const submitLoading = ref(false)
const detail = ref<ApplicationDetail | null>(null)

// Form
const recommendation = ref<'approve' | 'reject'>('approve')
const generalComment = ref('')
const scores = ref<{ criteria_id: number; score: number; comment: string }[]>([])

const formatDate = (d: string | null) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function openModal(appId: number) {
  detail.value = null
  modalError.value = null
  recommendation.value = 'approve'
  generalComment.value = ''
  scores.value = []
  showModal.value = true
  modalLoading.value = true
  try {
    const d = await appsStore.fetchApplicationDetail(appId)
    detail.value = d
    const criteria = d.call?.evaluation_template?.criteria ?? []
    scores.value = criteria.map(c => ({ criteria_id: c.id, score: 5, comment: '' }))
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    modalError.value = e.response?.data?.message ?? t('evaluations.error_load')
  } finally {
    modalLoading.value = false
  }
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  if (!detail.value) return
  modalError.value = null
  submitLoading.value = true
  try {
    const payload: SubmitEvaluationPayload = {
      recommendation: recommendation.value,
      comment: generalComment.value.trim() || null,
      scores: scores.value.map(s => ({
        criteria_id: s.criteria_id,
        score: s.score,
        comment: s.comment.trim() || null,
      })),
    }
    await appsStore.submitEvaluation(detail.value.id, payload)
    showModal.value = false
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    modalError.value = e.response?.data?.message ?? t('evaluations.error_submit')
  } finally {
    submitLoading.value = false
  }
}

onMounted(async () => {
  if (appsStore.applications.length === 0) await appsStore.fetchApplications()
})
</script>

<template>
  <div class="eval-page">
    <div class="page-inner">

      <div class="page-header">
        <div>
          <h1>{{ $t('evaluations.title') }}</h1>
          <p class="subtitle">{{ $t('evaluations.subtitle') }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="appsStore.loading" class="state-box">
        <div class="spinner"></div>
        <p>{{ $t('evaluations.loading') }}</p>
      </div>

      <!-- Empty -->
      <div v-else-if="evalApps.length === 0" class="empty-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <p class="empty-title">{{ $t('evaluations.empty') }}</p>
        <p class="empty-desc">{{ $t('evaluations.empty_desc') }}</p>
      </div>

      <!-- List -->
      <div v-else class="eval-list">
        <div
          v-for="app in evalApps"
          :key="app.id"
          class="eval-card"
          :class="{ 'is-evaluated': appsStore.evaluatedIds.has(app.id) }"
        >
          <div class="eval-card-left">
            <div class="app-id">#{{ app.id }}</div>
            <div class="app-tags">
              <span v-if="app.is_program_a" class="tag tag-a">{{ $t('evaluations.type_a') }}</span>
              <span v-if="app.is_program_b" class="tag tag-b">{{ $t('evaluations.type_b') }}</span>
            </div>
          </div>

          <div class="eval-card-body">
            <div class="meta-row">
              <div v-if="app.call" class="meta-item">
                <span class="meta-label">{{ $t('evaluations.call') }}</span>
                <span class="meta-value">{{ app.call.title }}</span>
              </div>
              <div v-if="app.team" class="meta-item">
                <span class="meta-label">{{ $t('evaluations.team') }}</span>
                <span class="meta-value">{{ app.team.name }}</span>
              </div>
              <div v-if="app.submitted_at" class="meta-item">
                <span class="meta-label">{{ $t('evaluations.submitted') }}</span>
                <span class="meta-value">{{ formatDate(app.submitted_at) }}</span>
              </div>
              <div v-if="app.total_score" class="meta-item">
                <span class="meta-label">Score</span>
                <span class="meta-value score-val">{{ app.total_score }}</span>
              </div>
            </div>
          </div>

          <div class="eval-card-action">
            <button
              v-if="!appsStore.evaluatedIds.has(app.id)"
              class="btn btn-evaluate"
              @click="openModal(app.id)"
            >
              {{ $t('evaluations.btn_evaluate') }}
            </button>
            <span v-else class="evaluated-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ $t('evaluations.btn_evaluated') }}
            </span>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">

          <div class="modal-header">
            <h3>{{ $t('evaluations.modal_title') }}
              <span v-if="detail" class="modal-app-id">#{{ detail.id }}</span>
            </h3>
            <button class="modal-close" @click="closeModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Loading detail -->
          <div v-if="modalLoading" class="modal-loading">
            <div class="spinner"></div>
            <p>{{ $t('evaluations.modal_loading') }}</p>
          </div>

          <!-- Error -->
          <div v-else-if="modalError && !detail" class="modal-error">
            {{ modalError }}
          </div>

          <!-- Form -->
          <template v-else-if="detail">
            <div class="modal-body">

              <!-- Recommendation -->
              <div class="form-section">
                <p class="section-label">{{ $t('evaluations.recommendation') }}</p>
                <div class="rec-row">
                  <label class="rec-btn" :class="{ active: recommendation === 'approve', 'rec-approve': true }">
                    <input type="radio" value="approve" v-model="recommendation" hidden />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {{ $t('evaluations.rec_approve') }}
                  </label>
                  <label class="rec-btn" :class="{ active: recommendation === 'reject', 'rec-reject': true }">
                    <input type="radio" value="reject" v-model="recommendation" hidden />
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    {{ $t('evaluations.rec_reject') }}
                  </label>
                </div>
              </div>

              <!-- General comment -->
              <div class="form-section">
                <p class="section-label">{{ $t('evaluations.comment') }}</p>
                <textarea
                  v-model="generalComment"
                  class="form-textarea"
                  rows="3"
                  :placeholder="$t('evaluations.comment_placeholder')"
                ></textarea>
              </div>

              <!-- Criteria scores -->
              <div class="form-section">
                <p class="section-label">{{ $t('evaluations.scores_title') }}</p>

                <div v-if="scores.length === 0" class="no-criteria">
                  {{ $t('evaluations.modal_no_criteria') }}
                </div>

                <div v-else class="criteria-list">
                  <div v-for="(score, idx) in scores" :key="score.criteria_id" class="criterion-row">
                    <div class="criterion-header">
                      <div class="criterion-meta">
                        <span class="criterion-name">
                          {{ detail.call?.evaluation_template?.criteria[idx]?.name ?? `Criterion ${idx + 1}` }}
                        </span>
                        <span v-if="detail.call?.evaluation_template?.criteria[idx]?.description" class="criterion-desc">
                          {{ detail.call?.evaluation_template?.criteria[idx]?.description }}
                        </span>
                      </div>
                      <div class="score-display">
                        <span class="score-val">{{ score.score }}</span>
                        <span class="score-max">{{ $t('evaluations.score_out_of') }}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      v-model.number="score.score"
                      class="score-slider"
                    />
                    <input
                      type="text"
                      v-model="score.comment"
                      class="form-input"
                      :placeholder="$t('evaluations.score_comment_placeholder')"
                    />
                  </div>
                </div>
              </div>

              <!-- Submit error -->
              <p v-if="modalError" class="form-error">{{ modalError }}</p>

            </div>

            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal" :disabled="submitLoading">
                {{ $t('evaluations.cancel') }}
              </button>
              <button
                class="btn btn-primary"
                :disabled="submitLoading || scores.length === 0"
                @click="handleSubmit"
              >
                {{ submitLoading ? '…' : $t('evaluations.submit') }}
              </button>
            </div>
          </template>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.eval-page {
  font-family: var(--font-main), sans-serif;
  background: var(--bg-color);
  min-height: calc(100vh - 75px);
  color: var(--text-color);
}

.page-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header h1 {
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 6px;
}
.subtitle { font-size: 15px; opacity: 0.65; margin: 0; }

/* STATES */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  min-height: 240px;
  justify-content: center;
  opacity: 0.6;
}
.spinner {
  width: 32px; height: 32px;
  border: 5px solid var(--menu-border);
  border-top-color: var(--main-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

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
.empty-desc  { font-size: 14px; opacity: 0.6; margin: 0; }

/* LIST */
.eval-list { display: flex; flex-direction: column; gap: 12px; }

.eval-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 14px;
  transition: border-color 0.2s;
}
.eval-card:hover { border-color: var(--main-color); }
.eval-card.is-evaluated { opacity: 0.65; }

.eval-card-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 60px;
}
.app-id {
  font-size: 13px;
  font-weight: 800;
  opacity: 0.45;
}
.app-tags { display: flex; flex-direction: column; gap: 4px; align-items: center; }
.tag {
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 2px 8px;
  border-radius: 100px;
}
.tag-a { background: color-mix(in srgb, var(--main-color) 15%, transparent); color: var(--main-color-dark); }
.tag-b { background: color-mix(in srgb, #8b5cf6 15%, transparent); color: #8b5cf6; }

.eval-card-body { flex: 1; min-width: 0; }
.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}
.meta-item { display: flex; flex-direction: column; gap: 1px; }
.meta-label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0.45; }
.meta-value { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.score-val { color: var(--main-color); }

.eval-card-action { flex-shrink: 0; }

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  border-radius: 10px;
  border: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s, transform 0.15s;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):hover { transform: translateY(-1px); }
.btn-evaluate { background: var(--main-color); color: #fff; padding: 8px 18px; }
.btn-primary   { background: var(--main-color); color: #fff; }
.btn-secondary {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  color: var(--text-color);
}

.evaluated-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: var(--good-color);
  opacity: 0.9;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 999;
  padding: 40px 20px;
  overflow-y: auto;
}
.modal {
  background: var(--menu-color);
  border: 1px solid var(--menu-border);
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px 20px;
  border-bottom: 1px solid var(--menu-border);
  gap: 12px;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-app-id { font-size: 15px; opacity: 0.4; font-weight: 700; }
.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.5;
  padding: 4px;
  display: flex;
  transition: opacity 0.15s;
}
.modal-close:hover { opacity: 1; }

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  opacity: 0.6;
}
.modal-error {
  padding: 28px;
  color: var(--error-color);
  font-size: 14px;
  font-weight: 600;
}

.modal-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.form-section { display: flex; flex-direction: column; gap: 10px; }
.section-label {
  font-size: 11.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  opacity: 0.55;
  margin: 0;
}

/* Recommendation */
.rec-row { display: flex; gap: 10px; }
.rec-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 2px solid var(--menu-border);
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: border-color 0.18s, background 0.18s, color 0.18s;
  color: var(--text-color);
}
.rec-approve.active {
  border-color: var(--good-color);
  background: color-mix(in srgb, var(--good-color) 12%, transparent);
  color: var(--good-color);
}
.rec-reject.active {
  border-color: var(--error-color);
  background: color-mix(in srgb, var(--error-color) 12%, transparent);
  color: var(--error-color);
}
.rec-btn:not(.active):hover { border-color: var(--main-color); }

/* Textarea / Input */
.form-textarea, .form-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-color);
  border: 1px solid var(--menu-border);
  border-radius: 10px;
  color: var(--text-color);
  font-family: var(--font-main), sans-serif;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.18s;
}
.form-textarea:focus, .form-input:focus {
  outline: none;
  border-color: var(--main-color);
}
.form-input { resize: none; }

/* Criteria */
.no-criteria { font-size: 14px; opacity: 0.55; padding: 8px 0; }
.criteria-list { display: flex; flex-direction: column; gap: 18px; }
.criterion-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: var(--bg-color);
  border-radius: 12px;
  border: 1px solid var(--menu-border);
}
.criterion-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.criterion-meta { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.criterion-name { font-size: 14px; font-weight: 700; }
.criterion-desc { font-size: 12px; opacity: 0.55; line-height: 1.4; }

.score-display {
  display: flex;
  align-items: baseline;
  gap: 3px;
  flex-shrink: 0;
}
.score-val { font-size: 22px; font-weight: 800; color: var(--main-color); line-height: 1; }
.score-max { font-size: 13px; opacity: 0.45; }

.score-slider {
  width: 100%;
  accent-color: var(--main-color);
  cursor: pointer;
}

.form-error {
  font-size: 13px;
  color: var(--error-color);
  font-weight: 600;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 18px 28px;
  border-top: 1px solid var(--menu-border);
  background: var(--bg-color);
}

@media (max-width: 640px) {
  .page-inner { padding: 32px 20px; }
  .eval-card { flex-wrap: wrap; }
  .eval-card-left { flex-direction: row; min-width: auto; }
  .meta-row { gap: 10px 16px; }
  .modal-overlay { padding: 20px 12px; }
  .modal-body { padding: 20px 18px; }
  .modal-header, .modal-footer { padding: 18px; }
}
</style>
