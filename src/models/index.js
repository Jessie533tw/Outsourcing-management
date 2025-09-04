const { getSequelize } = require('../config/database');

let models = {};

const initModels = async () => {
  const sequelize = getSequelize();
  
  if (!sequelize) {
    throw new Error('Sequelize instance not available');
  }

  // 導入模型定義
  const User = require('./User')(sequelize);
  const Project = require('./Project')(sequelize);
  const Vendor = require('./Vendor')(sequelize);
  const Material = require('./Material')(sequelize);
  const Purchase = require('./Purchase')(sequelize);
  const Progress = require('./Progress')(sequelize);

  // 定義關聯
  Project.hasMany(Purchase, { foreignKey: 'projectId' });
  Purchase.belongsTo(Project, { foreignKey: 'projectId' });

  Vendor.hasMany(Purchase, { foreignKey: 'vendorId' });
  Purchase.belongsTo(Vendor, { foreignKey: 'vendorId' });

  Material.hasMany(Purchase, { foreignKey: 'materialId' });
  Purchase.belongsTo(Material, { foreignKey: 'materialId' });

  Project.hasMany(Progress, { foreignKey: 'projectId' });
  Progress.belongsTo(Project, { foreignKey: 'projectId' });

  models = {
    User,
    Project,
    Vendor,
    Material,
    Purchase,
    Progress,
    sequelize
  };

  return models;
};

const getModels = () => {
  return models;
};

module.exports = {
  initModels,
  getModels
};