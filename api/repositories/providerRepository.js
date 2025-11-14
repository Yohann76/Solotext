const AdminConfigProvider = require('../models/AdminConfigProvider');

const findAllProviders = async () => {
  return await AdminConfigProvider.findAll({ order: [['id', 'ASC']] });
};

const updateProviderStatus = async (id, is_used) => {
  const provider = await AdminConfigProvider.findByPk(id);
  if (!provider) {
    return null;
  }
  return await provider.update({ is_used });
};

module.exports = { 
  findAllProviders, 
  updateProviderStatus 
};
