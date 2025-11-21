<template>
  <div class="profile-page">
    <div class="main-content">
      
      <!-- En-tête du profil -->
      <div class="profile-header-card">
        <div class="user-avatar-large">
          <span class="user-initials-large">{{ userInitials }}</span>
        </div>
        <div class="header-info">
          <h1 class="profile-title">{{ profile.displayName || 'Utilisateur' }}</h1>
          <p class="profile-subtitle">{{ profile.email }}</p>
        </div>
      </div>

      <!-- Navigation par onglets -->
      <div class="tabs-container">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-btn"
          :class="{ active: activeTab === tab.id }"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <!-- Contenu des onglets -->
      <div class="tab-content">
        
        <!-- Onglet Mon Compte -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'account'" class="content-card">
            
            <!-- Section Email -->
            <div class="account-section">
              <h2 class="section-title">Informations personnelles</h2>
              <form @submit.prevent="updateProfile" class="profile-form">
                <div class="form-group">
                  <label>Adresse email</label>
                  <input 
                    v-model="form.email" 
                    type="email" 
                    class="form-input"
                    placeholder="votre@email.com"
                  >
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Enregistrement...' : 'Enregistrer l\'email' }}
                  </button>
                </div>
              </form>
            </div>

            <div class="section-divider"></div>

            <!-- Section Sécurité -->
            <div class="account-section">
              <h2 class="section-title">Sécurité du compte</h2>
              <form @submit.prevent="updatePassword" class="profile-form">
                <div class="form-group">
                  <label>Mot de passe actuel</label>
                  <input 
                    v-model="passwordForm.currentPassword" 
                    type="password" 
                    class="form-input"
                    placeholder="••••••••"
                  >
                </div>
                <div class="form-row">
                  <div class="form-group half">
                    <label>Nouveau mot de passe</label>
                    <input 
                      v-model="passwordForm.newPassword" 
                      type="password" 
                      class="form-input"
                      placeholder="••••••••"
                    >
                  </div>
                  <div class="form-group half">
                    <label>Confirmer le mot de passe</label>
                    <input 
                      v-model="passwordForm.confirmPassword" 
                      type="password" 
                      class="form-input"
                      placeholder="••••••••"
                    >
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-primary" :disabled="loading">
                    {{ loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </transition>

        <!-- Onglet Abonnement & Commande -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'billing'" class="content-card">
            <h2 class="section-title">Abonnement & Commandes</h2>
            
            <div v-if="loadingSubscriptions" class="loading-state">
              Chargement des abonnements...
            </div>
            
            <div v-else-if="subscriptions.length === 0" class="empty-state">
              <div class="empty-icon">💳</div>
              <h3>Aucun abonnement actif</h3>
              <p>Vous n'avez pas encore souscrit à un abonnement.</p>
              <router-link to="/tarifs" class="btn btn-primary">Voir les offres</router-link>
            </div>

            <div v-else class="subscriptions-list">
              <div v-for="sub in subscriptions" :key="sub.id" class="subscription-card" :class="{ canceled: sub.status === 'canceled' }">
                <div class="subscription-header">
                  <div>
                    <h3 class="subscription-plan">{{ sub.plan_name || 'Abonnement Standard' }}</h3>
                    <span class="subscription-id">#{{ sub.stripe_subscription_id.slice(-8) }}</span>
                  </div>
                  <span class="subscription-status" :class="sub.status">
                    {{ sub.status === 'active' ? 'Actif' : 'Annulé' }}
                  </span>
                </div>

                <div class="subscription-details">
                  <div class="detail-row">
                    <span class="detail-label">Début de période</span>
                    <span class="detail-value">{{ formatDate(sub.current_period_start) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Fin de période</span>
                    <span class="detail-value">{{ formatDate(sub.current_period_end) }}</span>
                  </div>
                  <div v-if="sub.cancel_at_period_end" class="detail-row warning">
                    <span class="detail-label">Arrêt prévu le</span>
                    <span class="detail-value">{{ formatDate(sub.current_period_end) }}</span>
                  </div>
                </div>

                <div class="subscription-actions" v-if="sub.status === 'active' && !sub.cancel_at_period_end">
                  <button 
                    @click="cancelSubscription(sub.id)" 
                    class="btn btn-danger btn-sm"
                    :disabled="loading"
                  >
                    Annuler l'abonnement
                  </button>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- Onglet Support -->
        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'support'" class="content-card">
            <h2 class="section-title">Support & Aide</h2>
            <div class="support-grid">
              <div class="support-item">
                <div class="support-icon">📧</div>
                <h3>Contactez-nous</h3>
                <p>Une question ? Un problème ? Notre équipe est là pour vous aider.</p>
                <a href="mailto:support@solotext.com" class="btn btn-outline">Envoyer un email</a>
              </div>
              <div class="support-item">
                <div class="support-icon">📚</div>
                <h3>Documentation</h3>
                <p>Consultez notre documentation pour tirer le meilleur parti de SoloText.</p>
                <a href="#" class="btn btn-outline">Voir la documentation</a>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </div>

    <!-- Notifications -->
    <div class="notifications-container">
      <div v-for="notif in notifications" :key="notif.id" class="notification" :class="notif.type">
        {{ notif.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { http } from '../api/http'
import { endpoints } from '../api/endpoints'
import { useNotifications } from '../composables/useNotifications'

const { user, fetchUser } = useAuthStore()
const { notifications, success, error } = useNotifications()

// État des onglets
const activeTab = ref('account')
const tabs = [
  { id: 'account', label: 'Mon Compte', icon: '👤' },
  { id: 'billing', label: 'Abonnement & Commande', icon: '💳' },
  { id: 'support', label: 'Support', icon: '💬' }
]

// État des données
const loading = ref(false)
const loadingSubscriptions = ref(false)
const profile = ref({})
const subscriptions = ref([])

// Formulaires
const form = ref({
  email: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Computed
const userInitials = computed(() => {
  return user.value?.initials || profile.value.initials || 'U'
})

// Méthodes
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadProfile = async () => {
  try {
    const response = await http.get(endpoints.user.profile)
    if (response.success) {
      profile.value = response.data
      form.value.email = response.data.email || ''
    }
  } catch (err) {
    console.error('Erreur chargement profil:', err)
    error('Impossible de charger le profil')
  }
}

const loadSubscriptions = async () => {
  loadingSubscriptions.value = true
  try {
    const response = await http.get(endpoints.user.subscriptions)
    if (response.success) {
      subscriptions.value = response.data
    }
  } catch (err) {
    console.error('Erreur chargement abonnements:', err)
    error('Impossible de charger les abonnements')
  } finally {
    loadingSubscriptions.value = false
  }
}

const updateProfile = async () => {
  loading.value = true
  try {
    const response = await http.put(endpoints.user.updateProfile, {
      email: form.value.email
    })
    
    if (response.success) {
      success('Email mis à jour avec succès')
      await fetchUser() // Rafraîchir le store
    }
  } catch (err) {
    error(err.message || 'Erreur lors de la mise à jour')
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error('Les mots de passe ne correspondent pas')
    return
  }

  loading.value = true
  try {
    const response = await http.put(endpoints.user.updateProfile, {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })
    
    if (response.success) {
      success('Mot de passe modifié avec succès')
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    }
  } catch (err) {
    error(err.message || 'Erreur lors du changement de mot de passe')
  } finally {
    loading.value = false
  }
}

const cancelSubscription = async (subId) => {
  if (!confirm('Êtes-vous sûr de vouloir annuler cet abonnement ?')) return

  loading.value = true
  try {
    const response = await http.post(endpoints.user.cancelSubscription)
    if (response.success) {
      success('Abonnement annulé avec succès')
      await loadSubscriptions()
    }
  } catch (err) {
    error(err.message || 'Erreur lors de l\'annulation')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
  loadSubscriptions()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-top: 160px; /* Compensation header large */
  padding-bottom: 40px;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Card */
.profile-header-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.user-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  background: var(--gradient-btn);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(50, 196, 192, 0.3);
}

.user-initials-large {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.header-info {
  flex: 1;
}

.profile-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.profile-subtitle {
  color: #718096;
  font-size: 1.1rem;
}

/* Tabs Navigation */
.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 5px; /* Pour la scrollbar éventuelle */
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  white-space: nowrap;
}

.tab-btn:hover {
  background: #f8fafc;
  color: #32C4C0;
  transform: translateY(-2px);
}

.tab-btn.active {
  background: var(--gradient-btn);
  color: white;
  box-shadow: 0 4px 12px rgba(50, 196, 192, 0.3);
}

.tab-icon {
  font-size: 1.2rem;
}

/* Content Cards */
.content-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f1f5f9;
}

.section-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 3rem 0;
}

.account-section {
  margin-bottom: 2rem;
}

/* Forms */
.profile-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

label {
  display: block;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.2s;
  background: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #32c4c0;
  background: white;
  box-shadow: 0 0 0 3px rgba(50, 196, 192, 0.1);
}

.form-actions {
  margin-top: 2rem;
}

/* Buttons */
.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: var(--gradient-btn);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(50, 196, 192, 0.3);
}

.btn-danger {
  background: #fee2e2;
  color: #991b1b;
}

.btn-danger:hover {
  background: #fecaca;
}

.btn-outline {
  border: 2px solid #e2e8f0;
  background: transparent;
  color: #4a5568;
}

.btn-outline:hover {
  border-color: #32c4c0;
  color: #32c4c0;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Subscriptions */
.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.subscription-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.subscription-card:hover {
  border-color: #cbd5e0;
  transform: translateY(-2px);
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.subscription-plan {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.subscription-id {
  font-size: 0.8rem;
  color: #a0aec0;
  font-family: monospace;
}

.subscription-status {
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.subscription-status.active {
  background: #d1fae5;
  color: #065f46;
}

.subscription-status.canceled {
  background: #fee2e2;
  color: #991b1b;
}

.subscription-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-label {
  display: block;
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 0.2rem;
}

.detail-value {
  font-weight: 600;
  color: #2d3748;
}

.detail-row.warning .detail-value {
  color: #d97706;
}

/* Support Grid */
.support-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.support-item {
  background: #f8fafc;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

.support-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.support-item h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.support-item p {
  color: #718096;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .tabs-container {
    padding: 0 1rem 1rem;
  }

  .content-card {
    padding: 1.5rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1.5rem;
  }
}

/* Notifications */
.notifications-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.notification {
  padding: 16px 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
  pointer-events: auto;
  font-weight: 500;
  border-left: 4px solid;
  min-width: 300px;
}

.notification.success {
  border-left-color: #10b981;
  color: #065f46;
  background: #ecfdf5;
}

.notification.error {
  border-left-color: #ef4444;
  color: #991b1b;
  background: #fef2f2;
}

.notification.info {
  border-left-color: #3b82f6;
  color: #1e40af;
  background: #eff6ff;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
