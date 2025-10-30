<template>
  <div class="home">
    <!-- Header -->
    <CommonHeader />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Gérez vos textes avec 
          <span class="gradient-text">SoloText</span> 🔥
        </h1>
        <p class="hero-description">
          La solution SaaS moderne pour organiser, éditer et partager vos documents texte. 
          Simple, rapide et puissant.
        </p>
        <div class="hero-actions">
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="btn btn-secondary btn-large">Connexion</router-link>
            <router-link to="/register" class="btn btn-primary btn-large">Rejoindre l'aventure</router-link>
          </template>
          <template v-else>
            <router-link to="/application" class="btn btn-primary btn-large">Accéder au tableau de bord</router-link>
            <router-link to="/application" class="btn btn-secondary btn-large">Voir mes analyses</router-link>
          </template>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">10k+</span>
            <span class="stat-label">Utilisateurs actifs</span>
          </div>
          <div class="stat">
            <span class="stat-number">1M+</span>
            <span class="stat-label">Documents créés</span>
          </div>
          <div class="stat">
            <span class="stat-number">99.9%</span>
            <span class="stat-label">Disponibilité</span>
          </div>
        </div>
      </div>
      <div class="hero-image">
        <div class="mockup">
          <div class="mockup-header">
            <div class="mockup-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <div class="mockup-content">
            <div class="mockup-text">
              <div class="text-line"></div>
              <div class="text-line"></div>
              <div class="text-line short"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

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
            <p>La solution moderne pour gérer vos textes</p>
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
import CommonHeader from '../components/CommonHeader.vue'
import Notification from '../components/Notification.vue'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../stores/authStore.js'

export default {
  name: 'Home',
  components: {
    CommonHeader,
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
