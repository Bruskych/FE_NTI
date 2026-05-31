import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')
const ErrorView = () => import('@/views/ErrorView.vue')

const router = createRouter({
  history: createWebHistory(), // Рекомендую сменить на WebHistory для красоты
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
      meta: {requiresAuth: true, requiresAdmin: true, isWhitePage: true},
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
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: ErrorView
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  const isAuthenticated = authStore.isAuthenticated

  // 1. GUEST ONLY (login/register страницы)
  if (to.meta.guestOnly && isAuthenticated) {
    return next({ name: 'not-found' })
  }

  // 2. AUTH REQUIRED
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  // 3. ADMIN CHECK
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

  // OK
  next()
})

export default router