<template>
  <div class="page legal-page">
    <section class="legal-hero">
      <div class="container">
        <h1>Mentions Légales</h1>
        <p class="legal-intro">Dernière mise à jour : {{ lastUpdate }}</p>
      </div>
    </section>

    <section class="legal-content">
      <div class="container">
        <div class="legal-text">
          <h2>1. Éditeur du Site</h2>
          <p>
            Le site SoloText est édité par :
          </p>
          <ul>
            <li><strong>Raison sociale :</strong> [Nom de l'entreprise]</li>
            <li><strong>Forme juridique :</strong> [SARL / SAS / etc.]</li>
            <li><strong>Siège social :</strong> [Adresse complète]</li>
            <li><strong>SIRET :</strong> [Numéro SIRET]</li>
            <li><strong>RCS :</strong> [Ville et numéro RCS]</li>
            <li><strong>Capital social :</strong> [Montant]</li>
            <li><strong>Directeur de publication :</strong> [Nom et prénom]</li>
          </ul>

          <h2>2. Hébergement</h2>
          <p>
            Le site est hébergé par :
          </p>
          <ul>
            <li><strong>Hébergeur :</strong> [Nom de l'hébergeur]</li>
            <li><strong>Adresse :</strong> [Adresse de l'hébergeur]</li>
            <li><strong>Téléphone :</strong> [Numéro de téléphone]</li>
          </ul>

          <h2>3. Contact</h2>
          <p>
            Pour toute question concernant le site ou les services proposés, vous pouvez nous contacter :
          </p>
          <ul>
            <li><strong>Email :</strong> [adresse email]</li>
            <li><strong>Téléphone :</strong> [numéro de téléphone]</li>
            <li><strong>Adresse postale :</strong> [adresse complète]</li>
          </ul>

          <h2>4. Propriété Intellectuelle</h2>
          <p>
            L'ensemble des éléments du site SoloText (textes, images, vidéos, logos, icônes, etc.) 
            sont la propriété exclusive de [Nom de l'entreprise] ou de ses partenaires et sont protégés 
            par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
            des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans 
            autorisation écrite préalable de [Nom de l'entreprise].
          </p>

          <h2>5. Données Personnelles</h2>
          <p>
            Conformément à la loi "Informatique et Libertés" et au Règlement Général sur la Protection 
            des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et 
            d'opposition aux données personnelles vous concernant.
          </p>
          <p>
            Pour plus d'informations sur le traitement de vos données personnelles, consultez notre 
            <router-link to="/politique-confidentialite">Politique de Confidentialité</router-link>.
          </p>

          <h2>6. Cookies</h2>
          <p>
            Le site utilise des cookies techniques nécessaires au fonctionnement du service. 
            Pour plus d'informations, consultez notre Politique de Confidentialité.
          </p>

          <h2>7. Liens Externes</h2>
          <p>
            Le site peut contenir des liens vers d'autres sites. Nous ne sommes pas responsables 
            du contenu de ces sites externes et déclinons toute responsabilité quant à leur contenu 
            ou leur accessibilité.
          </p>

          <h2>8. Limitation de Responsabilité</h2>
          <p>
            [Nom de l'entreprise] s'efforce d'assurer l'exactitude et la mise à jour des informations 
            diffusées sur le site. Toutefois, [Nom de l'entreprise] ne peut garantir l'exactitude, 
            la précision ou l'exhaustivité des informations mises à disposition sur le site.
          </p>
          <p>
            En conséquence, [Nom de l'entreprise] décline toute responsabilité pour :
          </p>
          <ul>
            <li>Toute imprécision, inexactitude ou omission concernant les informations disponibles sur le site</li>
            <li>Tout dommage résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification 
            des informations mises à disposition sur le site</li>
            <li>Et plus généralement, tout dommage direct ou indirect, quelle qu'en soit la cause, l'origine, 
            la nature ou les conséquences</li>
          </ul>

          <h2>9. Droit Applicable</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. En cas de litige et à défaut 
            d'accord amiable, le litige sera porté devant les tribunaux français conformément aux règles 
            de compétence en vigueur.
          </p>

          <h2>10. Modification des Mentions Légales</h2>
          <p>
            [Nom de l'entreprise] se réserve le droit de modifier les présentes mentions légales à tout moment. 
            L'utilisateur s'engage donc à les consulter de manière régulière.
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

