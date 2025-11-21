<template>
  <div class="page legal-page">
    <section class="legal-hero">
      <div class="container">
        <h1>Conditions Générales d'Utilisation</h1>
        <p class="legal-intro">Dernière mise à jour : {{ lastUpdate }}</p>
      </div>
    </section>

    <section class="legal-content">
      <div class="container">
        <div class="legal-text">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales d'Utilisation (ci-après les "CGU") ont pour objet de définir 
            les conditions et modalités d'utilisation du service SoloText (ci-après le "Service") proposé 
            par [Nom de l'entreprise] (ci-après "nous", "notre" ou "nos").
          </p>

          <h2>2. Acceptation des CGU</h2>
          <p>
            L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU. 
            Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le Service.
          </p>

          <h2>3. Description du Service</h2>
          <p>
            SoloText est une plateforme permettant d'analyser et de vérifier l'originalité de textes 
            en effectuant des recherches sur internet. Le Service permet notamment de :
          </p>
          <ul>
            <li>Analyser des textes pour détecter les duplications</li>
            <li>Vérifier chaque phrase sur internet</li>
            <li>Conserver l'historique des analyses</li>
            <li>Exporter les analyses en PDF</li>
            <li>Identifier les sources des occurrences trouvées</li>
          </ul>

          <h2>4. Inscription et Compte Utilisateur</h2>
          <p>
            Pour utiliser le Service, vous devez créer un compte en fournissant des informations 
            exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants 
            et de toutes les activités effectuées sous votre compte.
          </p>

          <h2>5. Utilisation du Service</h2>
          <p>
            Vous vous engagez à utiliser le Service conformément à la législation en vigueur et 
            aux présentes CGU. Il est notamment interdit de :
          </p>
          <ul>
            <li>Utiliser le Service à des fins illégales ou frauduleuses</li>
            <li>Porter atteinte aux droits de tiers</li>
            <li>Perturber le fonctionnement du Service</li>
            <li>Tenter d'accéder de manière non autorisée au Service</li>
          </ul>

          <h2>6. Propriété Intellectuelle</h2>
          <p>
            Le Service et tous ses éléments (code, design, logos, etc.) sont la propriété exclusive 
            de [Nom de l'entreprise] et sont protégés par les lois relatives à la propriété intellectuelle.
          </p>

          <h2>7. Protection des Données</h2>
          <p>
            Le traitement de vos données personnelles est régi par notre 
            <router-link to="/politique-confidentialite">Politique de Confidentialité</router-link>.
          </p>

          <h2>8. Disponibilité du Service</h2>
          <p>
            Nous nous efforçons d'assurer une disponibilité continue du Service, mais ne pouvons 
            garantir un fonctionnement sans interruption. Nous nous réservons le droit d'interrompre 
            temporairement le Service pour maintenance ou mise à jour.
          </p>

          <h2>9. Limitation de Responsabilité</h2>
          <p>
            Le Service est fourni "en l'état". Nous ne garantissons pas l'exactitude, la complétude 
            ou l'adéquation des résultats fournis par le Service. Notre responsabilité ne saurait être 
            engagée pour tout dommage résultant de l'utilisation ou de l'impossibilité d'utiliser le Service.
          </p>

          <h2>10. Modification des CGU</h2>
          <p>
            Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications 
            entrent en vigueur dès leur publication. Il vous appartient de consulter régulièrement 
            les CGU pour prendre connaissance des éventuelles modifications.
          </p>

          <h2>11. Résiliation</h2>
          <p>
            Nous nous réservons le droit de suspendre ou résilier votre accès au Service en cas de 
            violation des présentes CGU, sans préavis ni remboursement.
          </p>

          <h2>12. Droit Applicable et Juridiction</h2>
          <p>
            Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux 
            français seront seuls compétents.
          </p>

          <h2>13. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse suivante : 
            [adresse email de contact]
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lastUpdate = ref(new Date().toLocaleDateString('fr-FR', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}))
</script>

<style scoped>
.legal-page {
  background-color: #FFF8F0;
  color: #031815;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  min-height: 100vh;
}

.legal-hero {
  background: linear-gradient(135deg, #32C4C0 0%, #019E8B 100%);
  color: #fff;
  padding: 80px 0 60px;
}

.legal-hero .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.legal-hero h1 {
  font-family: "Neulis Alt", sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2em;
  margin: 0 0 1rem;
}

.legal-intro {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.legal-content {
  padding: 60px 0;
}

.legal-content .container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 2rem;
}

.legal-text {
  background: #fff;
  padding: 48px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(3, 24, 21, 0.08);
}

.legal-text h2 {
  font-family: "Neulis Alt", sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3em;
  color: #031815;
  margin: 2.5rem 0 1rem;
  padding-top: 1rem;
  border-top: 2px solid #E0F7F5;
}

.legal-text h2:first-of-type {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.legal-text p {
  font-size: 16px;
  line-height: 1.8em;
  color: #031815;
  margin: 0 0 1.5rem;
  opacity: 0.9;
}

.legal-text ul {
  margin: 1rem 0 1.5rem;
  padding-left: 1.5rem;
}

.legal-text li {
  font-size: 16px;
  line-height: 1.8em;
  color: #031815;
  margin: 0.5rem 0;
  opacity: 0.9;
}

.legal-text a {
  color: #32C4C0;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.legal-text a:hover {
  color: #019E8B;
}

@media (max-width: 768px) {
  .legal-hero h1 {
    font-size: 36px;
  }

  .legal-text {
    padding: 32px 24px;
  }

  .legal-text h2 {
    font-size: 24px;
  }
}
</style>

