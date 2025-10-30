import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Application from '../views/Application.vue'
import AdminDashboard from '../views/AdminDashboard.vue'

/**
 * Route definitions for the application
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Accueil - SoloText'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: 'Connexion - SoloText',
      requiresGuest: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: 'Inscription - SoloText',
      requiresGuest: true
    }
  },
  {
    path: '/application',
    name: 'Application',
    component: Application,
    meta: {
      title: 'Application - SoloText',
      requiresAuth: true
    }
  },
  {
    path: '/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: {
      title: 'Tableau de bord Admin - SoloText',
      requiresAuth: true,
      requiresAdmin: true
    }
  }
]

/**
 * Create and configure the Vue Router instance
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  // S'assurer que '/' fonctionne avec ou sans slash final
  strict: false,
})

/**
 * Navigation guard to normalize routes and check authentication
 * - Normalizes '/' route (with or without trailing slash)
 * - Removes trailing slashes from other routes
 * - Checks authentication requirements
 * - Checks admin role requirements
 */
router.beforeEach((to, from, next) => {
  // Normaliser uniquement si le path est vide vers '/'
  // Avec strict: false, Vue Router gère automatiquement la normalisation des trailing slashes
  if (to.path === '') {
    next('/')
    return
  }

  // Vérifier si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }

  // Vérifier si la route nécessite des droits admin
  if (to.meta.requiresAdmin) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'admin') {
      next('/application')
      return
    }
  }

  // Vérifier si la route nécessite d'être un invité (non authentifié)
  if (to.meta.requiresGuest) {
    const token = localStorage.getItem('token')
    if (token) {
      next('/application')
      return
    }
  }

  // Mettre à jour le titre de la page
  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})

export default router

