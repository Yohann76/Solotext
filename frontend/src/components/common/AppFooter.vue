<template>
  <footer id="contact" class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3>SoloText</h3>
          <p>Soyez le seul à posséder votre contenu</p>
        </div>
        <div class="footer-links">
          <div class="footer-column">
            <h4>Produit</h4>
            <router-link to="/fonctionnalites">Fonctionnalités</router-link>
            <router-link to="/tarifs">Tarifs</router-link>
            <a href="#">API</a>
          </div>
          <div class="footer-column">
            <h4>Support</h4>
            <a href="#">Documentation</a>
            <a href="#">Aide</a>
            <a href="#">Contact</a>
          </div>
          <div class="footer-column">
            <h4>Entreprise</h4>
            <a href="#">À propos</a>
            <a href="#">Blog</a>
            <a href="#">Carrières</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 SoloText. Tous droits réservés.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// purely presentational footer
</script>

<style scoped>
.footer { padding: 48px 0; background: #0B1F1D; color: #fff; margin-top: 48px; }
.footer .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
.footer-content { display: grid; grid-template-columns: 1fr 2fr; gap: 32px; }
.footer-brand h3 { margin: 0 0 8px 0; font-size: 1.5rem; }
.footer-links { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }
.footer-column h4 { margin: 0 0 12px; font-size: 1rem; color: #bfeae8; }
.footer a { color: #e7fffe; text-decoration: none; opacity: 0.9; display: block; margin: 6px 0; }
.footer a:hover { opacity: 1; }
.footer-bottom { margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 16px; opacity: 0.8; font-size: 0.9rem; }
@media (max-width: 768px) {
  .footer-content { grid-template-columns: 1fr; }
  .footer .container { padding: 0 1rem; }
}
</style>


