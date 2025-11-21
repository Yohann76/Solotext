<template>
  <div class="newsletter-tab">
    <div class="content-header">
      <h1 class="page-title">Gestion de la Newsletter</h1>
      <button @click="exportCSV" class="btn btn-primary" :disabled="loading">
        📥 Exporter les inscrits (CSV)
      </button>
    </div>

    <!-- Statistiques -->
    <div class="newsletter-stats">
      <div class="stat-card">
        <div class="stat-icon">📧</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.total || 0 }}</div>
          <div class="stat-label">Total emails</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.subscribed || 0 }}</div>
          <div class="stat-label">Inscrits</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.unsubscribed || 0 }}</div>
          <div class="stat-label">Désinscrits</div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="filters-bar">
      <select v-model="statusFilter" @change="loadNewsletters" class="filter-select">
        <option value="">Tous les statuts</option>
        <option value="subscribed">Inscrits uniquement</option>
        <option value="unsubscribed">Désinscrits uniquement</option>
      </select>
    </div>

    <!-- Tableau des emails -->
    <div class="newsletters-table-container">
      <table class="newsletters-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Statut</th>
            <th>Date d'inscription</th>
            <th>Dernière mise à jour</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="loading-cell">Chargement...</td>
          </tr>
          <tr v-else-if="newsletters.length === 0">
            <td colspan="4" class="empty-cell">Aucun email trouvé</td>
          </tr>
          <tr v-else v-for="newsletter in newsletters" :key="newsletter.id" class="newsletter-row">
            <td class="email-cell">{{ newsletter.email }}</td>
            <td class="status-cell">
              <span class="status-badge" :class="newsletter.is_subscribed ? 'subscribed' : 'unsubscribed'">
                {{ newsletter.is_subscribed ? '✅ Inscrit' : '❌ Désinscrit' }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(newsletter.created_at) }}</td>
            <td class="date-cell">{{ formatDate(newsletter.updated_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <button 
        @click="changePage(pagination.page - 1)" 
        :disabled="pagination.page === 1"
        class="btn btn-secondary"
      >
        ← Précédent
      </button>
      <span class="page-info">
        Page {{ pagination.page }} sur {{ pagination.totalPages }}
      </span>
      <button 
        @click="changePage(pagination.page + 1)" 
        :disabled="pagination.page === pagination.totalPages"
        class="btn btn-secondary"
      >
        Suivant →
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { http } from '../api/http'
import { endpoints } from '../api/endpoints'
import { useNotifications } from '../composables/useNotifications'

export default {
  name: 'AdminNewsletter',
  setup() {
    const { success, error } = useNotifications()
    
    const loading = ref(false)
    const stats = ref({
      total: 0,
      subscribed: 0,
      unsubscribed: 0
    })
    const newsletters = ref([])
    const statusFilter = ref('')
    const pagination = ref({
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    })

    // Charger les statistiques
    const loadStats = async () => {
      try {
        const response = await http.get(endpoints.admin.newsletter.stats)
        if (response.success) {
          stats.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement des stats:', err)
        error('Erreur lors du chargement des statistiques')
      }
    }

    // Charger la liste des newsletters
    const loadNewsletters = async () => {
      try {
        loading.value = true
        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit
        }
        if (statusFilter.value) {
          params.status = statusFilter.value
        }

        const response = await http.get(endpoints.admin.newsletter.root, params)
        if (response.success) {
          newsletters.value = response.data.newsletters
          pagination.value = response.data.pagination
        }
      } catch (err) {
        console.error('Erreur lors du chargement des newsletters:', err)
        error('Erreur lors du chargement des emails')
      } finally {
        loading.value = false
      }
    }

    // Changer de page
    const changePage = (page) => {
      pagination.value.page = page
      loadNewsletters()
    }

    // Exporter en CSV
    const exportCSV = async () => {
      try {
        loading.value = true
        
        // Créer un lien temporaire pour télécharger le fichier
        const token = localStorage.getItem('token')
        const url = `${import.meta.env.VITE_API_URL || '/api'}${endpoints.admin.newsletter.export}`
        
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`)
        
        // Ajouter le token dans les headers via fetch
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Erreur lors de l\'export')
        }
        
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        
        success('Export CSV réussi !')
      } catch (err) {
        console.error('Erreur lors de l\'export CSV:', err)
        error('Erreur lors de l\'export CSV')
      } finally {
        loading.value = false
      }
    }

    // Formater une date
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    onMounted(async () => {
      await Promise.all([
        loadStats(),
        loadNewsletters()
      ])
    })

    return {
      loading,
      stats,
      newsletters,
      statusFilter,
      pagination,
      loadNewsletters,
      changePage,
      exportCSV,
      formatDate
    }
  }
}
</script>

<style scoped>
.newsletter-tab {
  padding: 2rem;
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
  color: #1a1a1a;
  margin: 0;
}

.newsletter-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.success {
  border-left: 4px solid #10b981;
}

.stat-card.warning {
  border-left: 4px solid #f59e0b;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.filters-bar {
  margin-bottom: 1.5rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.newsletters-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.newsletters-table {
  width: 100%;
  border-collapse: collapse;
}

.newsletters-table thead {
  background: #f9fafb;
}

.newsletters-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.newsletter-row {
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s;
}

.newsletter-row:hover {
  background-color: #f9fafb;
}

.newsletters-table td {
  padding: 1rem;
  color: #1f2937;
}

.email-cell {
  font-weight: 500;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.subscribed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.unsubscribed {
  background-color: #fee2e2;
  color: #991b1b;
}

.date-cell {
  color: #6b7280;
  font-size: 0.875rem;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: #f9fafb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
