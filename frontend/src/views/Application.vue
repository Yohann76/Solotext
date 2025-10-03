<template>
  <div class="application">
    <!-- Header commun -->
    <CommonHeader />
    
    <!-- Contenu principal -->
    <main class="main-content">
      <div class="app-layout">
        <!-- Sidebar avec historique -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <h2 class="sidebar-title">Historique des analyses</h2>
            <div class="analysis-count">{{ analyses.length }} analyse{{ analyses.length > 1 ? 's' : '' }}</div>
          </div>
          
          <div class="sidebar-content">
            <div v-if="analyses.length === 0" class="empty-state">
              <div class="empty-icon">📄</div>
              <p>Aucune analyse pour le moment</p>
            </div>
            
            <div v-else class="analyses-list">
              <AnalysisCard
                v-for="analysis in analyses"
                :key="analysis.id"
                :analysis="analysis"
                @select="selectAnalysis"
              />
            </div>
          </div>
        </aside>

        <!-- Zone principale -->
        <div class="main-zone">
          <div class="analysis-form-container">
            <h1 class="page-title">Analyse de texte</h1>
            <p class="page-subtitle">Collez votre texte ci-dessous pour l'analyser</p>
            
            <form @submit.prevent="analyzeText" class="analysis-form">
              <div class="form-group">
                <label for="text" class="form-label">Texte à analyser</label>
                <textarea
                  id="text"
                  v-model="form.text"
                  class="form-textarea"
                  :class="{ 'error': errors.text }"
                  placeholder="Collez votre texte ici..."
                  rows="10"
                  required
                ></textarea>
                <span v-if="errors.text" class="error-message">{{ errors.text }}</span>
              </div>
              
              <div class="form-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-large"
                  :disabled="loading"
                >
                  <span v-if="loading">Analyse en cours...</span>
                  <span v-else>🔍 Analyser</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
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
import AnalysisCard from '../components/AnalysisCard.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useNotifications } from '../composables/useNotifications.js'
import analysisService from '../services/analysis.js'

export default {
  name: 'Application',
  components: {
    CommonHeader,
    Notification,
    AnalysisCard
  },
  setup() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const { notifications, removeNotification, success, error } = useNotifications()

    // État du formulaire
    const form = ref({
      text: ''
    })

    const errors = ref({})
    const loading = ref(false)
    const analyses = ref([])
    const selectedAnalysis = ref(null)

    // Vérifier l'authentification et charger les analyses
    onMounted(async () => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }
      
      await loadAnalyses()
    })

    const loadAnalyses = async () => {
      try {
        const result = await analysisService.getAnalyses(1, 50) // Charger les 50 dernières analyses
        if (result.success) {
          analyses.value = result.data.analyses
        }
      } catch (err) {
        console.error('Erreur lors du chargement des analyses:', err)
        error('Erreur lors du chargement de l\'historique')
      }
    }

    const selectAnalysis = (analysis) => {
      selectedAnalysis.value = analysis
      // TODO: Afficher les détails de l'analyse sélectionnée
      console.log('Analyse sélectionnée:', analysis)
    }

    const analyzeText = async () => {
      // Validation
      errors.value = {}
      
      if (!form.value.text.trim()) {
        errors.value.text = 'Veuillez saisir un texte à analyser'
        return
      }

      if (form.value.text.trim().length < 10) {
        errors.value.text = 'Le texte doit contenir au moins 10 caractères'
        return
      }

      loading.value = true

      try {
        // Appeler l'API pour créer l'analyse
        const result = await analysisService.createAnalysis(form.value.text.trim())
        
        if (result.success) {
          success(`Analyse créée avec succès ! ID: ${result.data.analysis.id}`)
          form.value.text = '' // Vider le formulaire après analyse
          // Recharger la liste des analyses
          await loadAnalyses()
        } else {
          error(result.message || 'Erreur lors de la création de l\'analyse')
        }
      } catch (err) {
        console.error('Erreur lors de l\'analyse:', err)
        error(err.message || 'Erreur lors de l\'analyse du texte')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      analyses,
      selectedAnalysis,
      notifications,
      removeNotification,
      analyzeText,
      selectAnalysis,
      loadAnalyses
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
  margin-top: 2rem; /* Marge supplémentaire pour séparer du menu */
  height: calc(100vh - 70px - 2rem);
  overflow: hidden;
}

.app-layout {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 350px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.analysis-count {
  font-size: 0.85rem;
  color: #718096;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #718096;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.analyses-list {
  display: flex;
  flex-direction: column;
}

.main-zone {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.analysis-form-container {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #718096;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.analysis-form {
  text-align: left;
}

.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.form-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea.error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.form-actions {
  text-align: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  min-width: 160px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-large {
  padding: 1.2rem 2.5rem;
  font-size: 1.1rem;
}

.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1001;
}

/* Responsive */
@media (max-width: 1024px) {
  .sidebar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 200px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .main-zone {
    padding: 1rem;
  }
  
  .analysis-form-container {
    padding: 2rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .btn-large {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .analysis-form-container {
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .form-textarea {
    min-height: 150px;
  }
  
  .sidebar {
    height: 150px;
  }
}
</style>
