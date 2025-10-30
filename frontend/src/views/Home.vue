<template>
  <div class="home">
    <HomeHeader />
    <InfoBand />

    <!-- CTA section for Features & Pricing -->
    <section class="cta">
      <div class="container">
        <h2>Découvrez SoloText</h2>
        <div class="cta-row">
          <router-link to="/fonctionnalites" class="btn btn-outline btn-large">Fonctionnalités</router-link>
          <router-link to="/tarifs" class="btn btn-outline btn-large">Tarifs</router-link>
        </div>
      </div>
    </section>

    <AppFooter />

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
import { ref, onMounted, onUnmounted } from 'vue'
import HomeHeader from '../components/HomeHeader.vue'
import AppFooter from '../components/common/AppFooter.vue'
import InfoBand from '../components/InfoBand.vue'
import Notification from '../components/Notification.vue'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../stores/authStore.js'

export default {
  name: 'Home',
  components: {
    HomeHeader,
    InfoBand,
    Notification,
    AppFooter
  },
  setup() {
    const { isAuthenticated, user, subscribe } = useAuthStore()
    const { notifications, removeNotification, success, error } = useNotifications()

    onMounted(() => {
      // S'abonner aux changements d'authentification
      const unsubscribe = subscribe(() => {
        if (isAuthenticated.value) {
          success(`Bienvenue ${user.value?.displayName || 'Utilisateur'} ! Vous êtes maintenant connecté.`)
        }
      })

      // Nettoyer l'abonnement
      onUnmounted(() => {
        unsubscribe()
      })
    })

    return {
      isAuthenticated,
      user,
      notifications,
      removeNotification
    }
  }
}
</script>
