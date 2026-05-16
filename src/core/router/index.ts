import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth" // Твой стор

const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const RegisterView = () => import('@/views/RegisterView.vue')

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
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Логика: если страница только для гостей, а пользователь УЖЕ залогинен - выкидываем его на главную
  if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'home' })
  } else {
    // В остальных случаях — разрешаем переход
    next()
  }
})

export default router