<template>
  <div class="admin-dashboard">
    <!-- Header commun -->
    <CommonHeader />
    
    <!-- Contenu principal -->
    <main class="main-content">
      <div class="dashboard-layout">
        <!-- Sidebar avec menu admin -->
        <aside class="admin-sidebar">
          <div class="sidebar-header">
            <h2 class="sidebar-title">🛠️ Administration</h2>
            <div class="admin-info">
              <span class="admin-badge">Admin</span>
            </div>
          </div>
          
          <nav class="sidebar-nav">
            <button 
              @click="activeTab = 'users'" 
              class="nav-item"
              :class="{ active: activeTab === 'users' }"
            >
              👥 Utilisateurs
            </button>
            <button 
              @click="activeTab = 'analyses'" 
              class="nav-item"
              :class="{ active: activeTab === 'analyses' }"
            >
              📊 Analyses
            </button>
            <button 
              @click="activeTab = 'settings'" 
              class="nav-item"
              :class="{ active: activeTab === 'settings' }"
            >
              ⚙️ Paramètres
            </button>
          </nav>
        </aside>

        <!-- Zone principale -->
        <div class="main-zone">
          <!-- Onglet Utilisateurs -->
          <div v-if="activeTab === 'users'" class="tab-content">
            <div class="content-header">
              <h1 class="page-title">Gestion des utilisateurs</h1>
              <button @click="showCreateUserModal = true" class="btn btn-primary">
                ➕ Nouvel utilisateur
              </button>
            </div>
            
            <div class="users-stats">
              <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-content">
                  <div class="stat-number">{{ users.length }}</div>
                  <div class="stat-label">Total utilisateurs</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">👑</div>
                <div class="stat-content">
                  <div class="stat-number">{{ adminUsers.length }}</div>
                  <div class="stat-label">Administrateurs</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">👤</div>
                <div class="stat-content">
                  <div class="stat-number">{{ regularUsers.length }}</div>
                  <div class="stat-label">Utilisateurs</div>
                </div>
              </div>
            </div>

            <div class="users-table-container">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in users" :key="user.id" class="user-row">
                    <td class="user-cell">
                      <div class="user-avatar">
                        <span class="user-initials">{{ getUserInitials(user) }}</span>
                      </div>
                      <div class="user-info">
                        <div class="user-name">{{ user.displayName || 'Utilisateur' }}</div>
                        <div class="user-id">ID: {{ user.id }}</div>
                      </div>
                    </td>
                    <td class="email-cell">{{ user.email }}</td>
                    <td class="role-cell">
                      <span class="role-badge" :class="user.role">
                        {{ user.role === 'admin' ? '👑 Admin' : '👤 Utilisateur' }}
                      </span>
                    </td>
                    <td class="date-cell">{{ formatDate(user.created_at) }}</td>
                    <td class="actions-cell">
                      <button @click="editUser(user)" class="btn-action edit">
                        ✏️
                      </button>
                      <button @click="deleteUser(user)" class="btn-action delete">
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Onglet Analyses -->
          <div v-if="activeTab === 'analyses'" class="tab-content">
            <div class="content-header">
              <h1 class="page-title">Analyses du système</h1>
            </div>
            
            <div class="analyses-stats">
              <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                  <div class="stat-number">{{ totalAnalyses }}</div>
                  <div class="stat-label">Total analyses</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                  <div class="stat-number">{{ pendingAnalyses }}</div>
                  <div class="stat-label">En attente</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                  <div class="stat-number">{{ completedAnalyses }}</div>
                  <div class="stat-label">Terminées</div>
                </div>
              </div>
            </div>

            <div class="analyses-list">
              <div v-for="analysis in analyses" :key="analysis.id" class="analysis-card">
                <div class="analysis-header">
                  <div class="analysis-id">#{{ analysis.id }}</div>
                  <div class="analysis-status" :class="analysis.status">
                    {{ getStatusText(analysis.status) }}
                  </div>
                </div>
                <div class="analysis-content">
                  <div class="analysis-text">{{ truncateText(analysis.source_text, 100) }}</div>
                  <div class="analysis-meta">
                    <span class="analysis-user">Utilisateur: {{ analysis.user_id }}</span>
                    <span class="analysis-date">{{ formatDate(analysis.created_at) }}</span>
                    <span v-if="analysis.duplicate_percent !== null" class="analysis-percent">
                      {{ analysis.duplicate_percent }}% duplication
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Onglet Paramètres -->
          <div v-if="activeTab === 'settings'" class="tab-content">
            <div class="content-header">
              <h1 class="page-title">Paramètres système</h1>
            </div>
            
            <div class="settings-grid">
              <div class="setting-card">
                <h3>Configuration API</h3>
                <p>Gérer les clés API et les limites</p>
                <button class="btn btn-secondary">Configurer</button>
              </div>
              <div class="setting-card">
                <h3>Maintenance</h3>
                <p>Mode maintenance et redémarrage</p>
                <button class="btn btn-secondary">Gérer</button>
              </div>
              <div class="setting-card">
                <h3>Logs système</h3>
                <p>Consulter les logs d'erreur</p>
                <button class="btn btn-secondary">Voir les logs</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal de création d'utilisateur -->
    <div v-if="showCreateUserModal" class="modal-overlay" @click="closeCreateUserModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Créer un nouvel utilisateur</h3>
          <button @click="closeCreateUserModal" class="modal-close">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createUser" class="user-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                id="email"
                v-model="newUser.email" 
                type="email" 
                required 
                class="form-input"
                placeholder="utilisateur@example.com"
              >
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input 
                id="password"
                v-model="newUser.password" 
                type="password" 
                required 
                class="form-input"
                placeholder="Mot de passe"
              >
            </div>
            <div class="form-group">
              <label for="role">Rôle</label>
              <select id="role" v-model="newUser.role" class="form-select">
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
            </div>
            <div class="form-actions">
              <button type="button" @click="closeCreateUserModal" class="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading">
                {{ loading ? 'Création...' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="notifications-container">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :message="notification.message"
        :type="notification.type"
        :duration="notification.duration"
        :auto-close="notification.autoClose"
        @close="removeNotification(notification.id)"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import CommonHeader from '../components/CommonHeader.vue'
import Notification from '../components/Notification.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useNotifications } from '../composables/useNotifications.js'

export default {
  name: 'AdminDashboard',
  components: {
    CommonHeader,
    Notification
  },
  setup() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuthStore()
    const { notifications, removeNotification, success, error } = useNotifications()

    // État de l'interface
    const activeTab = ref('users')
    const loading = ref(false)
    const showCreateUserModal = ref(false)

    // Données
    const users = ref([])
    const analyses = ref([])
    const newUser = ref({
      email: '',
      password: '',
      role: 'user'
    })

    // Vérifier l'authentification et les droits admin
    onMounted(async () => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }

      if (user.value?.role !== 'admin') {
        error('Accès refusé. Droits administrateur requis.')
        router.push('/application')
        return
      }

      await loadUsers()
      await loadAnalyses()
    })

    // Charger les utilisateurs
    const loadUsers = async () => {
      try {
        // TODO: Implémenter l'API pour récupérer les utilisateurs
        // Pour l'instant, on simule des données
        users.value = [
          {
            id: 1,
            email: 'admin@solotext.com',
            displayName: 'Administrateur',
            role: 'admin',
            created_at: '2024-01-01T00:00:00Z'
          },
          {
            id: 2,
            email: 'user1@example.com',
            displayName: 'Utilisateur 1',
            role: 'user',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 3,
            email: 'user2@example.com',
            displayName: 'Utilisateur 2',
            role: 'user',
            created_at: '2024-02-01T14:20:00Z'
          }
        ]
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err)
        error('Erreur lors du chargement des utilisateurs')
      }
    }

    // Charger les analyses
    const loadAnalyses = async () => {
      try {
        // TODO: Implémenter l'API pour récupérer toutes les analyses
        analyses.value = [
          {
            id: 1,
            user_id: 2,
            source_text: 'Ceci est un exemple de texte à analyser...',
            status: 'completed',
            duplicate_percent: 25,
            created_at: '2024-10-10T09:00:00Z'
          },
          {
            id: 2,
            user_id: 3,
            source_text: 'Un autre texte pour tester la duplication...',
            status: 'pending',
            duplicate_percent: null,
            created_at: '2024-10-10T10:30:00Z'
          }
        ]
      } catch (err) {
        console.error('Erreur lors du chargement des analyses:', err)
        error('Erreur lors du chargement des analyses')
      }
    }

    // Computed properties
    const adminUsers = computed(() => users.value.filter(u => u.role === 'admin'))
    const regularUsers = computed(() => users.value.filter(u => u.role === 'user'))
    const totalAnalyses = computed(() => analyses.value.length)
    const pendingAnalyses = computed(() => analyses.value.filter(a => a.status === 'pending').length)
    const completedAnalyses = computed(() => analyses.value.filter(a => a.status === 'completed').length)

    // Fonctions utilitaires
    const getUserInitials = (user) => {
      const name = user.displayName || user.email
      return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    const getStatusText = (status) => {
      const statusMap = {
        'pending': '⏳ En attente',
        'processing': '🔄 En cours',
        'completed': '✅ Terminée',
        'error': '❌ Erreur'
      }
      return statusMap[status] || status
    }

    // Actions sur les utilisateurs
    const createUser = async () => {
      loading.value = true
      try {
        // TODO: Implémenter l'API pour créer un utilisateur
        console.log('Création utilisateur:', newUser.value)
        success('Utilisateur créé avec succès')
        closeCreateUserModal()
        await loadUsers()
      } catch (err) {
        error('Erreur lors de la création de l\'utilisateur')
      } finally {
        loading.value = false
      }
    }

    const editUser = (user) => {
      // TODO: Implémenter l'édition d'utilisateur
      console.log('Édition utilisateur:', user)
    }

    const deleteUser = async (user) => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.email} ?`)) {
        try {
          // TODO: Implémenter l'API pour supprimer un utilisateur
          console.log('Suppression utilisateur:', user)
          success('Utilisateur supprimé avec succès')
          await loadUsers()
        } catch (err) {
          error('Erreur lors de la suppression de l\'utilisateur')
        }
      }
    }

    const closeCreateUserModal = () => {
      showCreateUserModal.value = false
      newUser.value = {
        email: '',
        password: '',
        role: 'user'
      }
    }

    return {
      activeTab,
      loading,
      showCreateUserModal,
      users,
      analyses,
      newUser,
      adminUsers,
      regularUsers,
      totalAnalyses,
      pendingAnalyses,
      completedAnalyses,
      notifications,
      removeNotification,
      getUserInitials,
      formatDate,
      truncateText,
      getStatusText,
      createUser,
      editUser,
      deleteUser,
      closeCreateUserModal
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  padding-top: 70px;
  height: calc(100vh - 70px);
  overflow: hidden;
}

.dashboard-layout {
  display: flex;
  height: 100%;
}

.admin-sidebar {
  width: 280px;
  background: #2d3748;
  color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid #4a5568;
  background: #1a202c;
}

.sidebar-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #e2e8f0;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  width: 100%;
  background: none;
  border: none;
  color: #a0aec0;
  padding: 1rem 1.5rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: #4a5568;
  color: white;
}

.nav-item.active {
  background: #4a5568;
  color: white;
  border-left-color: #667eea;
}

.main-zone {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.tab-content {
  max-width: 1200px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
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
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border-color: transparent;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

/* Stats cards */
.users-stats,
.analyses-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.8;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 500;
}

/* Users table */
.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  border-bottom: 2px solid #e2e8f0;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
}

.user-row:hover {
  background: #f8f9fa;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
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
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.user-id {
  font-size: 0.8rem;
  color: #718096;
}

.email-cell {
  color: #4a5568;
  font-family: monospace;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.admin {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.role-badge.user {
  background: #e2e8f0;
  color: #4a5568;
}

.date-cell {
  color: #718096;
  font-size: 0.9rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-action.edit:hover {
  background: #e6fffa;
  color: #38b2ac;
}

.btn-action.delete:hover {
  background: #fed7d7;
  color: #e53e3e;
}

/* Analyses list */
.analyses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analysis-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.analysis-card:hover {
  transform: translateY(-2px);
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.analysis-id {
  font-weight: 700;
  color: #667eea;
  font-size: 1.1rem;
}

.analysis-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.analysis-status.completed {
  background: #c6f6d5;
  color: #22543d;
}

.analysis-status.pending {
  background: #fef5e7;
  color: #744210;
}

.analysis-content {
  margin-bottom: 1rem;
}

.analysis-text {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.analysis-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: #718096;
}

/* Settings grid */
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.setting-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.setting-card:hover {
  transform: translateY(-2px);
}

.setting-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.setting-card p {
  color: #718096;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-body {
  padding: 1.5rem;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Notifications */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-sidebar {
    width: 250px;
  }
  
  .main-zone {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .admin-sidebar {
    width: 100%;
    height: auto;
  }
  
  .sidebar-nav {
    display: flex;
    padding: 0;
  }
  
  .nav-item {
    flex: 1;
    text-align: center;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .nav-item.active {
    border-left: none;
    border-bottom-color: #667eea;
  }
  
  .main-zone {
    padding: 1rem;
  }
  
  .users-stats,
  .analyses-stats {
    grid-template-columns: 1fr;
  }
  
  .users-table-container {
    overflow-x: auto;
  }
  
  .users-table {
    min-width: 600px;
  }
}

@media (max-width: 480px) {
  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
}
</style>
