<template>
  <div class="application">
    <!-- Header commun -->
    <CommonHeader />
    
    <!-- Contenu principal -->
    <main class="main-content">
      <div class="container">
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
    const { isAuthenticated } = useAuthStore()
    const { notifications, removeNotification, success, error } = useNotifications()

    // État du formulaire
    const form = ref({
      text: ''
    })

    const errors = ref({})
    const loading = ref(false)

    // Vérifier l'authentification
    onMounted(() => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }
    })

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
        // TODO: Appeler l'API d'analyse
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulation
        
        success('Analyse terminée ! (Fonctionnalité en cours de développement)')
        form.value.text = '' // Vider le formulaire après analyse
      } catch (err) {
        error('Erreur lors de l\'analyse du texte')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      notifications,
      removeNotification,
      analyzeText
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
  padding: 4rem 0;
  margin-top: 2rem; /* Marge supplémentaire pour séparer du menu */
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
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
@media (max-width: 768px) {
  .main-content {
    padding: 2rem 0;
  }
  
  .container {
    padding: 0 1rem;
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
}
</style>
