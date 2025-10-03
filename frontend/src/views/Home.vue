<template>
  <div class="home">
    <!-- Header -->
    <header class="header">
      <nav class="nav">
        <div class="nav-brand">
          <h1 class="logo">SoloText</h1>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Fonctionnalités</a>
          <a href="#pricing" class="nav-link">Tarifs</a>
          <a href="#contact" class="nav-link">Contact</a>
          <template v-if="!isAuthenticated">
            <router-link to="/login" class="btn btn-outline">Se connecter</router-link>
            <router-link to="/register" class="btn btn-primary">S'inscrire</router-link>
          </template>
          <template v-else>
            <UserIndicator @logout="handleLogout" />
          </template>
        </div>
      </nav>
    </header>

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
            <router-link to="/register" class="btn btn-primary btn-large">Essayer gratuitement</router-link>
            <router-link to="/login" class="btn btn-secondary btn-large">Se connecter</router-link>
          </template>
          <template v-else>
            <button class="btn btn-primary btn-large">Accéder au tableau de bord</button>
            <button class="btn btn-secondary btn-large">Voir mes analyses</button>
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

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="container">
        <h2 class="section-title">Pourquoi choisir SoloText ?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Rapide et efficace</h3>
            <p>Interface intuitive et réactive pour une productivité maximale</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔒</div>
            <h3>Sécurisé</h3>
            <p>Vos données sont protégées avec un chiffrement de niveau entreprise</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🌐</div>
            <h3>Collaboratif</h3>
            <p>Partagez et collaborez en temps réel avec votre équipe</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Multi-plateforme</h3>
            <p>Accessible sur tous vos appareils, partout dans le monde</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing">
      <div class="container">
        <h2 class="section-title">Tarifs simples et transparents</h2>
        <div class="pricing-grid">
          <div class="pricing-card">
            <h3>Gratuit</h3>
            <div class="price">
              <span class="currency">€</span>
              <span class="amount">0</span>
              <span class="period">/mois</span>
            </div>
            <ul class="features-list">
              <li>5 documents</li>
              <li>1 Go de stockage</li>
              <li>Support email</li>
            </ul>
            <button class="btn btn-outline">Commencer</button>
          </div>
          <div class="pricing-card featured">
            <div class="badge">Populaire</div>
            <h3>Pro</h3>
            <div class="price">
              <span class="currency">€</span>
              <span class="amount">19</span>
              <span class="period">/mois</span>
            </div>
            <ul class="features-list">
              <li>Documents illimités</li>
              <li>100 Go de stockage</li>
              <li>Collaboration en temps réel</li>
              <li>Support prioritaire</li>
            </ul>
            <button class="btn btn-primary">Essayer Pro</button>
          </div>
          <div class="pricing-card">
            <h3>Entreprise</h3>
            <div class="price">
              <span class="currency">€</span>
              <span class="amount">49</span>
              <span class="period">/mois</span>
            </div>
            <ul class="features-list">
              <li>Tout de Pro</li>
              <li>Stockage illimité</li>
              <li>API avancée</li>
              <li>Support dédié</li>
            </ul>
            <button class="btn btn-outline">Nous contacter</button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="container">
        <h2>Prêt à commencer ?</h2>
        <p>Rejoignez des milliers d'utilisateurs qui font confiance à SoloText</p>
        <button class="btn btn-primary btn-large">Commencer maintenant</button>
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
              <a href="#">Fonctionnalités</a>
              <a href="#">Tarifs</a>
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
import UserIndicator from '../components/UserIndicator.vue'
import Notification from '../components/Notification.vue'
import { useNotifications } from '../composables/useNotifications.js'
import { useAuthStore } from '../stores/authStore.js'

export default {
  name: 'Home',
  components: {
    UserIndicator,
    Notification
  },
  setup() {
    const { isAuthenticated, user, logout, subscribe } = useAuthStore()
    const { notifications, removeNotification, success, error } = useNotifications()

    const handleLogout = async () => {
      const userName = user.value?.displayName || 'Utilisateur'
      await logout()
      success(`Au revoir ${userName} ! Vous avez été déconnecté.`)
    }

    onMounted(() => {
      // S'abonner aux changements d'authentification
      const unsubscribe = subscribe(() => {
        // Notification de connexion
        if (isAuthenticated.value) {
          success(`Bienvenue ${user.value?.displayName || 'Utilisateur'} ! Vous êtes maintenant connecté.`)
        }
      })
      
      // Smooth scrolling pour les liens d'ancrage
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault()
          const target = document.querySelector(this.getAttribute('href'))
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
          }
        })
      })
      
      // Nettoyer l'abonnement
      onUnmounted(() => {
        unsubscribe()
      })
    })

    return {
      isAuthenticated,
      user,
      handleLogout,
      notifications,
      removeNotification
    }
  }
}
</script>
