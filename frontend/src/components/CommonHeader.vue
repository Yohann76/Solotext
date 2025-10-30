<template>
  <header class="header">
    <nav class="nav">
      <div class="nav-brand">
        <router-link to="/" class="logo-link">
          <h1 class="logo">SoloText</h1>
        </router-link>
      </div>
      <div class="nav-links">
        <router-link to="/fonctionnalites" class="nav-link">Fonctionnalités</router-link>
        <router-link to="/tarifs" class="nav-link">Tarifs</router-link>
        
        <!-- Liens pour utilisateurs non authentifiés -->
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="btn btn-outline">Connexion</router-link>
          <router-link to="/register" class="btn btn-primary">Rejoindre l'aventure</router-link>
        </template>
        
        <!-- Liens pour utilisateurs authentifiés -->
        <template v-else>
          <router-link to="/application" class="nav-link app-link">
            📱 Application
          </router-link>
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
    const { isAuthenticated, user, logout, subscribe } = useAuthStore()
    const { success } = useNotifications()

    const handleLogout = async () => {
      const userName = user.value?.displayName || 'Utilisateur'
      await logout()
      success(`Au revoir ${userName} ! Vous avez été déconnecté.`)
    }

    onMounted(() => {
      // Plus de scroll d'ancrage: remplacer par routes
    })

    return {
      isAuthenticated,
      user,
      handleLogout
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.nav-brand {
  flex-shrink: 0;
}

.logo-link {
  text-decoration: none;
  color: inherit;
}

.logo {
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: #667eea;
}

.app-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.app-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transform: translateY(-1px);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  min-width: 120px;
}

.btn-outline {
  color: #667eea;
  border-color: #667eea;
  background: transparent;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  
  .nav-links {
    gap: 1rem;
  }
  
  .nav-link {
    font-size: 0.9rem;
  }
  
  .btn {
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
    min-width: 100px;
  }
}

@media (max-width: 640px) {
  .nav-links {
    gap: 0.5rem;
  }
  
  .nav-link:not(.app-link) {
    display: none;
  }
  
  .app-link {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}
</style>
