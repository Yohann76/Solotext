import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const Features = () => import('../views/Features.vue')
const Pricing = () => import('../views/Pricing.vue')
const PublicLayout = () => import('../components/layouts/PublicLayout.vue')

/**
 * Route definitions for the website
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
 * Navigation guard to set page title
 */
router.beforeEach((to, from, next) => {
  if (to.path === '') {
    next('/')
    return
  }

  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})

export default router

