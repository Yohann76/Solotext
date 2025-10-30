<template>
  <div class="page pricing-page">

    <section class="hero simple">
      <div class="container">
        <h1>Tarifs simples et transparents</h1>
        <p>Commencez gratuitement. Passez à Pro quand vous êtes prêt.</p>
        <div class="cta-row">
          <router-link to="/login" class="btn btn-secondary">Connexion</router-link>
          <router-link to="/register" class="btn btn-primary">Rejoindre l'aventure</router-link>
        </div>
      </div>
    </section>

    <section class="pricing container">
      <div class="pricing-grid">
        <div class="pricing-card">
          <h3>Gratuit</h3>
          <div class="price"><span class="currency">€</span><span class="amount">0</span><span class="period">/mois</span></div>
          <ul>
            <li>5 documents</li>
            <li>1 Go stockage</li>
            <li>Support email</li>
          </ul>
          <router-link to="/register" class="btn btn-outline">Commencer</router-link>
        </div>
        <div class="pricing-card featured">
          <div class="badge">Populaire</div>
          <h3>Pro</h3>
          <div class="price"><span class="currency">€</span><span class="amount">19</span><span class="period">/mois</span></div>
          <ul>
            <li>Documents illimités</li>
            <li>100 Go stockage</li>
            <li>Collaboration temps réel</li>
            <li>Support prioritaire</li>
          </ul>
          <router-link to="/register" class="btn btn-primary">Essayer Pro</router-link>
        </div>
        <div class="pricing-card">
          <h3>Entreprise</h3>
          <div class="price"><span class="currency">€</span><span class="amount">49</span><span class="period">/mois</span></div>
          <ul>
            <li>API avancée</li>
            <li>Stockage illimité</li>
            <li>Support dédié</li>
          </ul>
          <router-link to="/contact" class="btn btn-outline">Nous contacter</router-link>
        </div>
      </div>
    </section>

    <footer class="section container cta">
      <h2>Prêt à commencer ?</h2>
      <div class="cta-row">
        <router-link to="/register" class="btn btn-primary btn-large">Rejoindre l'aventure</router-link>
        <router-link to="/login" class="btn btn-outline btn-large">Connexion</router-link>
      </div>
    </footer>

  </div>
</template>

<script setup>
// header & footer injectés par PublicLayout
</script>
