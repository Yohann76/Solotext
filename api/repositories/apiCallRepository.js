const { Op, fn, col, literal } = require('sequelize');
const ApiCall = require('../models/ApiCall');
const AdminConfigProvider = require('../models/AdminConfigProvider');
const User = require('../models/User');

const countTotalCallsByProvider = async (providerName) => {
  return await ApiCall.sum('call_count', {
    include: [{
      model: AdminConfigProvider,
      as: 'provider',
      where: { provider_name: providerName },
      attributes: []
    }]
  }) || 0;
};

const countCallsByProviderSince = async (providerName, date) => {
  return await ApiCall.sum('call_count', {
    where: { call_date: { [Op.gte]: date } },
    include: [{
      model: AdminConfigProvider,
      as: 'provider',
      where: { provider_name: providerName },
      attributes: []
    }]
  }) || 0;
};

const getCallCountsByDay = async (providerName, date) => {
  return await ApiCall.findAll({
    attributes: [
      [fn('date_trunc', 'day', col('ApiCall.call_date')), 'day'],
      [fn('sum', col('ApiCall.call_count')), 'calls']
    ],
    where: { call_date: { [Op.gte]: date } },
    include: [{
      model: AdminConfigProvider,
      as: 'provider',
      where: { provider_name: providerName },
      attributes: []
    }],
    group: ['day'],
    order: [['day', 'ASC']],
    raw: true
  });
};

const getTopUsersByCallCount = async (providerName, date, limit) => {
  return await User.findAll({
    attributes: [
      'id', 
      'email',
      [fn('SUM', col('ApiCalls.call_count')), 'apiCallCount']
    ],
    include: [{
      model: ApiCall,
      attributes: [],
      where: { call_date: { [Op.gte]: date } },
      include: [{
        model: AdminConfigProvider,
        as: 'provider',
        where: { provider_name: providerName },
        attributes: []
      }]
    }],
    group: ['User.id'],
    order: [[literal('"apiCallCount"'), 'DESC']],
    limit: limit,
    subQuery: false
  });
};

const getUserCosts = async () => {
  return await ApiCall.findAll({
    attributes: [
      [col('User.id'), 'userId'],
      [col('User.email'), 'email'],
      [col('provider.provider_name'), 'providerName'],
      [col('provider.cost_per_request'), 'costPerRequest'],
      [fn('date_trunc', 'month', col('ApiCall.call_date')), 'month'],
      [fn('SUM', col('ApiCall.call_count')), 'requestCount']
    ],
    include: [
      {
        model: User,
        attributes: []
      },
      {
        model: AdminConfigProvider,
        as: 'provider',
        attributes: []
      }
    ],
    group: [
      col('User.id'),
      [col('User.email'), 'email'],
      'month',
      col('provider.provider_name'),
      col('provider.cost_per_request'),
    ],
    order: [
      [fn('date_trunc', 'month', col('ApiCall.call_date')), 'DESC'],
      [col('User.email'), 'ASC']
    ],
    raw: true
  });
};


module.exports = {
  countTotalCallsByProvider,
  countCallsByProviderSince,
  getCallCountsByDay,
  getTopUsersByCallCount,
  getUserCosts,
};
