<template>
  <nav class="nav">
    <div class="nav-left">
      <router-link to="/" class="logo-link" aria-label="Accueil SoloText">
        <h1 class="logo">Solo<span class="logo-text">Text</span></h1>
      </router-link>
    </div>

    <!-- Bouton Menu Mobile avec texte -->
    <button
      class="menu-toggle"
      :aria-expanded="isMobileOpen ? 'true' : 'false'"
      aria-controls="primary-navigation"
      @click="toggleMobile"
    >
      <span class="menu-text">Menu</span>
      <div class="menu-icon">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </button>

    <div class="nav-links" :class="{ open: isMobileOpen }" id="primary-navigation">
      <router-link to="/fonctionnalites" class="nav-link" @click="closeMobile">Fonctionnalités</router-link>
      <router-link to="/blog" class="nav-link" @click="closeMobile">Blog</router-link>
      <router-link to="/tarifs" class="nav-link" @click="closeMobile">Tarifs</router-link>

      <template v-if="!isAuthenticated">
        <a :href="appLoginUrl" class="btn btn-outline btn-pill" @click="closeMobile">Connexion</a>
        <a :href="appRegisterUrl" class="btn btn-primary btn-pill" @click="closeMobile">Rejoindre l'aventure</a>
      </template>
      <template v-else>
        <a :href="appApplicationUrl" class="nav-link app-link" @click="closeMobile">Application</a>
        <button @click="handleLogoutClick" class="btn btn-outline btn-pill">Déconnexion</button>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore.js'
import { useNotifications } from '../../composables/useNotifications.js'

const router = useRouter()
const { isAuthenticated, user, logout } = useAuthStore()
const { success } = useNotifications()
const isMobileOpen = ref(false)

// URLs vers l'application
const appBaseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8090'
const appLoginUrl = computed(() => `${appBaseUrl}/login`)
const appRegisterUrl = computed(() => `${appBaseUrl}/register`)
const appApplicationUrl = computed(() => `${appBaseUrl}/application`)

const handleLogoutClick = async () => {
  closeMobile()
  const userName = user.value?.displayName || 'Utilisateur'
  await logout()
  success(`Au revoir ${userName} ! Vous avez été déconnecté.`)
  router.push('/')
}

const toggleMobile = () => { isMobileOpen.value = !isMobileOpen.value }
const closeMobile = () => { isMobileOpen.value = false }

const onKeydown = (e) => {
  if (e.key === 'Escape') closeMobile()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.nav {
  max-width: 1200px;
  margin: 16px auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 96px;
  /* On retire position: relative ici pour laisser les enfants gérer le z-index globalement si besoin, 
     mais pour le contexte actuel, on va gérer les z-index des enfants explicitement */
}

.nav-left { 
  flex-shrink: 0; 
  position: relative;
  z-index: 1002; /* Au-dessus du menu mobile */
}

.logo-link {
  text-decoration: none;
  color: #ffffff;
  display: flex;
  align-items: center;
}

.logo {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1;
}

.logo-text {
  color: #031815;
}

/* Menu Toggle Button */
.menu-toggle {
  display: none; /* Caché sur desktop */
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1002; /* Au-dessus du menu mobile */
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu-text {
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-icon {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 18px;
}

.menu-icon span {
  display: block;
  width: 100%;
  height: 2px;
  background: #ffffff;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Animation Burger */
.menu-toggle[aria-expanded="true"] .menu-icon span:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.menu-toggle[aria-expanded="true"] .menu-icon span:nth-child(2) {
  opacity: 0;
}
.menu-toggle[aria-expanded="true"] .menu-icon span:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* Navigation Links - Desktop */
.nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.nav-link {
  text-decoration: none;
  color: #ffffff;
  font-weight: 500;
  font-size: 20px;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  padding: 0.5rem 0;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover { color: #031815; }

.app-link {
  color: #ffffff;
  font-weight: 500;
  font-size: 20px;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: color 0.3s ease;
}

.app-link:hover { color: #031815; }

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.8rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  min-width: 120px;
}

.btn-pill { border-radius: 9999px; }

.btn-outline { color: #ffffff; border-color: rgba(255,255,255,0.7); background: transparent; }
.btn-outline:hover { background: #667eea; color: white; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }

.btn-primary { background: var(--gradient-btn); color: white; border-color: transparent; }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); }

/* Responsive Design */
@media (max-width: 960px) {
  .nav { 
    padding: 0 1.5rem;
  }

  .menu-toggle { 
    display: flex; 
  }

  /* Mobile Menu Overlay - Slide Down */
  .nav-links {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #32c4c0;
    padding: 110px 2rem 40px; /* Espace pour le header */
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 2rem;
    transform: translateY(-100%); /* Départ du haut */
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1001; /* Sous le logo/bouton (1002) mais au-dessus du reste */
    overflow-y: auto;
  }

  .nav-links.open {
    transform: translateY(0);
  }

  .nav-link {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffffff;
    padding: 0.5rem 0;
  }
  
  .nav-link:hover {
    opacity: 0.8;
  }

  .btn {
    width: 100%;
    max-width: 300px;
    padding: 1rem;
    font-size: 1.1rem;
  }
  
  .btn-outline {
    border-color: #ffffff;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .nav { padding: 0 1rem; }
  .logo { font-size: 1.8rem; }
  .menu-text { display: none; } /* Optionnel : cacher le texte sur très petits écrans */
}
</style>


