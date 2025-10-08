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
            <!-- Mode création d'analyse -->
            <div v-if="!selectedAnalysis">
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

            <!-- Mode visualisation d'analyse -->
            <div v-else class="analysis-viewer">
              <div class="viewer-header">
                <h1 class="page-title">Analyse #{{ selectedAnalysis.id }}</h1>
                <div class="viewer-actions">
                  <button @click="clearSelection" class="btn btn-secondary">
                    ← Retour à l'analyse
                  </button>
                </div>
              </div>
              
              <div class="analysis-stats">
                <div class="stat-item">
                  <span class="stat-label">Duplication:</span>
                  <span class="stat-value" :class="getDuplicateClass(selectedAnalysis.duplicate_percent)">
                    {{ selectedAnalysis.duplicate_percent }}%
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Date:</span>
                  <span class="stat-value">{{ formatDate(selectedAnalysis.analyzed_at) }}</span>
                </div>
              </div>

                  <div class="form-group">
                    <label class="form-label">Texte analysé (phrases surlignées selon leur statut)</label>
                    <div class="analysis-text-display">
                      <div 
                        class="text-content"
                        v-html="highlightedText"
                      ></div>
                    </div>
                  </div>
            </div>
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
import { ref, onMounted, computed } from 'vue'
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
    const selectedAnalysisSentences = ref([])

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

    // Sélectionner une analyse pour la visualiser
    const selectAnalysis = async (analysis) => {
      selectedAnalysis.value = analysis
      try {
        // Charger les phrases de cette analyse
        const sentences = await analysisService.getAnalysisSentences(analysis.id)
        selectedAnalysisSentences.value = sentences
      } catch (err) {
        console.error('Erreur lors du chargement des phrases:', err)
        error('Erreur lors du chargement des détails de l\'analyse')
      }
    }

    // Effacer la sélection
    const clearSelection = () => {
      selectedAnalysis.value = null
      selectedAnalysisSentences.value = []
    }

    // Formater la date
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Obtenir la classe CSS pour le pourcentage de duplication
    const getDuplicateClass = (percent) => {
      if (percent === null || percent === undefined) return 'pending'
      if (percent === 0) return 'original'
      if (percent < 15) return 'low'
      if (percent < 50) return 'medium'
      return 'high'
    }

    // Créer le texte avec surlignage des phrases
    const highlightedText = computed(() => {
      if (!selectedAnalysis.value || !selectedAnalysisSentences.value.length) {
        return selectedAnalysis.value?.source_text || ''
      }

      let text = selectedAnalysis.value.source_text
      const sentences = selectedAnalysisSentences.value

      // Remplacer chaque phrase par sa version surlignée
      sentences.forEach(sentence => {
        const sentenceText = sentence.sentence_text.trim()
        if (sentenceText && text.includes(sentenceText)) {
          const className = sentence.is_duplicate ? 'sentence-duplicate' : 'sentence-original'
          const title = sentence.is_duplicate 
            ? `Source: ${sentence.source_url || 'Non spécifiée'}` 
            : 'Phrase originale'
          
          const highlightedSentence = `<span class="sentence-highlight ${className}" title="${title}">${sentenceText}</span>`
          text = text.replace(sentenceText, highlightedSentence)
        }
      })

      return text
    })

    return {
      form,
      errors,
      loading,
      analyses,
      selectedAnalysis,
      selectedAnalysisSentences,
      highlightedText,
      notifications,
      removeNotification,
      analyzeText,
      selectAnalysis,
      clearSelection,
      formatDate,
      getDuplicateClass,
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

/* Styles pour la visualisation d'analyse */
.analysis-viewer {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.viewer-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.analysis-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.stat-value.pending {
  color: #ffc107;
}

.stat-value.original {
  color: #28a745;
}

.stat-value.low {
  color: #17a2b8;
}

.stat-value.medium {
  color: #fd7e14;
}

.stat-value.high {
  color: #dc3545;
}

.analysis-text-display {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  min-height: 200px;
  line-height: 1.8;
  font-size: 1rem;
}

.sentence {
  display: inline;
  margin-right: 0.5rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: help;
}

.sentence.duplicate {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.sentence.duplicate:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.sentence:not(.duplicate) {
  background: transparent;
  color: #333;
}

.sentence:not(.duplicate):hover {
  background: #e3f2fd;
  color: #1976d2;
}

/* Styles pour le texte surligné */
.text-content {
  line-height: 1.8;
  font-size: 1rem;
  white-space: pre-wrap;
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
