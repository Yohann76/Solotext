<template>
  <div class="page features-page">
    <CommonHeader />
    <section class="hero simple">
      <div class="container">
        <h1>Fonctionnalités</h1>
        <p>Découvrez tout ce que SoloText offre pour créer, organiser et analyser vos textes.</p>
        <div class="cta-row">
          <router-link to="/login" class="btn btn-secondary">Connexion</router-link>
          <router-link to="/register" class="btn btn-primary">Rejoindre l'aventure</router-link>
        </div>
      </div>
    </section>

    <section class="features-grid container">
      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Rapide et efficace</h3>
        <p>Interface intuitive et réactive pour une productivité maximale.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🔒</div>
        <h3>Sécurisé</h3>
        <p>Authentification JWT, bonnes pratiques RGPD et chiffrement.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Analyses avancées</h3>
        <p>Moteur d'analyse IA avec workers asynchrones.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🌐</div>
        <h3>Collaboratif</h3>
        <p>Partage et collaboration en temps réel.</p>
      </div>
    </section>

    <footer class="section container cta">
      <h2>Prêt à essayer SoloText ?</h2>
      <div class="cta-row">
        <router-link to="/register" class="btn btn-primary btn-large">Rejoindre l'aventure</router-link>
        <router-link to="/login" class="btn btn-outline btn-large">Connexion</router-link>
      </div>
    </footer>
  </div>
</template>

<script setup>
import CommonHeader from '../components/CommonHeader.vue'
</script>
