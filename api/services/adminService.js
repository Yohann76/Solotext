const userRepository = require('../repositories/userRepository');
const apiCallRepository = require('../repositories/apiCallRepository');
const providerRepository = require('../repositories/providerRepository');
const { subDays } = require('date-fns');

const getUsers = async (queryParams) => {
  const { page = 1, limit = 50 } = queryParams;
  const { count, rows: users } = await userRepository.findUsersWithStats(queryParams);

  if (users.length === 0) {
    return { users: [], pagination: { page, limit, total: 0, pages: 0 }, stats: { total: 0, admins: 0, users: 0 } };
  }

  const userIds = users.map(user => user.id);

  const [
    analysisCounts,
    sentenceCounts,
    totalUsers,
    adminUsers,
    regularUsers,
  ] = await Promise.all([
    userRepository.findAnalysisCountsForUsers(userIds),
    userRepository.findSentenceCountsForUsers(userIds),
    userRepository.countAllUsers(),
    userRepository.countUsersByRole('admin'),
    userRepository.countUsersByRole('user'),
  ]);

  const analysisMap = analysisCounts.reduce((acc, count) => {
    acc[count.user_id] = parseInt(count.analysisCount, 10);
    return acc;
  }, {});

  const sentenceMap = sentenceCounts.reduce((acc, count) => {
    acc[count.user_id] = parseInt(count.sentenceCount, 10);
    return acc;
  }, {});

  const usersWithData = users.map(user => ({
    ...user.toJSON(),
    analysisCount: analysisMap[user.id] || 0,
    sentenceCount: sentenceMap[user.id] || 0,
  }));

  return {
    users: usersWithData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / limit)
    },
    stats: {
      total: totalUsers,
      admins: adminUsers,
      users: regularUsers
    }
  };
};

const getUserById = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    const error = new Error('Utilisateur non trouvé');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

const updateUser = async (userId, userData) => {
  // On ne devrait pas pouvoir changer le rôle ou l'email comme ça facilement
  // pour des raisons de sécurité, mais on le laisse pour l'instant.
  // On s'assure juste de ne pas toucher au mot de passe.
  if (userData.password) {
    delete userData.password;
  }
  
  const updatedUser = await userRepository.updateUser(userId, userData);

  if (!updatedUser) {
    const error = new Error('Utilisateur non trouvé');
    error.statusCode = 404;
    throw error;
  }
  return updatedUser;
};

const deleteUser = async (userId) => {
  const deletedCount = await userRepository.deleteUser(userId);
  if (deletedCount === 0) {
    const error = new Error('Utilisateur non trouvé ou déjà supprimé');
    error.statusCode = 404;
    throw error;
  }
  // Pas de retour de données, le contrôleur enverra un message de succès
};

const getDashboardStats = async () => {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const providerName = 'perplexity_search';

  const [
    totalPerplexityCalls,
    todayPerplexityCalls,
    perplexityCallsByDay,
    topPerplexityUsers
  ] = await Promise.all([
    apiCallRepository.countTotalCallsByProvider(providerName),
    apiCallRepository.countCallsByProviderSince(providerName, subDays(new Date(), 1)),
    apiCallRepository.getCallCountsByDay(providerName, thirtyDaysAgo),
    apiCallRepository.getTopUsersByCallCount(providerName, thirtyDaysAgo, 5)
  ]);

  const formattedChartData = perplexityCallsByDay.map(entry => ({
    date: entry.day.toISOString().split('T')[0],
    count: parseInt(entry.calls, 10)
  }));

  return {
    totalPerplexityCalls,
    todayPerplexityCalls,
    perplexityCallsByDay: formattedChartData,
    topPerplexityUsers
  };
};

const calculateUserCosts = async () => {
  const rawCosts = await apiCallRepository.getUserCosts();

  const userCosts = {};

  rawCosts.forEach(row => {
    const {
      userId,
      email,
      providerName,
      costPerRequest,
      month,
      requestCount
    } = row;

    if (!userCosts[userId]) {
      userCosts[userId] = {
        id: userId,
        email,
        monthlyCosts: {}
      };
    }

    const monthStr = month.toISOString().substring(0, 7); // YYYY-MM
    if (!userCosts[userId].monthlyCosts[monthStr]) {
      userCosts[userId].monthlyCosts[monthStr] = {
        month: monthStr,
        providers: [],
        totalMonthCost: 0
      };
    }

    const totalCost = parseFloat(costPerRequest) * parseInt(requestCount, 10);

    userCosts[userId].monthlyCosts[monthStr].providers.push({
      providerName,
      requestCount: parseInt(requestCount, 10),
      costPerRequest: parseFloat(costPerRequest),
      totalCost
    });

    userCosts[userId].monthlyCosts[monthStr].totalMonthCost += totalCost;
  });

  // Convertir l'objet en tableau pour la réponse JSON
  const result = Object.values(userCosts).map(user => {
    return {
      ...user,
      monthlyCosts: Object.values(user.monthlyCosts).sort((a, b) => b.month.localeCompare(a.month))
    };
  });

  return result;
};

const getAllProviders = async () => {
  return await providerRepository.findAllProviders();
};

const toggleProviderStatus = async (providerId, is_used) => {
  const updatedProvider = await providerRepository.updateProviderStatus(providerId, is_used);
  if (!updatedProvider) {
    const error = new Error('Fournisseur non trouvé');
    error.statusCode = 404;
    throw error;
  }
  return updatedProvider;
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getDashboardStats,
  calculateUserCosts,
  getAllProviders,
  toggleProviderStatus,
};
