<template>
  <div v-if="isAuthenticated" class="user-indicator">
    <div class="user-avatar">
      <span class="user-initials">{{ user?.initials || 'U' }}</span>
    </div>
    <div class="user-info">
      <span class="user-name">{{ user?.displayName || 'Utilisateur' }}</span>
      <span class="user-email">{{ user?.email }}</span>
    </div>
    <div class="user-menu">
      <button @click="toggleMenu" class="user-menu-toggle" :class="{ active: showMenu }">
        ▼
      </button>
      <div v-if="showMenu" class="user-dropdown">
        <div class="user-dropdown-header">
          <div class="user-avatar-small">
            <span class="user-initials">{{ user?.initials || 'U' }}</span>
          </div>
          <div class="user-details">
            <div class="user-name">{{ user?.displayName || 'Utilisateur' }}</div>
            <div class="user-email">{{ user?.email }}</div>
            <div class="user-role">{{ user?.roleFormatted || 'Utilisateur' }}</div>
          </div>
        </div>
        <div class="user-dropdown-divider"></div>
        <div class="user-dropdown-actions">
          <button @click="goToProfile" class="dropdown-action">
            👤 Mon profil
          </button>
          <button @click="goToSettings" class="dropdown-action">
            ⚙️ Paramètres
          </button>
          <!-- Lien admin pour les administrateurs -->
          <button 
            v-if="user?.role === 'admin'" 
            @click="goToDashboard" 
            class="dropdown-action admin-action"
          >
            🛠️ Administration
          </button>
          <div class="user-dropdown-divider"></div>
          <button @click="logout" class="dropdown-action logout">
            🚪 Déconnexion
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

export default {
  name: 'UserIndicator',
  emits: ['logout'],
  setup(props, { emit }) {
    const router = useRouter()
    const showMenu = ref(false)
    const { isAuthenticated, user, logout, subscribe } = useAuthStore()

    const toggleMenu = () => {
      showMenu.value = !showMenu.value
    }

    const closeMenu = () => {
      showMenu.value = false
    }

    const goToProfile = () => {
      closeMenu()
      // TODO: Implémenter la page de profil
      console.log('Aller au profil')
    }

    const goToSettings = () => {
      closeMenu()
      // TODO: Implémenter la page de paramètres
      console.log('Aller aux paramètres')
    }

    const goToDashboard = () => {
      closeMenu()
      router.push('/dashboard')
    }

    const handleLogout = async () => {
      closeMenu()
      await logout()
      emit('logout')
    }

    onMounted(() => {
      // Fermer le menu si on clique ailleurs
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-indicator')) {
          closeMenu()
        }
      })
    })

    onUnmounted(() => {
      document.removeEventListener('click', closeMenu)
    })

    return {
      isAuthenticated,
      user,
      showMenu,
      toggleMenu,
      goToProfile,
      goToSettings,
      goToDashboard,
      logout: handleLogout
    }
  }
}
</script>

<style scoped>
.user-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.user-indicator:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
  line-height: 1.2;
}

.user-email {
  color: #718096;
  font-size: 0.8rem;
  line-height: 1.2;
}

.user-menu {
  position: relative;
}

.user-menu-toggle {
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-size: 0.8rem;
}

.user-menu-toggle:hover {
  background: rgba(0, 0, 0, 0.1);
}

.user-menu-toggle.active {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-width: 280px;
  z-index: 1000;
  animation: dropdownIn 0.2s ease-out;
}

.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.user-avatar-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.user-details {
  flex: 1;
}

.user-details .user-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 2px;
}

.user-details .user-email {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 4px;
}

.user-details .user-role {
  font-size: 0.8rem;
  color: #667eea;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.user-dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 8px 0;
}

.user-dropdown-actions {
  padding: 8px 0;
}

.dropdown-action {
  width: 100%;
  background: none;
  border: none;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: #4a5568;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-action:hover {
  background: #f7fafc;
}

.dropdown-action.logout {
  color: #e53e3e;
}

.dropdown-action.logout:hover {
  background: #fed7d7;
}

.dropdown-action.admin-action {
  color: #667eea;
  font-weight: 600;
}

.dropdown-action.admin-action:hover {
  background: #e6f3ff;
  color: #4c51bf;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .user-indicator {
    padding: 6px 10px;
    gap: 8px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .user-info {
    display: none;
  }
  
  .user-dropdown {
    right: -20px;
    min-width: 250px;
  }
}
</style>
