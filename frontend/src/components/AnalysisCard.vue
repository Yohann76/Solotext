<template>
  <div class="analysis-card" @click="$emit('select', analysis)">
    <!-- Header avec date -->
    <div class="analysis-header">
      <span class="analysis-date">{{ formatDate(analysis.created_at) }}</span>
      <span class="analysis-id">#{{ analysis.id }}</span>
    </div>

    <!-- Contenu principal -->
    <div class="analysis-content">
      <!-- Texte résumé -->
      <div class="analysis-text">
        {{ analysis.summary || analysis.source_text?.substring(0, 80) + '...' }}
      </div>

      <!-- Statistiques -->
      <div class="analysis-stats">
        <div class="stat-item">
          <span class="stat-label">Mots:</span>
          <span class="stat-value">{{ wordCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caractères:</span>
          <span class="stat-value">{{ characterCount }}</span>
        </div>
      </div>

      <!-- Duplicate percent -->
      <div class="duplicate-section">
        <div class="duplicate-header">
          <span class="duplicate-label">Duplication:</span>
          <div class="duplicate-value" :class="duplicateClass">
            <span v-if="isNull" class="null-indicator">✕</span>
            <span v-else>{{ duplicatePercent }}%</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="progress-container">
          <div 
            class="progress-bar" 
            :class="progressClass"
            :style="{ width: progressWidth }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Footer avec statut -->
    <div class="analysis-footer">
      <span class="status-badge" :class="statusClass">
        {{ statusText }}
      </span>
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
    
    characterCount() {
      return this.analysis.source_text ? this.analysis.source_text.length : 0
    },
    
    isNull() {
      return this.analysis.duplicate_percent === null || this.analysis.duplicate_percent === undefined
    },
    
    duplicatePercent() {
      return this.isNull ? 0 : Math.round(this.analysis.duplicate_percent * 100) / 100
    },
    
    duplicateClass() {
      if (this.isNull) return 'duplicate-null'
      if (this.duplicatePercent < 15) return 'duplicate-low'
      if (this.duplicatePercent < 50) return 'duplicate-medium'
      return 'duplicate-high'
    },
    
    progressClass() {
      if (this.isNull) return 'progress-null'
      if (this.duplicatePercent < 15) return 'progress-low'
      if (this.duplicatePercent < 50) return 'progress-medium'
      return 'progress-high'
    },
    
    progressWidth() {
      return this.isNull ? '0%' : `${Math.min(this.duplicatePercent, 100)}%`
    },
    
    statusClass() {
      const status = this.analysis.status || 'pending'
      return `status-${status}`
    },
    
    statusText() {
      const statusMap = {
        'pending': 'En attente',
        'processing': 'En cours',
        'completed': 'Terminé',
        'error': 'Erreur'
      }
      return statusMap[this.analysis.status] || 'Inconnu'
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
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.analysis-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.analysis-date {
  font-size: 0.8rem;
  color: #718096;
  font-weight: 500;
}

.analysis-id {
  font-size: 0.75rem;
  color: #a0aec0;
  background: #f7fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.analysis-content {
  margin-bottom: 0.75rem;
}

.analysis-text {
  font-size: 0.85rem;
  color: #4a5568;
  line-height: 1.4;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.analysis-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.7rem;
  color: #a0aec0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #2d3748;
}

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

.duplicate-value {
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  min-width: 40px;
  text-align: center;
}

.duplicate-null {
  background: #bee3f8;
  color: #2a4365;
}

.duplicate-low {
  background: #c6f6d5;
  color: #22543d;
}

.duplicate-medium {
  background: #fef5e7;
  color: #744210;
}

.duplicate-high {
  background: #fed7d7;
  color: #742a2a;
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
  background: #bee3f8;
}

.progress-low {
  background: #48bb78;
}

.progress-medium {
  background: #ed8936;
}

.progress-high {
  background: #f56565;
}

.analysis-footer {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-pending {
  background: #fef5e7;
  color: #744210;
}

.status-processing {
  background: #bee3f8;
  color: #2a4365;
}

.status-completed {
  background: #c6f6d5;
  color: #22543d;
}

.status-error {
  background: #fed7d7;
  color: #742a2a;
}

/* Responsive */
@media (max-width: 768px) {
  .analysis-card {
    padding: 0.75rem;
  }
  
  .analysis-stats {
    gap: 0.75rem;
  }
  
  .stat-item {
    gap: 0.2rem;
  }
}
</style>
