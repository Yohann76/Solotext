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

    <!-- Footer -->
    <footer id="contact" class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <h3>SoloText</h3>
            <p>Soyez le seul à posséder votre contenu</p>
          </div>
          <div class="footer-links">
            <div class="footer-column">
              <h4>Produit</h4>
              <router-link to="/fonctionnalites">Fonctionnalités</router-link>
              <router-link to="/tarifs">Tarifs</router-link>
              <a href="#">API</a>
            </div>
            <div class="footer-column">
              <h4>Support</h4>
              <a href="#">Documentation</a>
              <a href="#">Aide</a>
              <a href="#">Contact</a>
            </div>
            <div class="footer-column">
              <h4>Entreprise</h4>
              <a href="#">À propos</a>
              <a href="#">Blog</a>
              <a href="#">Carrières</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 SoloText. Tous droits réservés.</p>
        </div>
      </div>
    </footer>

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
import InfoBand from '../components/InfoBand.vue'
import Notification from '../components/Notification.vue'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../stores/authStore.js'

export default {
  name: 'Home',
  components: {
    HomeHeader,
    InfoBand,
    Notification
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
