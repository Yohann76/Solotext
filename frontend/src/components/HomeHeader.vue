<template>
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
      <img :src="heroIllustration" alt="SoloText illustration" class="hero-illustration" />
    </div>
  </section>
</template>

<script>
import { useAuthStore } from '../stores/authStore.js'
import heroIllustration from '../assets/undraw_svg/undraw_file-bundle_oaof.svg'

export default {
  name: 'HomeHeader',
  setup() {
    const { isAuthenticated } = useAuthStore()
    return { isAuthenticated, heroIllustration }
  }
}
</script>

<style scoped>
.hero {
  padding: 140px 2rem 80px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 3rem;
}

.hero-title {
  font-size: 3rem;
  line-height: 1.1;
  margin: 0 0 1rem;
}

.gradient-text {
  background: var(--gradient-section);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  color: #4a5568;
  font-size: 1.125rem;
  margin: 0 0 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.25s ease;
  border: 2px solid transparent;
  cursor: pointer;
}

.btn-large {
  padding: 1rem 1.4rem;
  font-size: 1.05rem;
}

.btn-primary {
  background: var(--gradient-btn);
  color: #fff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(7, 60, 53, 0.35);
}

.btn-secondary {
  border-color: var(--color-accent);
  color: var(--color-accent);
  background: #ffffff;
}

.btn-secondary:hover {
  background: #073C35;
  color: #ffffff;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

.stat {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-weight: 800;
  font-size: 1.25rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.hero-image {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-illustration {
  width: 100%;
  max-width: 560px;
  height: auto;
  filter: drop-shadow(0 20px 50px rgba(7, 60, 53, 0.25));
}

@media (max-width: 1024px) {
  .hero { grid-template-columns: 1fr; }
  .hero { padding-top: 120px; }
  .hero-image { order: -1; margin-bottom: 1.5rem; }
}

@media (max-width: 640px) {
  .hero-title { font-size: 2.2rem; }
  .hero-description { font-size: 1rem; }
  .hero-actions { flex-direction: column; align-items: flex-start; }
}
</style>


