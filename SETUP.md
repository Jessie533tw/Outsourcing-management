# 快速開始指南

## 系統需求
- Node.js 18.0+
- MongoDB 5.0+
- Git

## 一鍵安裝

### 1. 克隆專案
```bash
git clone <your-repo-url>
cd 發包管理系統
```

### 2. 設定環境變數
```bash
cp .env.example .env
# 編輯 .env 檔案，至少要設定：
# MONGODB_URI=mongodb://localhost:27017/construction_procurement
# JWT_SECRET=your_strong_jwt_secret_here
```

### 3. 安裝與初始化
```bash
npm run setup
```

### 4. 啟動開發環境
```bash
# 終端 1: 啟動後端
npm run dev

# 終端 2: 啟動前端
npm run client
```

### 5. 訪問應用
- 前端: http://localhost:3000
- 後端: http://localhost:5000

## 測試帳戶
- **管理員**: admin@company.com / password
- **經理**: manager@company.com / password  
- **主管**: supervisor@company.com / password

## 生產環境部署

### Docker 部署
```bash
docker-compose up -d
```

### 手動部署
```bash
# 建構前端
npm run build

# 安裝生產依賴
npm ci --only=production

# 啟動服務
NODE_ENV=production npm start
```

## 資料庫初始化
系統已預建立：
- 3個測試使用者
- 5種建材樣本
- 3家廠商資料

## 故障排除

### 常見問題

1. **MongoDB 連接失敗**
   - 確認 MongoDB 服務正在運行
   - 檢查 .env 中的 MONGODB_URI 設定

2. **前端無法訪問後端**
   - 確認後端在 port 5000 運行
   - 檢查防火牆設定

3. **郵件發送失敗**
   - 設定 .env 中的郵件配置
   - 對於 Gmail 需要使用應用程式密碼

### 重新初始化資料
```bash
npm run init-data
```

## 開發模式
- 後端會在檔案變更時自動重載 (nodemon)
- 前端支援熱重載 (Vite HMR)
- API 請求會代理到後端 port 5000

## 支援
如遇問題請查看：
1. 控制台錯誤訊息
2. MongoDB 連接狀態
3. 環境變數設定
4. 防火牆和網路設定