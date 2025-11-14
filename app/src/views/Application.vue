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
            <div class="sidebar-title-row">
              <h2 class="sidebar-title">Historique des analyses</h2>
              <button @click="startNewAnalysis" class="btn-new-analysis" title="Nouvelle analyse">
                +
              </button>
            </div>
            <div class="analysis-count">{{ analyses.length }} analyse{{ analyses.length > 1 ? 's' : '' }}</div>
            <div v-if="creditsInfo" class="credits-display" :class="{ 'credits-exhausted': creditsInfo.isExhausted }">
              <div class="credits-label">Crédits restants</div>
              <div class="credits-value">
                <span class="credits-remaining">{{ creditsInfo.remaining }}</span>
                <span class="credits-separator">/</span>
                <span class="credits-limit">{{ creditsInfo.limit }}</span>
              </div>
              <div class="credits-progress-bar">
                <div 
                  class="credits-progress-fill" 
                  :class="{ 'credits-progress-danger': creditsInfo.remaining / creditsInfo.limit < 0.2 }"
                  :style="{ width: `${Math.min((creditsInfo.remaining / creditsInfo.limit) * 100, 100)}%` }"
                ></div>
              </div>
              <div v-if="creditsInfo.isExhausted" class="credits-warning">
                <span class="warning-icon">⚠️</span>
                <span>Limite atteinte. Mettez à niveau votre abonnement.</span>
              </div>
            </div>
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
                    @input="updateTextStats"
                    class="form-textarea"
                    :class="{ 'error': errors.text }"
                    placeholder="Collez votre texte ici..."
                    rows="10"
                    required
                  ></textarea>
                  <span v-if="errors.text" class="error-message">{{ errors.text }}</span>
                  <div v-if="textStats && form.text && form.text.trim()" class="text-stats-info">
                    <p v-if="textStats.sentences > 0" class="stats-message">
                      Votre texte contient <strong>{{ textStats.sentences }} phrase{{ textStats.sentences !== 1 ? 's' : '' }}</strong>, 
                      ces phrases une fois analysées seront décomptées de vos crédits.
                    </p>
                    <p v-else class="stats-message">
                      <strong>Aucune phrase complète détectée.</strong> Assurez-vous que votre texte contient des phrases terminées par un point, un point d'exclamation ou un point d'interrogation.
                    </p>
                    <div class="text-stats-details">
                      <span class="stat-badge-text">
                        <span class="stat-icon-text">📝</span>
                        {{ textStats.sentences }} phrase{{ textStats.sentences !== 1 ? 's' : '' }}
                      </span>
                      <span class="stat-badge-text">
                        <span class="stat-icon-text">📊</span>
                        {{ textStats.words }} mot{{ textStats.words !== 1 ? 's' : '' }}
                      </span>
                      <span v-if="textStats.sentences > 0" class="stat-badge-text stat-credits">
                        <span class="stat-icon-text">💳</span>
                        {{ textStats.credits }} crédit{{ textStats.credits !== 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>
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
                  <button @click="startNewAnalysis" class="btn btn-primary">
                    + Nouvelle analyse
                  </button>
                </div>
              </div>
              
              <div class="analysis-stats-container">
                <div class="stats-grid">
                  <!-- Carte principale : Duplication -->
                  <div class="stat-card stat-card-primary">
                    <div class="stat-icon-wrapper duplicate">
                      <span class="stat-icon">📊</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Duplication</span>
                      <span class="stat-value" :class="getDuplicateClass(selectedAnalysis.duplicate_percent)">
                        {{ selectedAnalysis.duplicate_percent !== null && selectedAnalysis.duplicate_percent !== undefined ? selectedAnalysis.duplicate_percent + '%' : 'En cours...' }}
                      </span>
                    </div>
                  </div>

                  <!-- Date -->
                  <div class="stat-card">
                    <div class="stat-icon-wrapper date">
                      <span class="stat-icon">📅</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Date d'analyse</span>
                      <span class="stat-value date-value">{{ formatDate(selectedAnalysis.analyzed_at || selectedAnalysis.created_at) }}</span>
                    </div>
                  </div>

                  <!-- Phrases analysées -->
                  <div class="stat-card">
                    <div class="stat-icon-wrapper total">
                      <span class="stat-icon">📝</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Phrases analysées</span>
                      <span class="stat-value">{{ analysisStats.totalSentences }}</span>
                    </div>
                  </div>

                  <!-- Sources trouvées -->
                  <div class="stat-card">
                    <div class="stat-icon-wrapper sources">
                      <span class="stat-icon">🔗</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Sources trouvées</span>
                      <span class="stat-value">{{ duplicateSources.length }}</span>
                    </div>
                  </div>

                  <!-- Phrases originales -->
                  <div class="stat-card stat-card-success">
                    <div class="stat-icon-wrapper success">
                      <span class="stat-icon">✅</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Phrases originales</span>
                      <span class="stat-value original">{{ analysisStats.originalSentences }}</span>
                    </div>
                  </div>

                  <!-- Phrases dupliquées -->
                  <div class="stat-card stat-card-danger">
                    <div class="stat-icon-wrapper danger">
                      <span class="stat-icon">⚠️</span>
                    </div>
                    <div class="stat-content">
                      <span class="stat-label">Phrases dupliquées</span>
                      <span class="stat-value duplicate">{{ analysisStats.duplicateSentences }}</span>
                    </div>
                  </div>
                </div>
              </div>

                  <div class="form-group">
                    <label class="form-label">Texte analysé (phrases surlignées selon leur statut)</label>
                    <div class="analysis-text-display">
                      <div 
                        class="text-content"
                        v-html="highlightedText"
                        @mouseover="handleTextHover"
                        @mouseout="hideTooltip"
                      ></div>
                    </div>
                  </div>

                  <!-- Section des sources détectées -->
                  <div v-if="duplicateSources.length > 0" class="sources-section">
                    <div class="sources-header">
                      <h3 class="sources-title">
                        <span class="sources-icon">🔗</span>
                        Sources détectées
                        <span class="sources-count">({{ duplicateSources.length }})</span>
                      </h3>
                      <p class="sources-subtitle">Liens vers les contenus dupliqués identifiés</p>
                    </div>
                    
                    <div class="sources-grid">
                      <div 
                        v-for="(source, index) in duplicateSources" 
                        :key="index"
                        class="source-card"
                      >
                        <div class="source-header">
                          <span class="source-number">#{{ index + 1 }}</span>
                          <span class="source-domain">{{ getDomainFromUrl(source.url) }}</span>
                        </div>
                        <div class="source-body">
                          <a 
                            :href="source.url" 
                            target="_blank" 
                            class="source-link"
                            :title="source.url"
                          >
                            {{ truncateUrl(source.url) }}
                          </a>
                        </div>
                        <div class="source-footer">
                          <span class="source-count">{{ source.count }} phrase{{ source.count > 1 ? 's' : '' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tooltip personnalisé -->
                  <div 
                    v-if="tooltip.visible" 
                    class="custom-tooltip"
                    :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
                    @mouseenter="keepTooltipVisible"
                    @mouseleave="hideTooltip"
                  >
                    <div class="tooltip-content">
                      <div class="tooltip-header">
                        <span class="tooltip-icon">🔗</span>
                        <span class="tooltip-title">Source détectée</span>
                      </div>
                      <div class="tooltip-body">
                        <a :href="tooltip.url" target="_blank" class="tooltip-link">
                          {{ tooltip.url }}
                        </a>
                      </div>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import CommonHeader from '../components/CommonHeader.vue'
import Notification from '../components/Notification.vue'
import AnalysisCard from '../components/AnalysisCard.vue'
import { useAuthStore } from '../stores/authStore.js'
import { useNotifications } from '../composables/useNotifications.js'
import analysisService from '../services/analysis.js'
import creditsService from '../services/credits.js'
import { getTextStats } from '../utils/textProcessor.js'

export default {
  name: 'Application',
  components: {
    CommonHeader,
    Notification,
    AnalysisCard
  },
  setup() {
    const router = useRouter()
    const { isAuthenticated, subscribe } = useAuthStore()
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
    const textStats = ref(null)
    const creditsInfo = ref(null)
    
    // État du tooltip
    const tooltip = ref({
      visible: false,
      x: 0,
      y: 0,
      url: ''
    })
    
    // Timer pour le délai de disparition
    let hideTimer = null
    // Timer pour le rafraîchissement automatique des pourcentages
    let refreshInterval = null
    // Timer pour le rafraîchissement automatique des phrases
    let refreshSentencesInterval = null

    // Surveiller les changements d'authentification
    watch(isAuthenticated, (newValue) => {
      if (!newValue) {
        router.push('/login')
      }
    }, { immediate: false })

    // Charger les crédits
    const loadCredits = async () => {
      try {
        const result = await creditsService.getCredits()
        if (result.success) {
          creditsInfo.value = result.data
        }
      } catch (error) {
        console.error('Erreur lors du chargement des crédits:', error)
      }
    }

    // Vérifier l'authentification et charger les analyses
    onMounted(async () => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }
      
      // Vérifier si on revient d'un paiement Stripe
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('checkout') === 'success') {
        success('Paiement réussi ! Votre abonnement est maintenant actif.')
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, '/application')
        // Recharger les crédits pour voir la mise à jour
        await loadCredits()
      }
      
      await loadAnalyses()
      await loadCredits()
      startAutoRefresh()
      
      // Rafraîchir les crédits toutes les 30 secondes
      setInterval(() => {
        loadCredits()
      }, 30000)
    })

    // Nettoyer les timers à la destruction du composant
    onUnmounted(() => {
      if (hideTimer) {
        clearTimeout(hideTimer)
      }
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      if (refreshSentencesInterval) {
        clearInterval(refreshSentencesInterval)
      }
    })

    const loadAnalyses = async () => {
      try {
        const result = await analysisService.getAnalyses(1, 50) // Charger les 50 dernières analyses
        if (result.success) {
          analyses.value = result.data.analyses
          // Démarrer le rafraîchissement automatique si nécessaire
          startAutoRefresh()
        }
      } catch (err) {
        console.error('Erreur lors du chargement des analyses:', err)
        error('Erreur lors du chargement de l\'historique')
      }
    }

    // Rafraîchir uniquement les pourcentages des analyses en cours
    const refreshPercentages = async () => {
      try {
        // Identifier les analyses qui doivent être rafraîchies :
        // - Celles qui n'ont pas encore de pourcentage (même si terminées)
        // - Celles qui ne sont pas en erreur
        const pendingAnalyses = analyses.value.filter(
          analysis => {
            const hasError = analysis.status === 'error' || 
                           analysis.status === 'sentence_analysis_error' || 
                           analysis.status === 'sentence_segmentation_error'
            const hasPercent = analysis.duplicate_percent !== null && analysis.duplicate_percent !== undefined
            // Rafraîchir si pas d'erreur et pas de pourcentage (même si terminée)
            return !hasError && !hasPercent
          }
        )

        if (pendingAnalyses.length === 0) {
          // Plus d'analyses en cours, arrêter le rafraîchissement
          if (refreshInterval) {
            clearInterval(refreshInterval)
            refreshInterval = null
          }
          return
        }

        // Récupérer les données mises à jour pour chaque analyse en cours
        const updatePromises = pendingAnalyses.map(async (analysis) => {
          try {
            const result = await analysisService.getAnalysis(analysis.id)
            if (result.success && result.data.analysis) {
              const updatedAnalysis = result.data.analysis
              // Mettre à jour uniquement les champs pertinents
              const index = analyses.value.findIndex(a => a.id === analysis.id)
              if (index !== -1) {
                analyses.value[index].duplicate_percent = updatedAnalysis.duplicate_percent
                analyses.value[index].status = updatedAnalysis.status
                
                // Si l'analyse sélectionnée est mise à jour, mettre à jour aussi selectedAnalysis
                if (selectedAnalysis.value && selectedAnalysis.value.id === analysis.id) {
                  selectedAnalysis.value.duplicate_percent = updatedAnalysis.duplicate_percent
                  selectedAnalysis.value.status = updatedAnalysis.status
                }
              }
            }
          } catch (err) {
            console.error(`Erreur lors de la mise à jour de l'analyse ${analysis.id}:`, err)
          }
        })

        await Promise.all(updatePromises)
      } catch (err) {
        console.error('Erreur lors du rafraîchissement des pourcentages:', err)
      }
    }

    const startAutoRefresh = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
      
      const hasPendingAnalyses = analyses.value.some(
        analysis => {
          const hasError = analysis.status === 'error' || 
                         analysis.status === 'sentence_analysis_error' || 
                         analysis.status === 'sentence_segmentation_error'
          const hasPercent = analysis.duplicate_percent !== null && analysis.duplicate_percent !== undefined
          return !hasError && !hasPercent
        }
      )

      if (hasPendingAnalyses) {
        // Rafraîchir toutes les 3 secondes
        refreshInterval = setInterval(() => {
          refreshPercentages()
        }, 3000)
      }
    }

    // Mettre à jour les statistiques du texte en temps réel
    const updateTextStats = () => {
      if (form.value.text && form.value.text.trim()) {
        textStats.value = getTextStats(form.value.text)
      } else {
        textStats.value = null
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
          textStats.value = null // Réinitialiser les statistiques
          // Recharger la liste des analyses et les crédits
          await loadAnalyses()
          await loadCredits()
          // Sélectionner automatiquement la nouvelle analyse pour afficher son résultat
          const newAnalysis = result.data.analysis
          await selectAnalysis(newAnalysis)
          // Démarrer le rafraîchissement automatique pour la nouvelle analyse
          startAutoRefresh()
          // Scroller vers la vue de l'analyse
          setTimeout(() => {
            const viewerElement = document.querySelector('.analysis-viewer')
            if (viewerElement) {
              viewerElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }, 100)
        } else {
          error(result.message || 'Erreur lors de la création de l\'analyse')
        }
      } catch (err) {
        console.error('Erreur lors de l\'analyse:', err)
        
        // Gérer spécifiquement les erreurs de crédits insuffisants
        if (err.response?.data?.code === 'INSUFFICIENT_CREDITS') {
          const creditsData = err.response.data.data
          error(
            `Crédits insuffisants ! Vous avez ${creditsData?.creditsInfo?.remaining || 0} crédit(s) restant(s) sur ${creditsData?.creditsInfo?.limit || 0}, ` +
            `mais ${creditsData?.requiredCredits || 0} crédit(s) sont nécessaires. Veuillez mettre à niveau votre abonnement.`
          )
          // Recharger les crédits pour mettre à jour l'affichage
          await loadCredits()
        } else {
          error(err.message || 'Erreur lors de l\'analyse du texte')
        }
      } finally {
        loading.value = false
      }
    }

    // Sélectionner une analyse pour la visualiser
    const selectAnalysis = async (analysis) => {
      // Arrêter le rafraîchissement des phrases précédent
      if (refreshSentencesInterval) {
        clearInterval(refreshSentencesInterval)
        refreshSentencesInterval = null
      }
      
      selectedAnalysis.value = analysis
      try {
        // Charger les phrases de cette analyse
        const sentences = await analysisService.getAnalysisSentences(analysis.id)
        selectedAnalysisSentences.value = sentences
        
        // Démarrer le rafraîchissement automatique des phrases si l'analyse n'est pas terminée
        startSentencesRefresh(analysis.id)
      } catch (err) {
        console.error('Erreur lors du chargement des phrases:', err)
        error('Erreur lors du chargement des détails de l\'analyse')
      }
    }
    
    // Rafraîchir les phrases de l'analyse sélectionnée en temps réel
    const refreshSentences = async () => {
      if (!selectedAnalysis.value) return
      
      try {
        const sentences = await analysisService.getAnalysisSentences(selectedAnalysis.value.id)
        // Mettre à jour les phrases (cela déclenchera automatiquement la mise à jour du surlignage)
        selectedAnalysisSentences.value = sentences
        
        // Vérifier si toutes les phrases sont testées, si oui arrêter le rafraîchissement
        const allTested = sentences.every(s => s.is_test === true)
        const isCompleted = selectedAnalysis.value.status === 'analysis_completed'
        
        if (allTested || isCompleted) {
          if (refreshSentencesInterval) {
            clearInterval(refreshSentencesInterval)
            refreshSentencesInterval = null
          }
        }
      } catch (err) {
        console.error('Erreur lors du rafraîchissement des phrases:', err)
      }
    }
    
    // Démarrer le rafraîchissement automatique des phrases
    const startSentencesRefresh = (analysisId) => {
      // Arrêter l'intervalle existant
      if (refreshSentencesInterval) {
        clearInterval(refreshSentencesInterval)
      }
      
      // Vérifier si l'analyse est terminée
      const analysis = analyses.value.find(a => a.id === analysisId)
      if (analysis && analysis.status === 'analysis_completed') {
        return // Ne pas rafraîchir si terminée
      }
      
      // Rafraîchir toutes les 2 secondes
      refreshSentencesInterval = setInterval(() => {
        refreshSentences()
      }, 2000)
    }

    // Effacer la sélection
    const clearSelection = () => {
      // Arrêter le rafraîchissement des phrases
      if (refreshSentencesInterval) {
        clearInterval(refreshSentencesInterval)
        refreshSentencesInterval = null
      }
      
      selectedAnalysis.value = null
      selectedAnalysisSentences.value = []
    }

    // Commencer une nouvelle analyse
    const startNewAnalysis = () => {
      clearSelection()
      // Scroll vers le formulaire d'analyse
      const formElement = document.querySelector('.analysis-form-container')
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' })
      }
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
      if (!selectedAnalysis.value) {
        return ''
      }

      let text = selectedAnalysis.value.source_text
      const sentences = selectedAnalysisSentences.value

      // Si aucune phrase n'est chargée, retourner le texte sans surlignage
      if (!sentences.length) {
        return text
      }
      
      // Remplacer chaque phrase par sa version surlignée
      sentences.forEach(sentence => {
        const sentenceText = sentence.sentence_text.trim()
        if (sentenceText && text.includes(sentenceText)) {
          // Déterminer la classe CSS selon le statut de test et de duplication
          let className
          let title
          
          if (!sentence.is_test) {
            // Phrase non testée → gris
            className = 'sentence-untested'
            title = 'Phrase non testée'
          } else if (sentence.is_duplicate) {
            // Phrase testée et dupliquée → rouge
            className = 'sentence-duplicate'
            title = `Source: ${sentence.source_url || 'Non spécifiée'}`
          } else {
            // Phrase testée et originale → vert
            className = 'sentence-original'
            title = 'Phrase originale'
          }
          
          const highlightedSentence = `<span class="sentence-highlight ${className}" title="${title}">${sentenceText}</span>`
          text = text.replace(sentenceText, highlightedSentence)
        }
      })

      return text
    })

    // Calculer les sources dupliquées uniques
    const duplicateSources = computed(() => {
      if (!selectedAnalysisSentences.value.length) {
        return []
      }

      const sourceMap = new Map()
      
      selectedAnalysisSentences.value.forEach(sentence => {
        if (sentence.is_duplicate && sentence.source_url) {
          const url = sentence.source_url
          if (sourceMap.has(url)) {
            sourceMap.get(url).count++
          } else {
            sourceMap.set(url, {
              url: url,
              count: 1
            })
          }
        }
      })

      return Array.from(sourceMap.values()).sort((a, b) => b.count - a.count)
    })

    // Calculer les statistiques de l'analyse
    const analysisStats = computed(() => {
      const sentences = selectedAnalysisSentences.value
      const totalSentences = sentences.length
      const originalSentences = sentences.filter(s => s.is_test && !s.is_duplicate).length
      const duplicateSentences = sentences.filter(s => s.is_test && s.is_duplicate).length
      
      return {
        totalSentences,
        originalSentences,
        duplicateSentences
      }
    })

    // Fonctions utilitaires pour les URLs
    const getDomainFromUrl = (url) => {
      try {
        const domain = new URL(url).hostname
        return domain.replace('www.', '')
      } catch {
        return 'Source inconnue'
      }
    }

    const truncateUrl = (url) => {
      if (url.length <= 60) return url
      return url.substring(0, 57) + '...'
    }

    // Gestion du tooltip personnalisé
    const handleTextHover = (event) => {
      const target = event.target
      
      // Vérifier que c'est bien une phrase dupliquée
      if (target.classList.contains('sentence-highlight') && target.classList.contains('sentence-duplicate')) {
        const title = target.getAttribute('title')
        if (title && title.startsWith('Source: ')) {
          const url = title.replace('Source: ', '')
          
          // Annuler le timer de disparition s'il existe
          if (hideTimer) {
            clearTimeout(hideTimer)
            hideTimer = null
          }
          
          // Éviter de recréer le tooltip s'il est déjà visible avec la même URL
          if (tooltip.value.visible && tooltip.value.url === url) {
            return
          }
          
          // Position fixe par rapport à l'élément, pas à la souris
          const rect = target.getBoundingClientRect()
          const tooltipWidth = 300
          const tooltipHeight = 80
          
          // Calculer la position optimale
          let x = rect.left + rect.width / 2 - tooltipWidth / 2
          let y = rect.top - tooltipHeight - 10
          
          // Éviter que le tooltip sorte de l'écran
          if (x < 10) x = 10
          if (x + tooltipWidth > window.innerWidth - 10) {
            x = window.innerWidth - tooltipWidth - 10
          }
          
          // Si pas assez de place en haut, mettre en bas
          if (y < 10) {
            y = rect.bottom + 10
          }
          
          tooltip.value = {
            visible: true,
            x: x,
            y: y,
            url: url
          }
        }
      } else {
        // Si on survole autre chose qu'une phrase dupliquée, déclencher le timer de disparition
        if (tooltip.value.visible) {
          hideTooltip()
        }
      }
    }

    const hideTooltip = () => {
      // Délai avant de cacher le tooltip
      hideTimer = setTimeout(() => {
        tooltip.value.visible = false
      }, 500) // 500ms de délai pour plus de stabilité
    }

    const keepTooltipVisible = () => {
      // Annuler le timer de disparition quand on survole le tooltip
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }
    }

    return {
      form,
      errors,
      loading,
      analyses,
      selectedAnalysis,
      selectedAnalysisSentences,
      highlightedText,
      duplicateSources,
      analysisStats,
      textStats,
      tooltip,
      notifications,
      removeNotification,
      analyzeText,
      selectAnalysis,
      clearSelection,
      startNewAnalysis,
      formatDate,
      getDuplicateClass,
      getDomainFromUrl,
      truncateUrl,
      loadAnalyses,
      handleTextHover,
      hideTooltip,
      keepTooltipVisible,
      updateTextStats,
      creditsInfo,
      loadCredits
    }
  }
}
</script>

<style scoped>
.application {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding-top: 130px; /* Compensation pour le header fixe (hauteur header ~128px + marge) */
}

.app-layout {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar {
  width: 350px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: white;
}

.credits-display {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 1px solid #bae6fd;
}

.credits-display.credits-exhausted {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

.credits-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 0.5rem;
}

.credits-exhausted .credits-label {
  color: #991b1b;
}

.credits-value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
}

.credits-remaining {
  font-size: 1.5rem;
  font-weight: 700;
  color: #075985;
}

.credits-exhausted .credits-remaining {
  color: #dc2626;
}

.credits-separator {
  font-size: 1.2rem;
  font-weight: 500;
  color: #64748b;
}

.credits-limit {
  font-size: 1.1rem;
  font-weight: 600;
  color: #475569;
}

.credits-progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.credits-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #32c4c0 0%, #2aada9 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.credits-progress-fill.credits-progress-danger {
  background: linear-gradient(90deg, #f56565 0%, #e53e3e 100%);
}

.credits-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #991b1b;
  font-weight: 600;
  margin-top: 0.5rem;
}

.warning-icon {
  font-size: 1rem;
}

.sidebar-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.btn-new-analysis {
  background: #374151;
  color: white;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(55, 65, 81, 0.2);
}

.btn-new-analysis:hover {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(55, 65, 81, 0.3);
}

.btn-new-analysis:active {
  transform: translateY(0);
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

.text-stats-info {
  margin-top: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border: 1px solid #bae6fd;
}

.stats-message {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #0c4a6e;
  line-height: 1.5;
}

.stats-message strong {
  color: #075985;
  font-weight: 700;
}

.text-stats-details {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.stat-badge-text {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #f7fafc;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.2s ease;
}

.stat-badge-text.stat-credits {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-color: #32c4c0;
  color: #0c4a6e;
}

.stat-icon-text {
  font-size: 0.9rem;
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
  align-items: center;
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

.analysis-stats-container {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e0;
}

.stat-card-primary {
  border-left: 4px solid #667eea;
  background: linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%);
}

.stat-card-success {
  border-left: 4px solid #48bb78;
}

.stat-card-danger {
  border-left: 4px solid #f56565;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f7fafc;
}

.stat-icon-wrapper.duplicate {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-icon-wrapper.date {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-icon-wrapper.total {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-icon-wrapper.sources {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-icon-wrapper.success {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-icon-wrapper.danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.2;
}

.stat-value.date-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #4a5568;
}

.stat-value.original {
  color: #28a745;
}

.stat-value.duplicate {
  color: #dc3545;
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

/* Tooltip personnalisé */
.custom-tooltip {
  position: fixed;
  z-index: 1000;
  pointer-events: auto;
  max-width: 300px;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-content {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-icon {
  font-size: 16px;
}

.tooltip-title {
  font-weight: 600;
  font-size: 14px;
  color: #ecf0f1;
}

.tooltip-body {
  font-size: 13px;
}

.tooltip-link {
  color: #3498db;
  text-decoration: none;
  word-break: break-all;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(52, 152, 219, 0.1);
  border: 1px solid rgba(52, 152, 219, 0.3);
  display: inline-block;
  margin-top: 4px;
}

.tooltip-link:hover {
  color: #5dade2;
  background: rgba(52, 152, 219, 0.2);
  border-color: rgba(52, 152, 219, 0.5);
  transform: translateY(-1px);
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Section des sources détectées */
.sources-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.sources-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.sources-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.sources-icon {
  font-size: 1.6rem;
}

.sources-count {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
}

.sources-subtitle {
  color: #6c757d;
  font-size: 0.95rem;
  margin: 0;
}

.sources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.source-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.source-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f3f4;
}

.source-number {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
}

.source-domain {
  background: #f8f9fa;
  color: #495057;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

.source-body {
  margin-bottom: 0.75rem;
}

.source-link {
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-all;
  transition: color 0.2s ease;
}

.source-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

.source-footer {
  display: flex;
  justify-content: flex-end;
}

.source-count {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
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
  
  .sources-grid {
    grid-template-columns: 1fr;
  }
  
  .sources-title {
    font-size: 1.2rem;
    flex-direction: column;
    gap: 0.3rem;
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
