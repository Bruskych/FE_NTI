import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const HomeView = () => import('@/views/HomeView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const CallsView = () => import('@/views/CallsView.vue')
const TeamView = () => import('@/views/TeamView.vue')
const ApplicationsView = () => import('@/views/ApplicationsView.vue')
const ProjectView = () => import('@/views/ProjectView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const SettingsView = () => import('@/views/settings/SettingsView.vue')
const ErrorView = () => import('@/views/ErrorView.vue')
const ProfileSettingsView = () => import('@/views/settings/ProfileSettingsView.vue')
const NotificationSettingsView = () => import('@/views/settings/NotificationSettingsView.vue')
const GdprSettingsView = () => import('@/views/settings/GdprSettingsView.vue')
const AdminView = () => import('@/views/admin/AdminView.vue')
const StudentAppsView = () => import('@/views/admin/StudentAppsView.vue')
const CompanyAppsView = () => import('@/views/admin/CompanyAppsView.vue')
const CallsAdminView = () => import('@/views/admin/CallsAdminView.vue')
const BulkMessagesView = () => import('@/views/admin/BulkMessagesView.vue')
const ExportsView = () => import('@/views/admin/ExportsView.vue')
const EmailTemplatesView = () => import('@/views/admin/EmailTemplatesView.vue')
const AdminGdprView = () => import('@/views/admin/AdminGdprView.vue')
const CmsView = () => import('@/views/CmsView.vue')
const ForgotPasswordView = () => import('@/views/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/ResetPasswordView.vue')
const VerifyEmailView = () => import('@/views/VerifyEmailView.vue')
const ChallengesView = () => import('@/views/ChallengesView.vue')
const OrganizationView = () => import('@/views/OrganizationView.vue')
const MentorshipsView = () => import('@/views/MentorshipsView.vue')
const DocumentsView = () => import('@/views/DocumentsView.vue')
const ConsultationsView = () => import('@/views/ConsultationsView.vue')
const EvaluationsView = () => import('@/views/EvaluationsView.vue')

const router = createRouter({
    history: createWebHistory(), // Используем WebHistory для красивых URL без хэша
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardView,
            meta: { requiresAuth: true }
        },
        {
            path: '/calls',
            name: 'calls',
            component: CallsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/project',
            name: 'project',
            component: ProjectView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'company', 'evaluator', 'content_editor'] }
        },
        {
            path: '/applications',
            name: 'applications',
            component: ApplicationsView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'company', 'mentor', 'evaluator', 'content_editor', 'admin', 'super_admin'] }
        },
        {
            path: '/team',
            name: 'team',
            component: TeamView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'company', 'mentor', 'evaluator', 'content_editor', 'admin', 'super_admin'] }
        },
        {
            path: '/challenges',
            name: 'challenges',
            component: ChallengesView,
            meta: { requiresAuth: true, blockRoles: ['visitor'] }
        },
        {
            path: '/organization',
            name: 'organization',
            component: OrganizationView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'student', 'team_leader', 'mentor', 'evaluator', 'content_editor'] }
        },
        {
            path: '/mentorships',
            name: 'mentorships',
            component: MentorshipsView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'student', 'team_leader', 'company', 'evaluator', 'content_editor'] }
        },
        {
            path: '/documents',
            name: 'documents',
            component: DocumentsView,
            meta: { requiresAuth: true, blockRoles: ['visitor'] }
        },
        {
            path: '/consultations',
            name: 'consultations',
            component: ConsultationsView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'company', 'evaluator', 'content_editor'] }
        },
        {
            path: '/evaluations',
            name: 'evaluations',
            component: EvaluationsView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'student', 'team_leader', 'company', 'mentor', 'content_editor'] }
        },
        {
            path: '/cms',
            name: 'cms',
            component: CmsView,
            meta: { requiresAuth: true, blockRoles: ['visitor', 'student', 'team_leader', 'company', 'mentor', 'evaluator'] }
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
            meta: { requiresAuth: true, isWhitePage: true, blockRoles: ['visitor'] },
            children: [
                {
                    path: '',
                    redirect: { name: 'settings-profile' }
                },
                {
                    path: 'profile',
                    name: 'settings-profile',
                    component: ProfileSettingsView
                },
                {
                    path: 'notifications',
                    name: 'settings-notifications',
                    component: NotificationSettingsView
                },
                {
                    path: 'gdpr',
                    name: 'settings-gdpr',
                    component: GdprSettingsView
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
                {
                    path: 'calls',
                    name: 'admin-calls',
                    component: CallsAdminView
                },
                {
                    path: 'bulk-messages',
                    name: 'admin-bulk-messages',
                    component: BulkMessagesView
                },
                {
                    path: 'exports',
                    name: 'admin-exports',
                    component: ExportsView
                },
                {
                    path: 'email-templates',
                    name: 'admin-email-templates',
                    component: EmailTemplatesView
                },
                {
                    path: 'gdpr',
                    name: 'admin-gdpr',
                    component: AdminGdprView
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
    const blockRoles = to.meta.blockRoles as string[] | undefined

    // ЗАПРЕТ НА КОНКРЕТНУЮ РОЛЬ
    if (blockRoles?.length) {
        const userRole = authStore.user?.roles?.[0]?.name
        if (userRole && blockRoles.includes(userRole)) {
            return next({ name: 'home' })
        }
    }

    // ТОЛЬКО ДЛЯ ГОСТЕЙ (Страницы входа и регистрации)
    if (to.meta.guestOnly && isAuthenticated) {
        return next({ name: 'not-found' })
    }

    // ТРЕБУЕТСЯ АВТОРИЗАЦИЯ
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: 'login' })
    }

    // ПРОВЕРКА ПРАВ АДМИНИСТРАТОРА
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