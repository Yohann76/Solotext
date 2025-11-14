<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1 class="register-title">Inscription</h1>
        <p class="register-subtitle">Créez votre compte SoloText</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="votre@email.com"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Mot de passe</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': errors.password }"
              placeholder="Votre mot de passe"
              required
            />
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
          <div class="password-input-container">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': errors.confirmPassword }"
              placeholder="Confirmez votre mot de passe"
              required
            />
            <button
              type="button"
              @click="toggleConfirmPassword"
              class="password-toggle"
              :aria-label="showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            >
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>


        <div class="form-group">
          <label class="checkbox-container">
            <input type="checkbox" v-model="form.acceptTerms" required />
            <span class="checkmark"></span>
            J'accepte les <a href="#" class="terms-link">conditions d'utilisation</a>
          </label>
          <span v-if="errors.acceptTerms" class="error-message">{{ errors.acceptTerms }}</span>
        </div>

        <button
          type="submit"
          class="register-button"
          :disabled="loading"
          :class="{ 'loading': loading }"
        >
          <span v-if="!loading">Créer mon compte</span>
          <span v-else class="loading-spinner">⏳</span>
        </button>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-banner">
          {{ successMessage }}
        </div>
      </form>

      <div class="register-footer">
        <p>Déjà un compte ? 
          <router-link to="/login" class="login-link">Se connecter</router-link>
        </p>
      </div>
    </div>

    <div class="register-background">
      <div class="background-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../stores/authStore.js'
import stripeService from '../services/stripe.js'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { success, error } = useNotifications()
    const { register } = useAuthStore()
    
    // Récupérer le plan depuis l'URL
    const selectedPlan = ref(null)
    
    const form = reactive({
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    })
    
    const errors = reactive({})
    const loading = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const toggleConfirmPassword = () => {
      showConfirmPassword.value = !showConfirmPassword.value
    }

    const validateForm = () => {
      // Reset errors
      Object.keys(errors).forEach(key => errors[key] = '')
      
      let isValid = true
      
      // Email validation
      if (!form.email) {
        errors.email = 'L\'email est requis'
        isValid = false
      } else if (!form.email.includes('@')) {
        errors.email = 'Format d\'email invalide'
        isValid = false
      }
      
      // Password validation
      if (!form.password) {
        errors.password = 'Le mot de passe est requis'
        isValid = false
      } else if (form.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        isValid = false
      }
      
      // Confirm password validation
      if (!form.confirmPassword) {
        errors.confirmPassword = 'La confirmation du mot de passe est requise'
        isValid = false
      } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Les mots de passe ne correspondent pas'
        isValid = false
      }
      
      // Terms validation
      if (!form.acceptTerms) {
        errors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation'
        isValid = false
      }
      
      return isValid
    }

    const handleRegister = async () => {
      if (!validateForm()) return
      
      loading.value = true
      errorMessage.value = ''
      successMessage.value = ''
      
      try {
        const result = await register(form.email, form.password)
        
        if (result.success) {
          successMessage.value = 'Compte créé avec succès ! Redirection...'
          success(`Compte créé avec succès ! Bienvenue ${result.data.user.displayName}`)
          
          // Si un plan est sélectionné, rediriger vers le paiement
          if (selectedPlan.value && selectedPlan.value !== 'freemium') {
            setTimeout(async () => {
              try {
                const checkoutResult = await stripeService.createCheckoutSession(selectedPlan.value)
                if (checkoutResult.success && checkoutResult.data.checkoutUrl) {
                  window.location.href = checkoutResult.data.checkoutUrl
                } else {
                  error('Erreur lors de la création de la session de paiement')
                  router.push('/application')
                }
              } catch (err) {
                console.error('Erreur lors de la création de la session Stripe:', err)
                error('Erreur lors de la création de la session de paiement')
                router.push('/application')
              }
            }, 1500)
          } else {
            // Rediriger vers la page d'application après 2 secondes
            setTimeout(() => {
              router.push('/application')
            }, 2000)
          }
        } else {
          errorMessage.value = result.message || 'Erreur lors de la création du compte'
          error(result.message || 'Erreur lors de la création du compte')
        }
      } catch (error) {
        console.error('Erreur d\'inscription:', error)
        errorMessage.value = 'Erreur de connexion au serveur'
        error('Erreur de connexion au serveur')
      } finally {
        loading.value = false
      }
    }
    
    // Lire le paramètre plan de l'URL au montage
    onMounted(() => {
      const planParam = route.query.plan
      if (planParam) {
        selectedPlan.value = planParam
      }
    })

    return {
      form,
      errors,
      loading,
      errorMessage,
      successMessage,
      showPassword,
      showConfirmPassword,
      selectedPlan,
      togglePassword,
      toggleConfirmPassword,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 2;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.register-subtitle {
  color: #718096;
  margin: 0;
  font-size: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.form-input, .form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
  background: white;
}

.form-input:focus, .form-select:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error, .form-select.error {
  border-color: #e53e3e;
}

.password-input-container {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
}

.error-message {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 4px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
}

.checkbox-container input {
  margin-right: 8px;
}

.terms-link {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #5a67d8;
}

.register-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 20px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-banner {
  background: #fed7d7;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;
}

.success-banner {
  background: #c6f6d5;
  color: #2f855a;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 10px;
}

.register-footer {
  text-align: center;
  margin-top: 30px;
  color: #718096;
}

.login-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #5a67d8;
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.background-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .register-title {
    font-size: 1.5rem;
  }
}
</style>
