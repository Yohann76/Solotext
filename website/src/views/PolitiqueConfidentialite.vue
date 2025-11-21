<template>
  <div class="page legal-page">
    <section class="legal-hero">
      <div class="container">
        <h1>Politique de Confidentialité</h1>
        <p class="legal-intro">Dernière mise à jour : {{ lastUpdate }}</p>
      </div>
    </section>

    <section class="legal-content">
      <div class="container">
        <div class="legal-text">
          <h2>1. Introduction</h2>
          <p>
            La présente Politique de Confidentialité a pour objet d'informer les utilisateurs du service 
            SoloText (ci-après le "Service") sur la manière dont [Nom de l'entreprise] (ci-après "nous", 
            "notre" ou "nos") collecte, utilise et protège les données personnelles.
          </p>

          <h2>2. Responsable du Traitement</h2>
          <p>
            Le responsable du traitement des données personnelles est [Nom de l'entreprise], 
            [adresse complète], [numéro SIRET], contact : [adresse email].
          </p>

          <h2>3. Données Collectées</h2>
          <p>
            Nous collectons les données personnelles suivantes :
          </p>
          <ul>
            <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
            <li><strong>Données de connexion :</strong> adresse IP, logs de connexion</li>
            <li><strong>Données d'utilisation :</strong> historique des analyses, textes analysés</li>
            <li><strong>Données techniques :</strong> type de navigateur, système d'exploitation</li>
          </ul>

          <h2>4. Finalités du Traitement</h2>
          <p>
            Vos données personnelles sont traitées pour les finalités suivantes :
          </p>
          <ul>
            <li>Gestion de votre compte utilisateur</li>
            <li>Fourniture du Service et traitement de vos analyses</li>
            <li>Amélioration du Service</li>
            <li>Communication avec vous concernant le Service</li>
            <li>Respect de nos obligations légales</li>
          </ul>

          <h2>5. Base Légale du Traitement</h2>
          <p>
            Le traitement de vos données personnelles est fondé sur :
          </p>
          <ul>
            <li>Votre consentement</li>
            <li>L'exécution d'un contrat (utilisation du Service)</li>
            <li>Le respect d'obligations légales</li>
            <li>Notre intérêt légitime (amélioration du Service)</li>
          </ul>

          <h2>6. Conservation des Données</h2>
          <p>
            Vos données personnelles sont conservées pour la durée nécessaire aux finalités pour lesquelles 
            elles ont été collectées, et conformément aux obligations légales applicables. Les données 
            d'analyse sont conservées tant que votre compte est actif, sauf demande de suppression de votre part.
          </p>

          <h2>7. Partage des Données</h2>
          <p>
            Vos données personnelles ne sont pas vendues, louées ou partagées avec des tiers à des fins 
            commerciales. Nous pouvons partager vos données uniquement dans les cas suivants :
          </p>
          <ul>
            <li>Avec nos prestataires techniques (hébergement, maintenance) sous contrat de confidentialité</li>
            <li>En cas d'obligation légale ou de réquisition judiciaire</li>
            <li>Avec votre consentement explicite</li>
          </ul>

          <h2>8. Sécurité des Données</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger 
            vos données personnelles contre tout accès non autorisé, perte, destruction ou altération. 
            Cela inclut notamment :
          </p>
          <ul>
            <li>Chiffrement des données sensibles</li>
            <li>Authentification sécurisée (JWT)</li>
            <li>Surveillance et détection des intrusions</li>
            <li>Sauvegardes régulières</li>
          </ul>

          <h2>9. Vos Droits</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des 
            droits suivants :
          </p>
          <ul>
            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
            <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
            <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
            <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
          </ul>
          <p>
            Pour exercer ces droits, vous pouvez nous contacter à l'adresse : [adresse email].
          </p>

          <h2>10. Cookies</h2>
          <p>
            Le Service utilise des cookies techniques nécessaires au fonctionnement du Service, notamment 
            pour la gestion de votre session d'authentification. Ces cookies sont des cookies HTTP-only 
            sécurisés qui ne peuvent pas être accédés par JavaScript.
          </p>

          <h2>11. Transferts Internationaux</h2>
          <p>
            Vos données personnelles sont stockées et traitées au sein de l'Union Européenne. En cas de 
            transfert hors UE, nous nous assurons que des garanties appropriées sont mises en place 
            conformément au RGPD.
          </p>

          <h2>12. Modifications</h2>
          <p>
            Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment. 
            Les modifications entrent en vigueur dès leur publication. Il vous appartient de consulter 
            régulièrement cette politique pour prendre connaissance des éventuelles modifications.
          </p>

          <h2>13. Réclamation</h2>
          <p>
            Si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD, 
            vous avez le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique 
            et des Libertés (CNIL) : <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>
          </p>

          <h2>14. Contact</h2>
          <p>
            Pour toute question relative à la présente Politique de Confidentialité ou au traitement de 
            vos données personnelles, vous pouvez nous contacter à l'adresse suivante : [adresse email]
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

