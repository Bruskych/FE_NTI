/// <reference types="vite/client" />

// Позволяет TS понимать, что такое .vue файлы
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

// переменные из .env (например, URL бэкенда Laravel)
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}