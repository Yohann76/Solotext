<template>
  <div 
    class="analysis-card"
    @click="$emit('select', analysis)"
  >
    <!-- Bordure colorée basée sur la duplication -->
    <div class="card-border" :class="borderClass"></div>
    
    <!-- Contenu de la carte -->
    <div class="card-content">
      <!-- Header compact -->
      <div class="analysis-header">
        <div class="header-left">
          <span class="analysis-date">{{ formatDate(analysis.created_at) }}</span>
        </div>
        <div class="duplicate-badge" :class="duplicateClass">
          <span v-if="isNull" class="null-indicator">⏳</span>
          <span v-else>{{ duplicatePercent }}%</span>
        </div>
      </div>

      <!-- Texte résumé -->
      <div class="analysis-text">
        {{ analysis.summary || analysis.source_text?.substring(0, 100) + '...' }}
      </div>

      <!-- Statistiques compactes -->
      <div class="analysis-stats">
        <div class="stat-badge">
          <span class="stat-icon">📝</span>
          <span class="stat-value">{{ sentenceCount }}</span>
          <span class="stat-label">phrase{{ sentenceCount > 1 ? 's' : '' }}</span>
        </div>
        <div class="stat-badge">
          <span class="stat-icon">📊</span>
          <span class="stat-value">{{ wordCount }}</span>
          <span class="stat-label">mots</span>
        </div>
      </div>

      <!-- Barre de progression de duplication -->
      <div class="duplicate-section">
        <div class="duplicate-header">
          <span class="duplicate-label">Duplication:</span>
        </div>
        <div class="progress-container">
          <div 
            class="progress-bar" 
            :class="progressClass"
            :style="{ width: progressWidth }"
          ></div>
        </div>
      </div>

      <!-- Footer avec statut -->
      <div class="analysis-footer">
        <span class="status-badge" :class="statusClass">
          {{ statusText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AnalysisCard',
  props: {
    analysis: {
      type: Object,
      required: true
    }
  },
  computed: {
    wordCount() {
      if (!this.analysis.source_text) return 0
      return this.analysis.source_text.split(/\s+/).filter(word => word.length > 0).length
    },
    
    sentenceCount() {
      if (!this.analysis.source_text) return 0
      // Estimation du nombre de phrases en comptant les points, exclamation, interrogation
      const text = this.analysis.source_text.trim()
      if (!text) return 0
      // Compter les phrases en se basant sur les ponctuations de fin
      const sentences = text.split(/[.!?]+\s+/).filter(s => s.trim().length > 0)
      return sentences.length || 1 // Au moins 1 phrase si le texte existe
    },
    
    isNull() {
      return this.analysis.duplicate_percent === null || this.analysis.duplicate_percent === undefined
    },
    
    duplicatePercent() {
      return this.isNull ? 0 : Math.round(this.analysis.duplicate_percent * 100) / 100
    },
    
    duplicateClass() {
      if (this.isNull) return 'duplicate-null'
      if (this.duplicatePercent === 0) return 'duplicate-original'
      if (this.duplicatePercent < 15) return 'duplicate-low'
      if (this.duplicatePercent < 50) return 'duplicate-medium'
      return 'duplicate-high'
    },
    
    borderClass() {
      if (this.isNull) return 'border-null'
      if (this.duplicatePercent === 0) return 'border-original'
      if (this.duplicatePercent < 15) return 'border-low'
      if (this.duplicatePercent < 50) return 'border-medium'
      return 'border-high'
    },
    
    progressClass() {
      if (this.isNull) return 'progress-null'
      if (this.duplicatePercent === 0) return 'progress-original'
      if (this.duplicatePercent < 15) return 'progress-low'
      if (this.duplicatePercent < 50) return 'progress-medium'
      return 'progress-high'
    },
    
    progressWidth() {
      return this.isNull ? '0%' : `${Math.min(this.duplicatePercent, 100)}%`
    },
    
    statusClass() {
      const status = this.analysis.status || 'pending'
      // Normaliser les statuts
      if (status.includes('pending') || status.includes('waiting')) return 'status-pending'
      if (status.includes('processing') || status.includes('progress') || status.includes('in_progress')) return 'status-processing'
      if (status.includes('completed') || status.includes('finished')) return 'status-completed'
      if (status.includes('error')) return 'status-error'
      return 'status-pending'
    },
    
    statusText() {
      const status = this.analysis.status || 'pending'
      const statusMap = {
        'pending': 'En attente',
        'processing': 'En cours',
        'completed': 'Terminé',
        'error': 'Erreur',
        'sentence_segmentation_in_progress': 'Segmentation...',
        'sentence_segmentation_completed': 'Segmentation OK',
        'sentence_analysis_in_progress': 'Analyse...',
        'analysis_completed': 'Terminé'
      }
      
      // Chercher une correspondance partielle
      for (const [key, value] of Object.entries(statusMap)) {
        if (status.includes(key)) return value
      }
      
      return 'En cours'
    }
  },
  
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }
  }
}
</script>

<style scoped>
.analysis-card {
  position: relative;
  background: white;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.analysis-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Bordure colorée à gauche */
.card-border {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  transition: width 0.3s ease;
}

.analysis-card:hover .card-border {
  width: 5px;
}

.border-null {
  background: linear-gradient(180deg, #90cdf4 0%, #63b3ed 100%);
}

.border-original {
  background: linear-gradient(180deg, #68d391 0%, #48bb78 100%);
}

.border-low {
  background: linear-gradient(180deg, #9ae6b4 0%, #68d391 100%);
}

.border-medium {
  background: linear-gradient(180deg, #fbd38d 0%, #f6ad55 100%);
}

.border-high {
  background: linear-gradient(180deg, #fc8181 0%, #f56565 100%);
}

.card-content {
  padding: 1rem;
  margin-left: 4px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.analysis-id {
  font-size: 0.75rem;
  font-weight: 700;
  color: #2d3748;
  background: #f7fafc;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.analysis-date {
  font-size: 0.9rem;
  color: #718096;
  font-weight: 700;
}

.duplicate-badge {
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  min-width: 50px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.analysis-card:hover .duplicate-badge {
  transform: scale(1.05);
}

.analysis-text {
  font-size: 0.8rem;
  color: #4a5568;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4rem;
}

.analysis-stats {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #f7fafc;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.analysis-card:hover .stat-badge {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.stat-icon {
  font-size: 0.9rem;
}

.stat-value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-label {
  font-size: 0.7rem;
  color: #718096;
  font-weight: 500;
}

/* Section de duplication avec barre de progression */
.duplicate-section {
  margin-bottom: 0.75rem;
}

.duplicate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.duplicate-label {
  font-size: 0.8rem;
  color: #4a5568;
  font-weight: 500;
}

.progress-container {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-null {
  background: #90cdf4;
}

.progress-original {
  background: #48bb78;
}

.progress-low {
  background: #68d391;
}

.progress-medium {
  background: #f6ad55;
}

.progress-high {
  background: #f56565;
}

/* Styles pour les badges de duplication */
.duplicate-null {
  background: linear-gradient(135deg, #90cdf4 0%, #63b3ed 100%);
  color: #1e3a5f;
}

.duplicate-original {
  background: linear-gradient(135deg, #68d391 0%, #48bb78 100%);
  color: #1a365d;
}

.duplicate-low {
  background: linear-gradient(135deg, #9ae6b4 0%, #68d391 100%);
  color: #22543d;
}

.duplicate-medium {
  background: linear-gradient(135deg, #fbd38d 0%, #f6ad55 100%);
  color: #744210;
}

.duplicate-high {
  background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
  color: #742a2a;
}

.null-indicator {
  font-size: 0.9rem;
}

.analysis-footer {
  display: flex;
  justify-content: flex-start;
  padding-top: 0.5rem;
  border-top: 1px solid #f1f5f9;
}

.status-badge {
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.status-pending {
  background: linear-gradient(135deg, #fef5e7 0%, #fde68a 100%);
  color: #744210;
  border: 1px solid #fcd34d;
}

.status-processing {
  background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);
  color: #1e40af;
  border: 1px solid #60a5fa;
}

.status-completed {
  background: linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%);
  color: #065f46;
  border: 1px solid #34d399;
}

.status-error {
  background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
  color: #991b1b;
  border: 1px solid #f87171;
}

/* Responsive */
@media (max-width: 768px) {
  .card-content {
    padding: 0.75rem;
  }
  
  .analysis-stats {
    gap: 0.4rem;
  }
  
  .stat-badge {
    padding: 0.3rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .duplicate-badge {
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
  }
}
</style>
