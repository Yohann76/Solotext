<template>
  <header class="header" :class="{ scrolled: hasScrolled }">
    <nav class="nav">
      <div class="nav-left">
        <router-link to="/" class="logo-link" aria-label="Accueil SoloText">
          <h1 class="logo">SoloText</h1>
        </router-link>
      </div>

      <button
        class="burger"
        :aria-expanded="isMobileOpen ? 'true' : 'false'"
        aria-controls="primary-navigation"
        aria-label="Ouvrir le menu"
        @click="toggleMobile"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <div class="nav-links" :class="{ open: isMobileOpen }" id="primary-navigation">
        <router-link to="/fonctionnalites" class="nav-link" @click="closeMobile">Fonctionnalités</router-link>
        <router-link to="/tarifs" class="nav-link" @click="closeMobile">Tarifs</router-link>

        <template v-if="!isAuthenticated">
          <router-link to="/login" class="btn btn-outline btn-pill" @click="closeMobile">Connexion</router-link>
          <router-link to="/register" class="btn btn-primary btn-pill" @click="closeMobile">Rejoindre l'aventure</router-link>
        </template>
        <template v-else>
          <router-link to="/application" class="nav-link app-link" @click="closeMobile">Application</router-link>
          <UserIndicator @logout="handleLogout" />
        </template>
      </div>
    </nav>
  </header>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import UserIndicator from './UserIndicator.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useNotifications } from '../composables/useNotifications.js'

export default {
  name: 'CommonHeader',
  components: {
    UserIndicator
  },
  setup() {
    const router = useRouter()
    const { isAuthenticated, user, logout } = useAuthStore()
    const { success } = useNotifications()
    const isMobileOpen = ref(false)
    const hasScrolled = ref(false)

    const handleLogout = async () => {
      const userName = user.value?.displayName || 'Utilisateur'
      await logout()
      success(`Au revoir ${userName} ! Vous avez été déconnecté.`)
    }

    const toggleMobile = () => { isMobileOpen.value = !isMobileOpen.value }
    const closeMobile = () => { isMobileOpen.value = false }

    const onKeydown = (e) => {
      if (e.key === 'Escape') closeMobile()
    }

    const onScroll = () => {
      hasScrolled.value = window.scrollY > 8
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeydown)
      window.addEventListener('scroll', onScroll, { passive: true })
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('scroll', onScroll)
    })

    return {
      isAuthenticated,
      user,
      handleLogout,
      isMobileOpen,
      hasScrolled,
      toggleMobile,
      closeMobile
    }
  }
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--gradient-section);
  color: #ffffff;
  /* border-bottom: 1px solid rgba(255, 255, 255, 0.08); */
  transition: background 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.header.scrolled {
  background: linear-gradient(235.37deg, rgba(7,42,37,0.98) 0%, rgba(3,24,21,0.98) 28%, rgba(7,42,37,0.98) 100%);
  box-shadow: 0 12px 24px rgba(0,0,0,0.25);
  border-color: rgba(255,255,255,0.12);
}

.nav {
  max-width: 1200px;
  margin: 16px auto; /* espace en haut et en bas */
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 96px; /* proche de la maquette */
}

.nav-left { flex-shrink: 0; }

.logo-link {
  text-decoration: none;
  color: #ffffff;
}

.logo {
  font-size: 2.2rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2.5rem; /* espacement important comme la maquette */
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.nav-link {
  text-decoration: none;
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.5rem 0; /* plus d'espace haut/bas */
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
}

.app-link {
  color: #ffffff;
  font-weight: 700;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: color 0.3s ease;
}

.app-link:hover {
  color: var(--color-primary);
}

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

.btn-outline {
  color: #ffffff;
  border-color: rgba(255,255,255,0.7);
  background: transparent;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary {
  background: var(--gradient-btn);
  color: white;
  border-color: transparent;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .nav {
    padding: 0 1rem;
  }
  
  .burger { display: inline-flex; flex-direction: column; gap: 4px; border: 0; background: transparent; padding: 8px; cursor: pointer; }
  .burger span { display: block; width: 22px; height: 2px; background: #ffffff; transition: transform .2s ease, opacity .2s ease; }
  .burger[aria-expanded="true"] span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .burger[aria-expanded="true"] span:nth-child(2) { opacity: 0; }
  .burger[aria-expanded="true"] span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

  .nav-links { position: fixed; inset: 96px 0 auto 0; background: linear-gradient(235.37deg, #072A25 0%, #031815 28%, #072A25 100%); padding: 16px; transform: translateY(-120%); opacity: 0; display: grid; gap: 12px; }
  .nav-links.open { transform: translateY(0); opacity: 1; }
  .nav-link { font-size: 1.1rem; padding: 0.75rem 0; }
  .btn { padding: 0.8rem 1.4rem; font-size: 1rem; min-width: 120px; }
}

@media (max-width: 640px) {
  .app-link { padding: 0.4rem 0.8rem; font-size: 0.9rem; }
}
</style>
