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
          <router-link 
            v-if="!isAuthenticated" 
            to="/register" 
            class="btn btn-outline"
          >
            Commencer gratuitement
          </router-link>
          <div v-else class="current-plan-badge">
            <span v-if="currentPlan === 'freemium'">Plan actuel</span>
            <span v-else>Déjà inclus</span>
          </div>
        </div>

        <!-- Forfait Pro (Premium1000) -->
        <div class="pricing-card" :class="{ 'featured': currentPlan !== 'premium1000' }">
          <div v-if="currentPlan !== 'premium1000'" class="badge">Populaire</div>
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
          <button 
            v-if="!isAuthenticated"
            @click="handleSubscribe('premium1000', '/register')"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Choisir Pro' }}
          </button>
          <button 
            v-else-if="currentPlan !== 'premium1000'"
            @click="handleSubscribe('premium1000')"
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Upgrader vers Pro' }}
          </button>
          <div v-else class="current-plan-badge">
            <span>Plan actuel</span>
          </div>
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
          <button 
            v-if="!isAuthenticated"
            @click="handleSubscribe('premium3000', '/register')"
            class="btn btn-outline"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Choisir Enterprise' }}
          </button>
          <button 
            v-else-if="currentPlan !== 'premium3000'"
            @click="handleSubscribe('premium3000')"
            class="btn btn-outline"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Upgrader vers Enterprise' }}
          </button>
          <div v-else class="current-plan-badge">
            <span>Plan actuel</span>
          </div>
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
          <button 
            v-if="!isAuthenticated"
            @click="handleSubscribe('premium6000', '/register')"
            class="btn btn-outline"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Choisir Agence' }}
          </button>
          <button 
            v-else-if="currentPlan !== 'premium6000'"
            @click="handleSubscribe('premium6000')"
            class="btn btn-outline"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Upgrader vers Agence' }}
          </button>
          <div v-else class="current-plan-badge">
            <span>Plan actuel</span>
          </div>
        </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'
import { useNotifications } from '../composables/useNotifications.js'
import stripeService from '../services/stripe.js'

const router = useRouter()
const { isAuthenticated, user } = useAuthStore()
const { success, error } = useNotifications()

const loading = ref(false)
const subscription = ref(null)

// Déterminer le plan actuel
const currentPlan = computed(() => {
  if (!subscription.value) {
    // Si pas d'abonnement Stripe, vérifier le rôle
    if (user.value?.role === 'premium1000') return 'premium1000'
    if (user.value?.role === 'premium3000') return 'premium3000'
    if (user.value?.role === 'premium6000') return 'premium6000'
    return 'freemium'
  }
  return subscription.value.plan_type || 'freemium'
})

// Charger l'abonnement actuel
const loadSubscription = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const result = await stripeService.getSubscription()
    if (result.success && result.data.subscription) {
      subscription.value = result.data.subscription
    }
  } catch (err) {
    console.error('Erreur lors du chargement de l\'abonnement:', err)
  }
}

// Gérer l'abonnement
const handleSubscribe = async (planType, redirectPath = null) => {
  if (!isAuthenticated.value && redirectPath) {
    // Rediriger vers l'inscription avec le plan en paramètre
    router.push(`${redirectPath}?plan=${planType}`)
    return
  }

  if (!isAuthenticated.value) {
    router.push(`/register?plan=${planType}`)
    return
  }

  loading.value = true

  try {
    // Créer une session de checkout Stripe
    const result = await stripeService.createCheckoutSession(planType)
    
    if (result.success && result.data.checkoutUrl) {
      // Rediriger vers Stripe Checkout
      window.location.href = result.data.checkoutUrl
    } else {
      error(result.message || 'Erreur lors de la création de la session de paiement')
    }
  } catch (err) {
    console.error('Erreur lors de l\'abonnement:', err)
    error('Erreur lors de l\'abonnement. Veuillez réessayer.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadSubscription()
  }
  
  // Vérifier si on revient d'un paiement annulé
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('checkout') === 'cancelled') {
    error('Paiement annulé. Vous pouvez réessayer quand vous le souhaitez.')
    // Nettoyer l'URL
    window.history.replaceState({}, document.title, '/tarifs')
  }
})
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

.current-plan-badge {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 8px;
  color: #0c4a6e;
  font-weight: 600;
  border: 1px solid #32c4c0;
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
