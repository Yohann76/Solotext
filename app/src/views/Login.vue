<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">Connexion</h1>
        <p class="login-subtitle">Accédez à votre compte SoloText</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="votre@email.com"
            autocomplete="email"
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
              autocomplete="current-password"
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

        <div class="form-options">
          <a href="#" class="forgot-password">Mot de passe oublié ?</a>
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="loading"
          :class="{ 'loading': loading }"
        >
          <span v-if="!loading">Se connecter</span>
          <span v-else class="loading-spinner">⏳</span>
        </button>

        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>
      </form>

      <div class="login-footer">
        <p>Pas encore de compte ? 
          <router-link to="/register" class="register-link">Créer un compte</router-link>
        </p>
      </div>
    </div>

    <div class="login-background">
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

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { success, error } = useNotifications()
    const { login } = useAuthStore()
    
    const form = reactive({
      email: '',
      password: ''
    })
    
    const errors = reactive({})
    const loading = ref(false)
    const errorMessage = ref('')
    const showPassword = ref(false)

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const validateForm = () => {
      errors.email = ''
      errors.password = ''
      
      if (!form.email) {
        errors.email = 'L\'email est requis'
        return false
      }
      
      if (!form.email.includes('@')) {
        errors.email = 'Format d\'email invalide'
        return false
      }
      
      if (!form.password) {
        errors.password = 'Le mot de passe est requis'
        return false
      }
      
      if (form.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères'
        return false
      }
      
      return true
    }

    const handleLogin = async () => {
      if (!validateForm()) return
      
      loading.value = true
      errorMessage.value = ''
      
      try {
        const result = await login(form.email, form.password)
        
        if (result.success) {
          // Notification de succès
          success(`Connexion réussie ! Bienvenue ${result.data.user.displayName}`)
          
          // Gérer la redirection après connexion
          const redirectParam = route.query.redirect
          const planParam = route.query.plan
          
          if (planParam) {
            // Si un plan est spécifié, rediriger vers tarifs qui déclenchera Stripe
            router.push(`/tarifs?plan=${planParam}`)
          } else if (redirectParam) {
            // Rediriger vers la page spécifiée
            router.push(redirectParam)
          } else {
            // Rediriger vers la page d'application par défaut
            router.push('/application')
          }
        } else {
          errorMessage.value = result.message || 'Erreur de connexion'
          error(result.message || 'Erreur de connexion')
        }
      } catch (error) {
        console.error('Erreur de connexion:', error)
        errorMessage.value = 'Erreur de connexion au serveur'
        error('Erreur de connexion au serveur')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      errorMessage,
      showPassword,
      togglePassword,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(235.37deg, #072A25 0%, #031815 28%, #072A25 100%);
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(50, 196, 192, 0.2);
  padding: 40px;
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 2;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #32C4C0;
  margin: 0 0 8px 0;
}

.login-subtitle {
  color: #32C4C0;
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
}

.login-form {
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
  color: #32C4C0;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #32C4C0;
  box-shadow: 0 0 0 3px rgba(50, 196, 192, 0.1);
}

.form-input.error {
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

.form-options {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 10px 0;
}

.forgot-password {
  color: #32C4C0;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #019E8B;
}

.login-button {
  background: #32C4C0;
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

.login-button:hover:not(:disabled) {
  background: #019E8B;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(50, 196, 192, 0.4);
}

.login-button:disabled {
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

.login-footer {
  text-align: center;
  margin-top: 30px;
  color: #32C4C0;
  opacity: 0.9;
}

.register-link {
  color: #32C4C0;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #019E8B;
}

.login-background {
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
  .login-card {
    padding: 30px 20px;
    margin: 10px;
  }
  
  .login-title {
    font-size: 1.5rem;
  }
}
</style>
