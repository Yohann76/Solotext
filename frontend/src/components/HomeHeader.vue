<template>
  <div class="hero-wrap">
    <section class="hero">
      <div class="hero-inner">
      <div class="hero-content">
      <h1 class="hero-title">
      Surveillez votre contenu en ligne<span class="title-accent">en ligne</span>
      </h1>
      <p class="hero-description">
        Simple, flexible et 100% Français, SoloText est un outil pour surveillez la visibilité de vos textes partout sur le web (Chaque phrase est une recherche intégral sur le web)
      </p>

      <ul class="icon-list">
        <li class="icon-item">
          <span class="icon-svg" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
              <g clip-path="url(#clip0_3670_1196)">
                <mask id="mask0_3670_1196" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="17">
                  <path d="M16 0.0507812H0V16.0508H16V0.0507812Z" fill="white"></path>
                </mask>
                <g mask="url(#mask0_3670_1196)">
                  <path d="M14.6673 7.43752V8.05085C14.6665 9.48847 14.201 10.8873 13.3402 12.0388C12.4794 13.1902 11.2695 14.0325 9.89089 14.4401C8.51227 14.8478 7.03882 14.7988 5.6903 14.3006C4.34177 13.8024 3.19042 12.8816 2.40796 11.6756C1.6255 10.4696 1.25385 9.04289 1.34844 7.60839C1.44303 6.17389 1.99879 4.8084 2.93284 3.71557C3.86689 2.62273 5.12917 1.86111 6.53144 1.54428C7.9337 1.22746 9.40083 1.37241 10.714 1.95752" stroke="#32C4C0" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M14.6667 2.71753L8 9.39086L6 7.39086" stroke="#32C4C0" stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
              </g>
              <defs>
                <clipPath id="clip0_3670_1196">
                  <rect width="16" height="16" fill="white" transform="translate(0 0.0507812)"></rect>
                </clipPath>
              </defs>
            </svg>
          </span>
          <span class="icon-text">Inscription gratuite</span>
        </li>
        <li class="icon-item">
          <span class="icon-svg" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
              <g clip-path="url(#clip0_3670_1196)">
                <mask id="mask0_3670_1196" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="17">
                  <path d="M16 0.0507812H0V16.0508H16V0.0507812Z" fill="white"></path>
                </mask>
                <g mask="url(#mask0_3670_1196)">
                  <path d="M14.6673 7.43752V8.05085C14.6665 9.48847 14.201 10.8873 13.3402 12.0388C12.4794 13.1902 11.2695 14.0325 9.89089 14.4401C8.51227 14.8478 7.03882 14.7988 5.6903 14.3006C4.34177 13.8024 3.19042 12.8816 2.40796 11.6756C1.6255 10.4696 1.25385 9.04289 1.34844 7.60839C1.44303 6.17389 1.99879 4.8084 2.93284 3.71557C3.86689 2.62273 5.12917 1.86111 6.53144 1.54428C7.9337 1.22746 9.40083 1.37241 10.714 1.95752" stroke="#32C4C0" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path d="M14.6667 2.71753L8 9.39086L6 7.39086" stroke="#32C4C0" stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
              </g>
              <defs>
                <clipPath id="clip0_3670_1196">
                  <rect width="16" height="16" fill="white" transform="translate(0 0.0507812)"></rect>
                </clipPath>
              </defs>
            </svg>
          </span>
          <span class="icon-text">Vos données sont protégées</span>
        </li>
      </ul>
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
      <!--
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
      -->
      </div>
        <div class="hero-image">
          <img :src="heroIllustration" alt="SoloText illustration" class="hero-illustration" />
        </div>
      </div>
    </section>
  </div>
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
.hero-wrap { width: 100%; background: var(--gradient-section); }

.hero {
  padding: 160px 0 96px; /* pas de marge blanche latérale */
  width: 100%;
  color: #ffffff;
}

.hero-inner {
  max-width: 1600px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 6rem;
  align-items: center;
  padding: 0 4rem; /* respiration interne, fond reste plein écran */
}

.hero-title {
  font-family: "Neulis Alt", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-size: 88px;
  font-weight: 700;
  line-height: 1.15em;
  margin: 0 0 1.5rem;
  max-width: 100%;
}

.title-accent { color: var(--color-primary); margin-left: 8px; }

.hero-description {
  color: rgba(255, 255, 255, 0.92);
  font-size: 1.25rem;
  line-height: 1.6;
  margin: 0 0 2rem;
  max-width: 90%;
}

.icon-list { display: flex; gap: 28px; align-items: center; flex-wrap: nowrap; margin: 0 0 32px; padding: 0; list-style: none; }
.icon-item { display: inline-flex; gap: 12px; align-items: center; white-space: nowrap; }
.icon-svg { width: 20px; height: 20px; flex-shrink: 0; }
.icon-text { color: #ffffff; font-weight: 600; font-size: 1rem; }

.hero-actions {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
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
  padding: 1.1rem 1.8rem;
  font-size: 1.1rem;
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
  justify-content: flex-end;
}

.hero-illustration {
  width: 100%;
  max-width: none;
  height: auto;
  min-width: 400px;
  filter: drop-shadow(0 20px 50px rgba(7, 60, 53, 0.25));
}

@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero { padding-top: 140px; }
  .hero-image { order: -1; margin-bottom: 1.5rem; }
}

@media (max-width: 640px) {
  .hero-title { font-size: 40px; }
  .hero-description { font-size: 1rem; }
  .hero-actions { flex-direction: column; align-items: flex-start; }
}
</style>


