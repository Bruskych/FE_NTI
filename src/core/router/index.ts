import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const SettingsView = () => import('@/views/settings/SettingsView.vue')
const ErrorView = () => import('@/views/ErrorView.vue')
const ProfileSettingsView = () => import('@/views/settings/ProfileSettingsView.vue')
const AdminView = () => import('@/views/admin/AdminView.vue')
const StudentAppsView = () => import('@/views/admin/StudentAppsView.vue')
const CompanyAppsView = () => import('@/views/admin/CompanyAppsView.vue')
const ForgotPasswordView = () => import('@/views/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/ResetPasswordView.vue')
const VerifyEmailView = () => import('@/views/VerifyEmailView.vue')

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
            meta: { requiresAuth: true, isWhitePage: true },
            children: [
                {
                    path: '',
                    redirect: { name: 'settings-profile' }
                },
                {
                    path: 'profile',
                    name: 'settings-profile',
                    component: ProfileSettingsView
                }
            ]
        },
        {
            path: '/admin',
            name: 'admin',
            component: AdminView,
            meta: { requiresAuth: true, requiresAdmin: true, isWhitePage: true },
            children: [
                {
                    path: '',
                    redirect: { name: 'admin-students' }
                },
                {
                    path: 'students',
                    name: 'admin-students',
                    component: StudentAppsView
                },
                {
                    path: 'companies',
                    name: 'admin-companies',
                    component: CompanyAppsView
                },
            ]
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: ForgotPasswordView,
            meta: { guestOnly: true }
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: ResetPasswordView,
            meta: { guestOnly: true }
        },
        {
            path: '/verify-email/:id/:hash',
            name: 'verify-email',
            component: VerifyEmailView
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