<template>
  <div class="page legal-page">
    <section class="legal-hero">
      <div class="container">
        <h1>Conditions Générales de Vente</h1>
        <p class="legal-intro">Dernière mise à jour : {{ lastUpdate }}</p>
      </div>
    </section>

    <section class="legal-content">
      <div class="container">
        <div class="legal-text">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (ci-après les "CGV") ont pour objet de définir 
            les conditions et modalités de vente des services proposés par [Nom de l'entreprise] 
            (ci-après "nous", "notre" ou "nos") via la plateforme SoloText.
          </p>

          <h2>2. Acceptation des CGV</h2>
          <p>
            Toute commande de service implique l'acceptation sans réserve des présentes CGV. 
            Ces conditions prévalent sur tout autre document, sauf accord écrit contraire.
          </p>

          <h2>3. Services Proposés</h2>
          <p>
            SoloText propose différents abonnements et formules d'accès au service d'analyse de textes. 
            Les caractéristiques, tarifs et conditions de chaque formule sont détaillés sur la page 
            <router-link to="/tarifs">Tarifs</router-link>.
          </p>

          <h2>4. Commande</h2>
          <p>
            La commande s'effectue en ligne sur le site SoloText. Toute commande vaut acceptation 
            des prix et descriptions des services proposés. Nous nous réservons le droit de refuser 
            toute commande pour motif légitime.
          </p>

          <h2>5. Prix</h2>
          <p>
            Les prix de nos services sont indiqués en euros, toutes taxes comprises (TTC). 
            Nous nous réservons le droit de modifier nos prix à tout moment, étant toutefois entendu 
            que le prix figurant au jour de la commande sera le seul applicable à l'acheteur.
          </p>

          <h2>6. Paiement</h2>
          <p>
            Le paiement s'effectue par carte bancaire ou tout autre moyen de paiement proposé lors 
            de la commande. Le paiement est exigible immédiatement à la commande. 
            En cas de défaut de paiement, l'accès au service pourra être suspendu.
          </p>

          <h2>7. Activation du Service</h2>
          <p>
            L'accès au service est activé dès réception du paiement et confirmation de la commande. 
            Un email de confirmation est envoyé à l'adresse fournie lors de l'inscription.
          </p>

          <h2>8. Droit de Rétractation</h2>
          <p>
            Conformément à l'article L. 221-18 du Code de la consommation, vous disposez d'un délai 
            de 14 jours calendaires à compter de la souscription pour exercer votre droit de rétractation, 
            sans avoir à justifier de motifs ni à payer de pénalité.
          </p>
          <p>
            Pour exercer ce droit, vous devez nous notifier votre décision de rétractation par email 
            à l'adresse : [adresse email].
          </p>

          <h2>9. Remboursement</h2>
          <p>
            En cas d'exercice du droit de rétractation, nous procéderons au remboursement de tous 
            les paiements reçus dans un délai de 14 jours à compter de la réception de votre demande. 
            Le remboursement s'effectuera par le même moyen de paiement que celui utilisé pour la transaction.
          </p>

          <h2>10. Durée et Résiliation</h2>
          <p>
            Les abonnements sont souscrits pour une durée déterminée (mensuelle, annuelle, etc.) 
            selon la formule choisie. L'abonnement se renouvelle automatiquement sauf résiliation 
            de votre part avant la fin de la période en cours.
          </p>
          <p>
            Vous pouvez résilier votre abonnement à tout moment depuis votre espace utilisateur. 
            La résiliation prend effet à la fin de la période en cours, sans remboursement de la 
            partie déjà consommée.
          </p>

          <h2>11. Obligations du Client</h2>
          <p>
            Le client s'engage à :
          </p>
          <ul>
            <li>Fournir des informations exactes lors de l'inscription</li>
            <li>Respecter les Conditions Générales d'Utilisation</li>
            <li>Utiliser le service conformément à sa destination</li>
            <li>Ne pas partager son compte avec des tiers</li>
          </ul>

          <h2>12. Obligations du Vendeur</h2>
          <p>
            Nous nous engageons à :
          </p>
          <ul>
            <li>Fournir le service conformément aux caractéristiques annoncées</li>
            <li>Assurer une disponibilité du service dans la mesure du possible</li>
            <li>Respecter la confidentialité des données du client</li>
            <li>Informer le client de toute modification importante du service</li>
          </ul>

          <h2>13. Garanties</h2>
          <p>
            Le service est fourni "en l'état". Nous ne garantissons pas l'exactitude absolue des 
            résultats d'analyse, ceux-ci étant indicatifs. Nous nous efforçons toutefois d'assurer 
            la meilleure qualité de service possible.
          </p>

          <h2>14. Responsabilité</h2>
          <p>
            Notre responsabilité ne saurait être engagée en cas de dommages indirects résultant 
            de l'utilisation ou de l'impossibilité d'utiliser le service. Notre responsabilité est 
            limitée au montant des sommes versées par le client au titre de l'abonnement en cours.
          </p>

          <h2>15. Propriété Intellectuelle</h2>
          <p>
            Le service SoloText et tous ses éléments sont protégés par les droits de propriété 
            intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.
          </p>

          <h2>16. Protection des Données</h2>
          <p>
            Le traitement de vos données personnelles est régi par notre 
            <router-link to="/politique-confidentialite">Politique de Confidentialité</router-link>.
          </p>

          <h2>17. Modification des CGV</h2>
          <p>
            Nous nous réservons le droit de modifier les présentes CGV à tout moment. Les modifications 
            sont applicables aux nouvelles commandes. Les CGV en vigueur au moment de la commande 
            restent applicables à cette commande.
          </p>

          <h2>18. Droit Applicable et Juridiction</h2>
          <p>
            Les présentes CGV sont régies par le droit français. En cas de litige, et à défaut d'accord 
            amiable, le litige sera porté devant les tribunaux français.
          </p>

          <h2>19. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGV, vous pouvez nous contacter à l'adresse suivante : 
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

