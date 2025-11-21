const { Op, fn, col } = require('sequelize');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Sentence = require('../models/Sentence');

const findUsersWithStats = async (queryParams) => {
  const { 
    page = 1, 
    limit = 50, 
    search = '', 
    role = '', 
    sortBy = 'created_at', 
    sortOrder = 'DESC' 
  } = queryParams;

  const offset = (page - 1) * limit;
  
  const whereClause = {};
  if (search) {
    whereClause.email = { [Op.iLike]: `%${search}%` };
  }
  if (role) {
    whereClause.role = role;
  }

  return await User.findAndCountAll({
    where: whereClause,
    order: [[sortBy, sortOrder.toUpperCase()]],
    limit: parseInt(limit),
    offset: parseInt(offset),
    attributes: { exclude: ['password'] }
  });
};

const countUsersByRole = async (role) => {
  return await User.count({ where: { role } });
};

const countAllUsers = async () => {
  return await User.count();
};

const findAnalysisCountsForUsers = async (userIds) => {
  return await Analysis.findAll({
    where: { user_id: userIds },
    attributes: ['user_id', [fn('COUNT', 'id'), 'analysisCount']],
    group: ['user_id'],
    raw: true,
  });
};

const findSentenceCountsForUsers = async (userIds) => {
  return await Sentence.findAll({
    attributes: [[col('Analysis.user_id'), 'user_id'], [fn('COUNT', 'Sentence.id'), 'sentenceCount']],
    include: [{
      model: Analysis,
      attributes: [],
      where: { user_id: userIds },
    }],
    group: [col('Analysis.user_id')],
    raw: true,
  });
};

const findUserById = async (id) => {
  return await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
};

const updateUser = async (id, userData) => {
  const user = await User.findByPk(id);
  if (!user) {
    return null;
  }
  // Empêcher la mise à jour du mot de passe via cette méthode générique
  if (userData.password) {
    delete userData.password;
  }
  await user.update(userData);
  // Re-fetch pour exclure le mot de passe
  return await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });
};

const deleteUser = async (id) => {
  return await User.destroy({ where: { id: id } });
};

module.exports = {
  findUsersWithStats,
  countUsersByRole,
  countAllUsers,
  findAnalysisCountsForUsers,
  findSentenceCountsForUsers,
  findUserById,
  updateUser,
  deleteUser,
};
