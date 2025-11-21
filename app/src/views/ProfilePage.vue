<template>
  <div class="profile-page">
    <CommonHeader />
    
    <main class="main-content">
      <div class="profile-container">
        <div class="profile-header">
          <div class="user-avatar-large">
            <span class="user-initials-large">{{ userInitials }}</span>
          </div>
          <h1 class="profile-title">Mon Profil</h1>
          <p class="profile-subtitle">Gérez vos informations personnelles et vos abonnements</p>
        </div>

        <!-- Informations du profil -->
        <div class="profile-section">
          <h2 class="section-title">📋 Informations personnelles</h2>
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">Email</span>
              <span class="info-value">{{ profile.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Rôle</span>
              <span class="info-badge" :class="profile.role">
                {{ profile.roleFormatted }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Membre depuis</span>
              <span class="info-value">{{ formatDate(profile.createdAt) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Âge du compte</span>
              <span class="info-value">{{ profile.accountAge }} jours</span>
            </div>
          </div>
        </div>

        <!-- Changer le mot de passe -->
        <div class="profile-section">
          <h2 class="section-title">🔒 Sécurité</h2>
          <div class="password-card">
            <form @submit.prevent="changePassword" class="password-form">
              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="form-input"
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="form-input"
                  placeholder="Entrez votre nouveau mot de passe"
                />
              </div>
              <div class="form-group">
                <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="form-input"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>
              <button type="submit" class="btn btn-primary" :disabled="loadingPassword">
                {{ loadingPassword ? 'Modification...' : 'Changer le mot de passe' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Abonnements -->
        <div class="profile-section">
          <h2 class="section-title">💳 Mes abonnements</h2>
          <div v-if="loadingSubscriptions" class="loading-state">
            Chargement des abonnements...
          </div>
          <div v-else-if="subscriptions.length === 0" class="empty-state">
            <p>Vous n'avez aucun abonnement actif</p>
            <router-link to="/tarifs" class="btn btn-primary">
              Voir les tarifs
            </router-link>
          </div>
          <div v-else class="subscriptions-list">
            <div
              v-for="subscription in subscriptions"
              :key="subscription.id"
              class="subscription-card"
              :class="subscription.status"
            >
              <div class="subscription-header">
                <h3 class="subscription-plan">{{ formatPlanType(subscription.plan_type) }}</h3>
                <span class="subscription-status" :class="subscription.status">
                  {{ formatStatus(subscription.status) }}
                </span>
              </div>
              <div class="subscription-details">
                <div class="detail-row">
                  <span class="detail-label">Début</span>
                  <span class="detail-value">{{ formatDate(subscription.start_date) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Période actuelle</span>
                  <span class="detail-value">
                    {{ formatDate(subscription.current_period_start) }} - {{ formatDate(subscription.current_period_end) }}
                  </span>
                </div>
                <div v-if="subscription.cancel_at_period_end" class="detail-row warning">
                  <span class="detail-label">⚠️ Annulation prévue</span>
                  <span class="detail-value">{{ formatDate(subscription.current_period_end) }}</span>
                </div>
              </div>
              <div v-if="subscription.status === 'active' && !subscription.cancel_at_period_end" class="subscription-actions">
                <button @click="cancelSubscription(subscription)" class="btn btn-danger">
                  Annuler l'abonnement
                </button>
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
import { useAuthStore } from '../stores/authStore'
import { useNotifications } from '../composables/useNotifications'
import { http } from '../api/http'
import { endpoints } from '../api/endpoints'

export default {
  name: 'ProfilePage',
  components: {
    CommonHeader,
    Notification
  },
  setup() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuthStore()
    const { notifications, removeNotification, success, error } = useNotifications()

    const profile = ref({
      email: '',
      role: '',
      roleFormatted: '',
      displayName: '',
      initials: '',
      accountAge: 0,
      createdAt: null,
      updatedAt: null
    })

    const subscriptions = ref([])
    const loadingSubscriptions = ref(false)
    const loadingPassword = ref(false)

    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const userInitials = computed(() => {
      // Utiliser les initiales du store pour être cohérent avec le header
      return user.value?.initials || profile.value.initials || 'U'
    })

    // Charger le profil
    const loadProfile = async () => {
      try {
        const response = await http.get(endpoints.user.profile)
        if (response.success) {
          profile.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err)
        error('Erreur lors du chargement du profil')
      }
    }

    // Charger les abonnements
    const loadSubscriptions = async () => {
      try {
        loadingSubscriptions.value = true
        const response = await http.get(endpoints.user.subscriptions)
        if (response.success) {
          subscriptions.value = response.data
        }
      } catch (err) {
        console.error('Erreur lors du chargement des abonnements:', err)
        error('Erreur lors du chargement des abonnements')
      } finally {
        loadingSubscriptions.value = false
      }
    }

    // Changer le mot de passe
    const changePassword = async () => {
      if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
        error('Veuillez remplir tous les champs')
        return
      }

      if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        error('Les mots de passe ne correspondent pas')
        return
      }

      if (passwordForm.value.newPassword.length < 6) {
        error('Le mot de passe doit contenir au moins 6 caractères')
        return
      }

      try {
        loadingPassword.value = true
        const response = await http.put(endpoints.user.updateProfile, {
          currentPassword: passwordForm.value.currentPassword,
          newPassword: passwordForm.value.newPassword
        })

        if (response.success) {
          success('Mot de passe modifié avec succès')
          passwordForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }
      } catch (err) {
        console.error('Erreur lors du changement de mot de passe:', err)
        error(err.message || 'Erreur lors du changement de mot de passe')
      } finally {
        loadingPassword.value = false
      }
    }

    // Annuler un abonnement
    const cancelSubscription = async (subscription) => {
      if (!confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Il restera actif jusqu\'à la fin de la période en cours.')) {
        return
      }

      try {
        const response = await http.post(endpoints.user.cancelSubscription)
        if (response.success) {
          success('Votre abonnement sera annulé à la fin de la période en cours')
          await loadSubscriptions()
        }
      } catch (err) {
        console.error('Erreur lors de l\'annulation:', err)
        error('Erreur lors de l\'annulation de l\'abonnement')
      }
    }

    // Formater une date
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Formater le type de plan
    const formatPlanType = (planType) => {
      const plans = {
        'basic': 'Plan Basic',
        'premium': 'Plan Premium',
        'pro': 'Plan Pro'
      }
      return plans[planType] || planType
    }

    // Formater le statut
    const formatStatus = (status) => {
      const statuses = {
        'active': '✅ Actif',
        'canceled': '❌ Annulé',
        'past_due': '⚠️ En retard',
        'unpaid': '⚠️ Impayé'
      }
      return statuses[status] || status
    }

    onMounted(async () => {
      if (!isAuthenticated.value) {
        router.push('/login')
        return
      }

      await Promise.all([
        loadProfile(),
        loadSubscriptions()
      ])
    })

    return {
      profile,
      subscriptions,
      loadingSubscriptions,
      loadingPassword,
      passwordForm,
      userInitials,
      notifications,
      removeNotification,
      changePassword,
      cancelSubscription,
      formatDate,
      formatPlanType,
      formatStatus
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.main-content {
  padding: 2rem 1rem;
  padding-top: 150px; /* Compensation pour le header fixe (130px + marge) */
  max-width: 1200px;
  margin: 0 auto;
}

.profile-container {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e2e8f0;
}

.user-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--gradient-btn);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 24px rgba(3, 24, 21, 0.3);
}

.user-initials-large {
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.profile-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.profile-subtitle {
  color: #718096;
  font-size: 1.125rem;
}

.profile-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-card,
.password-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #2d3748;
}

.info-value {
  color: #4a5568;
}

.info-badge {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.info-badge.admin {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.info-badge.user {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #32c4c0;
  box-shadow: 0 0 0 3px rgba(50, 196, 192, 0.1);
}

.subscriptions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.subscription-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
  border-left: 4px solid #32c4c0;
  border: 1px solid #e2e8f0;
  border-left: 4px solid #32c4c0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.subscription-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.subscription-card.canceled {
  border-left-color: #ef4444;
  opacity: 0.8;
}

.subscription-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.subscription-plan {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.subscription-status {
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.subscription-status.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.subscription-status.canceled {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.subscription-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row.warning {
  color: #f59e0b;
  font-weight: 600;
}

.detail-label {
  font-weight: 600;
  color: #2d3748;
}

.detail-value {
  color: #4a5568;
}

.subscription-actions {
  display: flex;
  gap: 1rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 2px dashed #cbd5e0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #32c4c0 0%, #2aada9 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(50, 196, 192, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.notifications-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
    padding-top: 140px;
  }

  .profile-container {
    padding: 2rem 1.5rem;
  }

  .profile-title {
    font-size: 2rem;
  }

  .user-avatar-large {
    width: 100px;
    height: 100px;
  }

  .user-initials-large {
    font-size: 2.5rem;
  }

  .subscription-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
