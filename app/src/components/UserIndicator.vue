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

          <!-- Lien admin pour les administrateurs -->
          <button 
            v-if="user?.role === 'admin'" 
            @click="goToDashboard" 
            class="dropdown-action admin-action"
          >
            🛠️ Administration
          </button>
          <button @click="logout" class="dropdown-action logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12H3M3 12L7 8M3 12L7 16M13 4H19C19.5304 4 20.0391 4.21071 20.4142 4.58579C20.7893 4.96086 21 5.46957 21 6V18C21 18.5304 20.7893 19.0391 20.4142 19.4142C20.0391 19.7893 19.5304 20 19 20H13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Déconnexion
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
      router.push('/profil')
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
  background: rgba(255, 255, 255, 0.10);
  padding: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.user-indicator:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px; /* Carré arrondi plus moderne */
  background: var(--gradient-btn);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95rem;
  line-height: 1.2;
}

.user-email {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  line-height: 1.2;
}

.user-menu-toggle {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 4px;
  transition: transform 0.3s ease;
  font-size: 0.8rem;
}

.user-indicator:hover .user-menu-toggle {
  color: white;
}

.user-menu-toggle.active {
  transform: rotate(180deg);
}

/* Dropdown Premium Style */
.user-dropdown {
  position: absolute;
  top: calc(100% + 16px);
  right: 0;
  width: 300px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 
    0 10px 40px -10px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  overflow: hidden;
  transform-origin: top right;
  animation: dropdownIn 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* Header sombre "Brand" */
.user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(235.37deg, #072A25 0%, #031815 28%, #072A25 100%);
  position: relative;
}

/* Effet de brillance subtil sur le header */
.user-dropdown-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
}

.user-avatar-small {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--gradient-btn);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-details .user-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
}

.user-details .user-email {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.user-details .user-role {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  color: #32C4C0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(50, 196, 192, 0.15);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid rgba(50, 196, 192, 0.2);
}

.user-dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0;
}

.user-dropdown-actions {
  padding: 8px;
}

.dropdown-action {
  width: 100%;
  background: transparent;
  border: none;
  padding: 14px 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #475569;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 10px;
  position: relative;
}

.dropdown-action:hover {
  background: #f8fafc;
  color: #0f172a;
  padding-left: 20px; /* Effet de glissement */
}



.dropdown-action.admin-action {
  color: #32C4C0;
  font-weight: 600;
}

.dropdown-action.admin-action:hover {
  background: rgba(50, 196, 192, 0.05);
}

.dropdown-action.logout {
  color: #94a3b8;
}

.dropdown-action.logout:hover {
  background: #fff1f2;
  color: #e11d48;
}

.dropdown-action.logout:hover::before {
  background: #e11d48;
}

.dropdown-action svg {
  width: 18px;
  height: 18px;
  stroke-width: 2px;
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .user-indicator {
    padding: 6px;
    border-radius: 50%;
    background: transparent;
    border: none;
  }
  
  .user-avatar {
    margin: 0;
    box-shadow: none;
  }
  
  .user-info, .user-menu-toggle {
    display: none;
  }
  
  .user-dropdown {
    right: -10px;
    width: 280px;
  }
}
</style>
