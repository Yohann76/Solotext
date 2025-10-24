// This file is solely intended to interact with the admin_config_provider 
// (use in analysisWorker.js to check if provider is active)

const AdminConfigProvider = require('../../models/AdminConfigProvider');

class ProviderService {
  constructor() {
    this.providers = [];
  }

  async loadProviders() {
    try {
      this.providers = await AdminConfigProvider.findAll({ where: { is_used: true } });
      console.log('✅ Fournisseurs actifs chargés:', this.providers.map(p => p.provider_name));
    } catch (error) {
      console.error('❌ Erreur lors du chargement des fournisseurs:', error);
      this.providers = [];
    }
  }

  isProviderActive(providerName) {
    return this.providers.some(p => p.provider_name === providerName && p.is_used);
  }

  getActiveProviders() {
    return this.providers;
  }
}

module.exports = ProviderService;
