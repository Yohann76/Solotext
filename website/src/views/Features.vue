<template>
  <div class="page features-page">
    <!-- Section 1: Vérification de chaque phrase sur internet -->
    <section class="feature-section">
      <div class="container">
        <div class="feature-content">
          <div class="feature-text">
            <h2 class="feature-title">Vérification de chaque phrase sur internet</h2>
            <p class="feature-description">
              Chaque phrase de votre texte est analysée individuellement en effectuant des requêtes 
              dans différents moteurs de recherche. Notre système vérifie l'originalité de votre contenu 
              en comparant chaque phrase avec les sources disponibles sur le web.
            </p>
          </div>
          <div class="feature-visual">
            <img :src="searchIllustration" alt="Recherche sur internet" class="feature-illustration" />
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Conserver l'historique de vos analyses -->
    <section class="feature-section feature-section-alt">
      <div class="container">
        <div class="feature-content">
          <div class="feature-text">
            <h2 class="feature-title">Conserver l'historique de vos analyses</h2>
            <p class="feature-description">
              Toutes vos analyses sont automatiquement sauvegardées et accessibles à tout moment. 
              Retrouvez facilement vos précédentes analyses, comparez les résultats et suivez 
              l'évolution de vos textes dans le temps.
            </p>
          </div>
          <div class="feature-visual">
            <img :src="historyIllustration" alt="Historique des analyses" class="feature-illustration" />
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: Exporter l'analyse en PDF -->
    <section class="feature-section">
      <div class="container">
        <div class="feature-content">
          <div class="feature-text">
            <h2 class="feature-title">Exporter l'analyse en PDF</h2>
            <p class="feature-description">
              Générez un rapport détaillé de votre analyse au format PDF. Partagez facilement 
              vos résultats avec vos collaborateurs, clients ou pour vos archives. Le PDF inclut 
              toutes les informations essentielles : statistiques, sources détectées et phrases analysées.
            </p>
          </div>
          <div class="feature-visual">
            <img :src="exportIllustration" alt="Export PDF" class="feature-illustration" />
          </div>
        </div>
      </div>
    </section>

    <!-- Section 4: Trouver les sources dans vos différentes occurrences -->
    <section class="feature-section feature-section-alt">
      <div class="container">
        <div class="feature-content">
          <div class="feature-text">
            <h2 class="feature-title">Trouver les sources dans vos différentes occurrences</h2>
            <p class="feature-description">
              Identifiez rapidement toutes les sources correspondant à vos phrases dupliquées. 
              Notre système vous montre précisément où chaque occurrence a été trouvée sur le web, 
              vous permettant de vérifier et de citer vos sources correctement.
            </p>
          </div>
          <div class="feature-visual">
            <img :src="sourcesIllustration" alt="Trouver les sources" class="feature-illustration" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import searchIllustration from '../assets/undraw_svg/undraw_file-bundle_oaof.svg'
import historyIllustration from '../assets/undraw_svg/undraw_text-files_tqjw.svg'
import exportIllustration from '../assets/undraw_svg/undraw_file-search_cbur.svg'
import sourcesIllustration from '../assets/undraw_svg/undraw_annotation_rz2w.svg'
// header & footer injectés par PublicLayout
</script>

<style scoped>
.features-page {
  background-color: #FFF8F0;
  color: #031815;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 28px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.feature-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #E0F7F5 0%, #B8EBE8 100%);
  position: relative;
  border-top: 1px solid rgba(50, 196, 192, 0.2);
  border-bottom: 1px solid rgba(50, 196, 192, 0.2);
}

.feature-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(50, 196, 192, 0.08) 0%, rgba(1, 158, 139, 0.12) 100%);
  pointer-events: none;
}

.feature-section-alt {
  background: linear-gradient(135deg, #FFF8F0 0%, #F5EDE0 100%);
  position: relative;
  border-top: 1px solid rgba(6, 88, 76, 0.15);
  border-bottom: 1px solid rgba(6, 88, 76, 0.15);
}

.feature-section-alt::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(6, 88, 76, 0.05) 0%, rgba(50, 196, 192, 0.08) 100%);
  pointer-events: none;
}

.feature-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

/* Alternance : sections paires (2 et 4) ont l'image à gauche */
.feature-section-alt .feature-content {
  grid-template-columns: 1fr 1fr;
}

.feature-section-alt .feature-text {
  order: 2;
}

.feature-section-alt .feature-visual {
  order: 1;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-title {
  font-family: "Neulis Alt", sans-serif;
  font-size: 40px;
  font-weight: 700;
  line-height: 1.2em;
  color: #031815;
  margin: 0;
  background: linear-gradient(135deg, #32C4C0 0%, #019E8B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-description {
  font-size: 18px;
  font-weight: 400;
  line-height: 28px;
  color: #031815;
  margin: 0;
  opacity: 0.9;
}

.feature-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.feature-illustration {
  width: 100%;
  max-width: 500px;
  height: auto;
  opacity: 0.9;
  filter: drop-shadow(0 8px 16px rgba(50, 196, 192, 0.15));
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.feature-illustration:hover {
  transform: translateY(-5px);
  opacity: 1;
}

/* Responsive */
@media (max-width: 968px) {
  .feature-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .feature-section-alt .feature-text,
  .feature-section-alt .feature-visual {
    order: 0;
  }

  .feature-title {
    font-size: 32px;
  }

  .feature-illustration {
    max-width: 400px;
  }

  .feature-section {
    padding: 60px 0;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .feature-title {
    font-size: 28px;
  }

  .feature-description {
    font-size: 16px;
    line-height: 24px;
  }

  .feature-illustration {
    max-width: 300px;
  }

  .feature-section {
    padding: 40px 0;
  }
}
</style>
