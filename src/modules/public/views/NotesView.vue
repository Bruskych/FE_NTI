<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useNotesStore } from '../../../stores/notes.ts'
import AppPagination from '../components/AppPagination.vue'

const notesStore = useNotesStore()

function loadPage(page) {
    notesStore.fetchAllNotes(page)
}

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

onMounted(() => {
    loadPage(1)
})
</script>

<template>
    <div class="mx-auto max-w-7xl px-4 py-6">
        <div class="mb-6">
            <h1 class="text-2xl font-bold text-slate-900">Všetky poznámky</h1>
            <p class="text-sm text-slate-600">
                Nástenka všetkých publikovaných a archivovaných poznámok
            </p>
        </div>

        <p v-if="notesStore.loadingAll" class="text-slate-600">Načítavam...</p>
        <p v-else-if="notesStore.error" class="text-red-600">{{ notesStore.error }}</p>

        <div v-else class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <RouterLink v-for="note in notesStore.notes" :key="note.id" :to="`/notes/${note.id}`"
                class="block rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div class="mb-3 flex items-start justify-between gap-3">
                    <h2 class="line-clamp-2 text-lg font-semibold text-slate-900">
                        {{ note.title }}
                    </h2>

                    <span class="shrink-0 rounded-full px-3 py-1 text-xs font-medium" :class="statusClass(note.status)">
                        {{ note.status }}
                    </span>
                </div>

                <p class="mb-4 line-clamp-4 text-sm leading-6 text-slate-700">
                    {{ note.body }}
                </p>

                <div class="space-y-2 text-sm text-slate-500">
                    <div>
                        Autor:
                        <span class="font-medium text-slate-700">
                            {{ note.user.first_name }} {{ note.user.last_name }}
                        </span>
                    </div>

                    <div class="flex flex-wrap gap-2">
                        <span v-for="category in note.categories" :key="category.id"
                            class="rounded-full px-2 py-1 text-xs font-medium text-white"
                            :style="{ backgroundColor: category.color }">
                            {{ category.name }}
                        </span>
                    </div>
                </div>
            </RouterLink>
        </div>

        <AppPagination v-if="notesStore.paginationAll" :pagination="notesStore.paginationAll" @change="loadPage" />
    </div>
</template>