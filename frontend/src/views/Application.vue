<template>
  <div class="application">
    <!-- Header commun -->
    <CommonHeader />
    
    <!-- Contenu principal -->
    <main class="main-content">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1 class="hero-title">
            Bienvenue dans votre espace SoloText
          </h1>
          <p class="hero-subtitle">
            Analysez vos textes, détectez le plagiat et améliorez votre écriture
          </p>
          <div class="hero-actions">
            <button @click="startAnalysis" class="btn btn-primary btn-large">
              🚀 Nouvelle analyse
            </button>
            <button @click="viewHistory" class="btn btn-outline btn-large">
              📊 Historique
            </button>
          </div>
        </div>
      </section>

      <!-- Dashboard Section -->
      <section class="dashboard">
        <div class="container">
          <div class="dashboard-grid">
            <!-- Statistiques rapides -->
            <div class="stats-card">
              <div class="stats-icon">📈</div>
              <div class="stats-content">
                <h3>{{ userStats.totalAnalyses }}</h3>
                <p>Analyses effectuées</p>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-icon">📝</div>
              <div class="stats-content">
                <h3>{{ userStats.totalWords }}</h3>
                <p>Mots analysés</p>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-icon">⚠️</div>
              <div class="stats-content">
                <h3>{{ userStats.riskDetections }}</h3>
                <p>Risques détectés</p>
              </div>
            </div>
            
            <div class="stats-card">
              <div class="stats-icon">⭐</div>
              <div class="stats-content">
                <h3>{{ userStats.avgScore }}%</h3>
                <p>Score moyen</p>
              </div>
            </div>
          </div>

          <!-- Fonctionnalités principales -->
          <div class="features-section">
            <h2 class="section-title">Fonctionnalités disponibles</h2>
            <div class="features-grid">
              <div class="feature-card" @click="startAnalysis">
                <div class="feature-icon">🔍</div>
                <h3>Analyse de texte</h3>
                <p>Analysez vos textes pour détecter le plagiat et améliorer la qualité</p>
                <div class="feature-action">Commencer →</div>
              </div>
              
              <div class="feature-card" @click="viewHistory">
                <div class="feature-icon">📊</div>
                <h3>Historique</h3>
                <p>Consultez toutes vos analyses précédentes et leurs résultats</p>
                <div class="feature-action">Voir →</div>
              </div>
              
              <div class="feature-card" @click="manageAccount">
                <div class="feature-icon">⚙️</div>
                <h3>Paramètres</h3>
                <p>Gérez votre compte et vos préférences d'analyse</p>
                <div class="feature-action">Configurer →</div>
              </div>
              
              <div class="feature-card" @click="viewHelp">
                <div class="feature-icon">❓</div>
                <h3>Aide</h3>
                <p>Guide d'utilisation et support technique</p>
                <div class="feature-action">Aide →</div>
              </div>
            </div>
          </div>

          <!-- Analyses récentes -->
          <div class="recent-section">
            <h2 class="section-title">Analyses récentes</h2>
            <div class="recent-list">
              <div v-if="recentAnalyses.length === 0" class="empty-state">
                <div class="empty-icon">📄</div>
                <h3>Aucune analyse récente</h3>
                <p>Commencez par analyser votre premier texte</p>
                <button @click="startAnalysis" class="btn btn-primary">
                  Première analyse
                </button>
              </div>
              
              <div v-else class="analyses-list">
                <div 
                  v-for="analysis in recentAnalyses" 
                  :key="analysis.id"
                  class="analysis-item"
                  @click="viewAnalysis(analysis.id)"
                >
                  <div class="analysis-info">
                    <h4>{{ analysis.title || 'Analyse sans titre' }}</h4>
                    <p>{{ analysis.textPreview }}...</p>
                    <div class="analysis-meta">
                      <span class="analysis-date">{{ formatDate(analysis.createdAt) }}</span>
                      <span class="analysis-score" :class="getScoreClass(analysis.score)">
                        Score: {{ analysis.score }}%
                      </span>
                    </div>
                  </div>
                  <div class="analysis-status">
                    <span class="status-badge" :class="getStatusClass(analysis.status)">
                      {{ getStatusText(analysis.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import CommonHeader from '../components/CommonHeader.vue'
import Notification from '../components/Notification.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useNotifications } from '../composables/useNotifications.js'

export default {
  name: 'Application',
  components: {
    CommonHeader,
    Notification
  },
  setup() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuthStore()
    const { notifications, removeNotification, success, error } = useNotifications()

    // Données de l'utilisateur
    const userStats = ref({
      totalAnalyses: 0,
      totalWords: 0,
      riskDetections: 0,
      avgScore: 0
    })

    const recentAnalyses = ref([])

    // Vérifier l'authentification
    onMounted(() => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }
      
      loadUserData()
    })

    const loadUserData = async () => {
      try {
        // TODO: Charger les vraies données de l'utilisateur
        // Pour l'instant, on simule des données
        userStats.value = {
          totalAnalyses: 12,
          totalWords: 2450,
          riskDetections: 3,
          avgScore: 87
        }

        recentAnalyses.value = [
          {
            id: 1,
            title: "Rapport de stage",
            textPreview: "Ce rapport présente les activités réalisées durant mon stage...",
            createdAt: new Date('2024-01-15'),
            score: 92,
            status: 'completed'
          },
          {
            id: 2,
            title: "Mémoire de fin d'études",
            textPreview: "Introduction à l'analyse des données...",
            createdAt: new Date('2024-01-10'),
            score: 78,
            status: 'completed'
          }
        ]
      } catch (err) {
        error('Erreur lors du chargement des données')
      }
    }

    const startAnalysis = () => {
      success('Fonctionnalité d\'analyse en cours de développement')
      // TODO: Rediriger vers la page d'analyse
    }

    const viewHistory = () => {
      success('Historique des analyses en cours de développement')
      // TODO: Rediriger vers l'historique
    }

    const manageAccount = () => {
      success('Paramètres du compte en cours de développement')
      // TODO: Rediriger vers les paramètres
    }

    const viewHelp = () => {
      success('Page d\'aide en cours de développement')
      // TODO: Rediriger vers l'aide
    }

    const viewAnalysis = (id) => {
      success(`Analyse ${id} en cours de développement`)
      // TODO: Rediriger vers les détails de l'analyse
    }

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }

    const getScoreClass = (score) => {
      if (score >= 90) return 'score-excellent'
      if (score >= 70) return 'score-good'
      if (score >= 50) return 'score-average'
      return 'score-poor'
    }

    const getStatusClass = (status) => {
      return `status-${status}`
    }

    const getStatusText = (status) => {
      const statusMap = {
        'completed': 'Terminé',
        'processing': 'En cours',
        'error': 'Erreur'
      }
      return statusMap[status] || 'Inconnu'
    }

    return {
      isAuthenticated,
      user,
      userStats,
      recentAnalyses,
      notifications,
      removeNotification,
      startAnalysis,
      viewHistory,
      manageAccount,
      viewHelp,
      viewAnalysis,
      formatDate,
      getScoreClass,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.application {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  padding-top: 70px; /* Hauteur du header fixe */
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.dashboard {
  padding: 4rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.stats-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-4px);
}

.stats-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.stats-content h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.stats-content p {
  color: #718096;
  margin: 0;
  font-size: 0.9rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
}

.features-section {
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #718096;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.feature-action {
  color: #667eea;
  font-weight: 600;
  font-size: 0.9rem;
}

.recent-section {
  margin-bottom: 4rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #718096;
  margin-bottom: 2rem;
}

.analyses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.analysis-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.analysis-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.analysis-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.analysis-info p {
  color: #718096;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.analysis-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
}

.analysis-date {
  color: #a0aec0;
}

.analysis-score {
  font-weight: 600;
}

.score-excellent { color: #48bb78; }
.score-good { color: #38b2ac; }
.score-average { color: #ed8936; }
.score-poor { color: #f56565; }

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-completed { background: #c6f6d5; color: #22543d; }
.status-processing { background: #bee3f8; color: #2a4365; }
.status-error { background: #fed7d7; color: #742a2a; }

.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .analysis-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
