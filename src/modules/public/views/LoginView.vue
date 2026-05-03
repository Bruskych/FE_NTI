<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/auth.ts'

const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

async function handleLogin() {
    try {
        await authStore.login(email.value, password.value)
        await authStore.fetchMe()
        router.push('/notes')
    } catch (_) {
        // chyba je už uložená v store
    }
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow">
            <h1 class="mb-6 text-2xl font-bold text-slate-900">Prihlásenie</h1>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">Email</label>
                    <input v-model="email" type="email"
                        class="w-full rounded-xl border px-3 py-2 outline-none focus:ring" placeholder="zadaj email" />
                </div>

                <div>
                    <label class="mb-1 block text-sm font-medium text-slate-700">Heslo</label>
                    <input v-model="password" type="password"
                        class="w-full rounded-xl border px-3 py-2 outline-none focus:ring" placeholder="zadaj heslo" />
                </div>

                <p v-if="authStore.error" class="text-sm text-red-600">
                    {{ authStore.error }}
                </p>

                <button type="submit" :disabled="authStore.loading"
                    class="w-full rounded-xl bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60">
                    {{ authStore.loading ? 'Prihlasujem...' : 'Prihlásiť sa' }}
                </button>
            </form>
        </div>
    </div>
</template>