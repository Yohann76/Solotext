<template>
  <div class="page pricing-page">
    <section class="hero simple">
      <div class="container">
        <h1>Tarifs simples et transparents</h1>
        <p>Choisissez le forfait qui correspond à vos besoins. Commencez gratuitement.</p>
      </div>
    </section>

    <section class="pricing">
      <div class="container">
        <div class="pricing-grid">
        <!-- Forfait Gratuit (Freemium) -->
        <div class="pricing-card">
          <h3>Freemium</h3>
          <div class="price">
            <span class="currency">€</span>
            <span class="amount">0</span>
            <span class="period">/mois</span>
          </div>
          <ul class="features-list">
            <li>✅ 200 phrases</li>
            <li>✅ Analyses illimitées</li>
            <li>✅ Détection de duplication</li>
            <li>✅ Support email</li>
          </ul>
          <a :href="`${appBaseUrl}/register`" class="btn btn-outline">
            Accéder au paiement dans l'application
          </a>
        </div>

        <!-- Forfait Pro (Premium1000) -->
        <div class="pricing-card featured">
          <div class="badge">Populaire</div>
          <h3>Pro</h3>
          <div class="price">
            <span class="currency">€</span>
            <span class="amount">8,99</span>
            <span class="period">/mois</span>
          </div>
          <ul class="features-list">
            <li>✅ 1 000 phrases/mois</li>
            <li>✅ Analyses illimitées</li>
            <li>✅ Détection de duplication</li>
            <li>✅ Support prioritaire</li>
            <li>✅ Export PDF</li>
          </ul>
          <a :href="`${appBaseUrl}/tarifs?plan=premium1000`" class="btn btn-primary">
            Accéder au paiement dans l'application
          </a>
        </div>

        <!-- Forfait Enterprise (Premium3000) -->
        <div class="pricing-card">
          <h3>Enterprise</h3>
          <div class="price">
            <span class="currency">€</span>
            <span class="amount">22,99</span>
            <span class="period">/mois</span>
          </div>
          <ul class="features-list">
            <li>✅ 3 000 phrases/mois</li>
            <li>✅ Analyses illimitées</li>
            <li>✅ Détection de duplication</li>
            <li>✅ Support prioritaire</li>
            <li>✅ Export PDF</li>
            <li>✅ API access</li>
          </ul>
          <a :href="`${appBaseUrl}/tarifs?plan=premium3000`" class="btn btn-outline">
            Accéder au paiement dans l'application
          </a>
        </div>

        <!-- Forfait Agence (Premium6000) -->
        <div class="pricing-card">
          <h3>Agence</h3>
          <div class="price">
            <span class="currency">€</span>
            <span class="amount">42,99</span>
            <span class="period">/mois</span>
          </div>
          <ul class="features-list">
            <li>✅ 6 000 phrases/mois</li>
            <li>✅ Analyses illimitées</li>
            <li>✅ Détection de duplication</li>
            <li>✅ Support dédié</li>
            <li>✅ Export PDF</li>
            <li>✅ API access</li>
            <li>✅ Gestion multi-utilisateurs</li>
          </ul>
          <a :href="`${appBaseUrl}/tarifs?plan=premium6000`" class="btn btn-outline">
            Accéder au paiement dans l'application
          </a>
        </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// URL vers l'application pour les tarifs
const appBaseUrl = import.meta.env.VITE_APP_URL || 'http://51.178.80.14:8080'
</script>

<style scoped>
.pricing-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.hero.simple {
  padding: 2rem 0 1rem 0;
  text-align: center;
  background: transparent;
  margin-bottom: 0;
  min-height: auto;
}

.hero.simple h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.hero.simple p {
  font-size: 1.25rem;
  color: #718096;
}

.pricing {
  padding: 2rem 0;
  margin-top: 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 2px solid #e2e8f0;
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.pricing-card.featured {
  border-color: #32c4c0;
  transform: scale(1.05);
}

.badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #32c4c0 0%, #2aada9 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(50, 196, 192, 0.3);
}

.pricing-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #2d3748;
  text-align: center;
}

.price {
  text-align: center;
  margin-bottom: 2rem;
}

.currency {
  font-size: 1.5rem;
  color: #718096;
  vertical-align: top;
}

.amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0.25rem;
}

.period {
  font-size: 1rem;
  color: #718096;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  flex: 1;
  text-align: left;
}

.features-list li {
  padding: 0.5rem 0;
  color: #4a5568;
  font-size: 0.9rem;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
}

.features-list li:last-child {
  border-bottom: none;
}

.btn {
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #32c4c0 0%, #2aada9 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(50, 196, 192, 0.4);
}

.btn-outline {
  background: white;
  color: #32c4c0;
  border: 2px solid #32c4c0;
}

.btn-outline:hover:not(:disabled) {
  background: #f0f9ff;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 1600px) {
  .pricing-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 1200px) {
  .pricing-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .pricing-card.featured {
    transform: scale(1);
  }
  
  .hero.simple h1 {
    font-size: 2rem;
  }
}
</style>
