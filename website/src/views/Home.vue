<template>
  <div class="home">
    <CommonHeader />
    <HomeHeader />
    <InfoBand />
    <OurMission />

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
import CommonHeader from '../components/CommonHeader.vue'
import HomeHeader from '../components/HomeHeader.vue'
import AppFooter from '../components/common/AppFooter.vue'
import InfoBand from '../components/InfoBand.vue'
import OurMission from '../components/home/OurMission.vue'
import Notification from '../components/Notification.vue'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../stores/authStore.js'

export default {
  name: 'Home',
  components: {
    CommonHeader,
    HomeHeader,
    InfoBand,
    OurMission,
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
