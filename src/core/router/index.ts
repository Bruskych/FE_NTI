import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const ErrorView = () => import('@/views/ErrorView.vue')

const router = createRouter({
    history: createWebHistory(), // Используем WebHistory для красивых URL без хэша
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { guestOnly: true }
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView,
            meta: { guestOnly: true }
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsView,
            meta: { requiresAuth: true, isWhitePage: true }
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('@/views/admin/AdminView.vue'),
            meta: { requiresAuth: true, requiresAdmin: true, isWhitePage: true },
            children: [
                {
                    path: 'students',
                    name: 'admin-students',
                    component: () => import('@/views/admin/StudentAppsView.vue')
                },
                {
                    path: 'companies',
                    name: 'admin-companies',
                    component: () => import('@/views/admin/CompanyAppsView.vue')
                },
            ]
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: () => import('@/views/ForgotPasswordView.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('@/views/ResetPasswordView.vue'),
            meta: { guestOnly: true }
        },
        {
            path: '/verify-email/:id/:hash',
            name: 'verify-email',
            component: () => import('@/views/VerifyEmailView.vue'),
            // Без guestOnly — авторизованный пользователь также должен иметь возможность верифицировать email
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: ErrorView
        }
    ]
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    if (authStore.token && !authStore.user) {
        try {
            await authStore.fetchMe()
        } catch (error) {
            console.error("Не удалось загрузить профиль при перезагрузке:", error)
            return next({ name: 'login' })
        }
    }
    const isAuthenticated = authStore.isAuthenticated

    // 1. ТОЛЬКО ДЛЯ ГОСТЕЙ (Страницы входа и регистрации)
    if (to.meta.guestOnly && isAuthenticated) {
        return next({ name: 'not-found' })
    }

    // 2. ТРЕБУЕТСЯ АВТОРИЗАЦИЯ
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: 'login' })
    }

    // 3. ПРОВЕРКА ПРАВ АДМИНИСТРАТОРА
    if (to.meta.requiresAdmin) {
        const isAdmin = authStore.hasAnyRole(['admin', 'super_admin'])

        if (!isAuthenticated || !isAdmin) {
            return next({
                name: 'not-found',
                query: {
                    reason: 'forbidden',
                    page: to.fullPath
                }
            })
        }
    }

    // Маршрут разрешен, продолжаем навигацию
    next()
})

export default router