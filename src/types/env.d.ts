/// <reference types="vite/client" />

import '@vue/runtime-core'
import 'vue';

// 1. Позволяет расширять глобальные компоненты (для кастомных UI-элементов)
declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        // Можно добавлять глобальные компоненты здесь
    }
}

// 2. Регистрация глобальных свойств, чтобы TypeScript не ругался на v-tooltip и аналоги
declare module 'vue' {
    interface ComponentCustomProperties {
        vTooltip: unknown;
    }
}

// 3. Дает TypeScript возможность "видеть" структуру .vue файлов
declare module '*.vue' {
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    export default component
}

// 4. Позволяет импортировать SVG-файлы
declare module '*.svg' {
    const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
    export default component
}

// 5. Описание переменных окружения для автодополнения (import.meta.env)
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}