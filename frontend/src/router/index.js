import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Application = () => import('../views/Application.vue')
const AdminDashboard = () => import('../views/AdminDashboard.vue')
const Features = () => import('../views/Features.vue')
const Pricing = () => import('../views/Pricing.vue')
const PublicLayout = () => import('../components/layouts/PublicLayout.vue')

/**
 * Route definitions for the application
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Accueil - SoloText' }
  },
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: 'fonctionnalites',
        name: 'Features',
        component: Features,
        meta: { title: 'Fonctionnalités - SoloText' }
      },
      {
        path: 'tarifs',
        name: 'Pricing',
        component: Pricing,
        meta: { title: 'Tarifs - SoloText' }
      }
    ]
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
  { path: '/:pathMatch(.*)*', redirect: '/' }
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
    next('/')
    return
  }

  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }

  if (to.meta.requiresAdmin) {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role !== 'admin') {
      next('/application')
      return
    }
  }

  if (to.meta.requiresGuest) {
    const token = localStorage.getItem('token')
    if (token) {
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

