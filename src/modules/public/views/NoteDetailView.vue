<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useNotesStore } from '../../../stores/notes.ts'

const route = useRoute()
const notesStore = useNotesStore()

const note = computed(() => notesStore.selectedNote)

function statusClass(status) {
    if (status === 'draft') {
        return 'bg-amber-100 text-amber-800 border border-amber-200'
    }

    if (status === 'published') {
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    }

    if (status === 'archived') {
        return 'bg-slate-200 text-slate-700 border border-slate-300'
    }

    return 'bg-slate-100 text-slate-700 border border-slate-200'
}

function formatDate(date) {
    if (!date) return '—'
    return new Date(date).toLocaleString('sk-SK')
}

function formatFileSize(size) {
    if (!size && size !== 0) return '—'

    const units = ['B', 'KB', 'MB', 'GB']
    let value = size
    let unitIndex = 0

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024
        unitIndex++
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`
}

async function openAttachment(publicId) {
    await notesStore.openAttachment(publicId)
}

onMounted(() => {
    notesStore.fetchNoteDetail(route.params.id)
})
</script>

<template>
    <div class="mx-auto max-w-6xl px-4 py-6">
        <RouterLink to="/notes" class="mb-6 inline-block text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Späť na poznámky
        </RouterLink>

        <p v-if="notesStore.loadingDetail" class="text-slate-600">Načítavam detail...</p>
        <p v-else-if="notesStore.error" class="text-red-600">{{ notesStore.error }}</p>

        <div v-else-if="note" class="space-y-6">
            <section class="rounded-2xl border bg-white p-6 shadow-sm">
                <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 class="mb-2 text-3xl font-bold text-slate-900">
                            {{ note.title }}
                        </h1>

                        <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span>
                                Autor:
                                <span class="font-medium text-slate-700">
                                    {{ note.user.first_name }} {{ note.user.last_name }}
                                </span>
                            </span>

                            <span>
                                Vytvorené: {{ formatDate(note.created_at) }}
                            </span>
                        </div>
                    </div>

                    <span class="rounded-full px-3 py-1 text-sm font-medium" :class="statusClass(note.status)">
                        {{ note.status }}
                    </span>
                </div>

                <div class="mb-4 flex flex-wrap gap-2">
                    <span v-for="category in note.categories" :key="category.id"
                        class="rounded-full px-3 py-1 text-xs font-semibold text-white"
                        :style="{ backgroundColor: category.color }">
                        {{ category.name }}
                    </span>
                </div>

                <div class="whitespace-pre-line leading-7 text-slate-700">
                    {{ note.body }}
                </div>
            </section>

            <section class="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 class="mb-4 text-xl font-semibold text-slate-900">Prílohy</h2>

                <div v-if="!note.attachments || note.attachments.length === 0" class="text-slate-500">
                    Poznámka nemá prílohy.
                </div>

                <div v-else class="space-y-3">
                    <div v-for="attachment in note.attachments" :key="attachment.public_id"
                        class="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div class="font-medium text-slate-900">
                                {{ attachment.original_name }}
                            </div>
                            <div class="text-sm text-slate-500">
                                {{ attachment.mime_type }} · {{ formatFileSize(attachment.size) }}
                            </div>
                        </div>

                        <button @click="openAttachment(attachment.public_id)"
                            class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                            Zobraziť súbor
                        </button>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 class="mb-4 text-xl font-semibold text-slate-900">Komentáre k poznámke</h2>

                <div v-if="!note.comments || note.comments.length === 0" class="text-slate-500">
                    K poznámke nie sú komentáre.
                </div>

                <div v-else class="space-y-4">
                    <div v-for="comment in note.comments" :key="comment.id" class="rounded-xl border p-4">
                        <div class="mb-2 text-sm text-slate-500">
                            <span class="font-medium text-slate-700">
                                {{ comment.user.first_name }} {{ comment.user.last_name }}
                            </span>
                            · {{ formatDate(comment.created_at) }}
                        </div>

                        <p class="whitespace-pre-line text-slate-700">
                            {{ comment.body }}
                        </p>
                    </div>
                </div>
            </section>

            <section class="rounded-2xl border bg-white p-6 shadow-sm">
                <h2 class="mb-4 text-xl font-semibold text-slate-900">Úlohy</h2>

                <div v-if="!note.tasks || note.tasks.length === 0" class="text-slate-500">
                    Poznámka nemá úlohy.
                </div>

                <div v-else class="space-y-4">
                    <div v-for="task in note.tasks" :key="task.id" class="rounded-xl border p-4">
                        <div class="mb-2 flex items-center justify-between gap-3">
                            <h3 class="font-semibold text-slate-900">
                                {{ task.title }}
                            </h3>

                            <span class="rounded-full px-3 py-1 text-xs font-medium" :class="task.is_done
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'">
                                {{ task.is_done ? 'hotová' : 'rozpracovaná' }}
                            </span>
                        </div>

                        <div class="mb-3 text-sm text-slate-500">
                            Termín: {{ task.due_at ? formatDate(task.due_at) : 'bez termínu' }}
                        </div>

                        <div class="space-y-2">
                            <div class="text-sm font-medium text-slate-700">
                                Komentáre k úlohe
                            </div>

                            <div v-if="!task.comments || task.comments.length === 0" class="text-sm text-slate-500">
                                Bez komentárov.
                            </div>

                            <div v-else v-for="taskComment in task.comments" :key="taskComment.id"
                                class="rounded-lg bg-slate-50 p-3">
                                <div class="mb-1 text-xs text-slate-500">
                                    <span class="font-medium text-slate-700">
                                        {{ taskComment.user.first_name }} {{ taskComment.user.last_name }}
                                    </span>
                                    · {{ formatDate(taskComment.created_at) }}
                                </div>

                                <p class="text-sm text-slate-700">
                                    {{ taskComment.body }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>