const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

let sequelize = null;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_procurement', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('已連接到 MongoDB 數據庫');
  } catch (error) {
    console.error('MongoDB 連接失敗:', error);
    throw error;
  }
};

const connectPostgreSQL = async () => {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      throw new Error('未設定 PostgreSQL 連接字串');
    }

    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 20,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    });

    await sequelize.authenticate();
    console.log('已連接到 PostgreSQL 數據庫');
    
    // 同步數據庫模型
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('PostgreSQL 數據庫模型已同步');
    }
    
    return sequelize;
  } catch (error) {
    console.error('PostgreSQL 連接失敗:', error);
    throw error;
  }
};

const connectDatabase = async () => {
  // 使用 PostgreSQL 作為主要數據庫
  console.log('使用 PostgreSQL 數據庫');
  return await connectPostgreSQL();
};

const getSequelize = () => {
  return sequelize;
};

module.exports = {
  connectDatabase,
  connectMongoDB,
  connectPostgreSQL,
  getSequelize
};