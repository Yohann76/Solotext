import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Register from './views/Register.vue'
import Application from './views/Application.vue'
import AdminDashboard from './views/AdminDashboard.vue'
import './style.css'
import './assets/highlight.css'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/application', component: Application },
  { path: '/dashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Garde de navigation pour vérifier l'authentification et les rôles
router.beforeEach((to, from, next) => {
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

  next()
})

const app = createApp(App)
app.use(router)
app.mount('#app')
