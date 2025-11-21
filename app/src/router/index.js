import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Application = () => import('../views/Application.vue')
const AdminDashboard = () => import('../views/AdminDashboard.vue')
const Pricing = () => import('../views/Pricing.vue')

/**
 * Route definitions for the application
 */
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Connexion - SoloText', requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { title: 'Inscription - SoloText', requiresGuest: true }
  },
  {
    path: '/application',
    name: 'Application',
    component: Application,
    meta: { title: 'Application - SoloText', requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { title: 'Tableau de bord Admin - SoloText', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/tarifs',
    name: 'Pricing',
    component: Pricing,
    meta: { title: 'Tarifs - SoloText' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

/**
 * Create and configure the Vue Router instance
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  strict: false,
})

/**
 * Navigation guard to normalize routes and check authentication
 */
router.beforeEach((to, from, next) => {
  if (to.path === '') {
    next('/login')
    return
  }

  // Utiliser le store d'authentification pour une vérification cohérente
  const { isAuthenticated, user } = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!isAuthenticated.value) {
      next('/login')
      return
    }
  }

  if (to.meta.requiresAdmin) {
    if (!isAuthenticated.value) {
      next('/login')
      return
    }
    if (user.value?.role !== 'admin') {
      next('/application')
      return
    }
  }

  if (to.meta.requiresGuest) {
    if (isAuthenticated.value) {
      next('/application')
      return
    }
  }

  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})

export default router

