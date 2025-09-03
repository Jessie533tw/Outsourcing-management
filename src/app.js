const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { connectDatabase } = require('./config/database');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 靜態文件服務 (為前端建構文件)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// 數據庫連接
connectDatabase().catch(error => {
  console.error('數據庫連接失敗:', error);
  process.exit(1);
});

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const vendorRoutes = require('./routes/vendors');
const materialRoutes = require('./routes/materials');
const purchaseRoutes = require('./routes/purchases');
const progressRoutes = require('./routes/progress');
const reportRoutes = require('./routes/reports');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportRoutes);

// API 健康檢查
app.get('/api/health', (req, res) => {
  res.json({ 
    message: '建設公司發包管理系統 API 服務器運行中',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// 前端路由處理 (生產環境)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: '建設公司發包管理系統 API 服務器運行中' });
  });
}

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: '服務器內部錯誤',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服務器運行在端口 ${PORT}`);
});