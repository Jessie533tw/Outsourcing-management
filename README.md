# 建設公司發包管理系統

一個完整的建設公司發包管理系統，提供從專案規劃到完工報告的全流程管理。

## 系統特色

### 📋 主要功能

1. **工料分析表生成**
   - 根據工程圖自動生成工料分析表
   - 支援手動編輯和調整
   - 材料數量自動計算

2. **計價比較表生成** 
   - 多廠商報價比較
   - 自動標示最低價格
   - 推薦最佳廠商選擇

3. **採購單生成**
   - 自動生成採購訂單
   - 預算自動扣除
   - 交期管理

4. **施工進度表自動更新**
   - 即時進度追蹤
   - 延誤預警
   - 進度報告自動生成

5. **明細表管理**
   - 按進度分類的工程採購明細
   - 按材料分類的工料採購明細
   - 便於付款、驗收和成本控管

6. **進度監控與提醒**
   - 預計下單日期 vs 實際交貨日期比對
   - 現場進度監控
   - 自動提醒延誤情況

7. **專案啟動自動化**
   - 自動建立專案資料夾
   - 預算表自動生成
   - 主管審核流程

8. **傳票生成與成本更新**
   - 材料輸入自動生成傳票
   - 成本自動更新
   - 會計憑證管理

9. **合約編號與PDF生成**
   - 預算通過自動生成合約編號
   - PDF合約文件自動寄送會計
   - 文件版本控制

10. **進度報告自動發送**
    - 進度表更新自動觸發報告
    - 管理層即時接收進度信息
    - 自訂報告格式

11. **完工報告自動彙整**
    - 工程完工自動彙整傳票
    - 總帳報告輸出
    - 財務結算支援

### 🚀 技術架構

**後端技術**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT 身份驗證
- PDF 生成 (PDFKit)
- 郵件服務 (Nodemailer)
- 文件上傳 (Multer)

**前端技術**
- React 18 + TypeScript
- Ant Design UI 組件庫
- React Router 路由管理
- Axios API 請求
- Recharts 圖表
- Vite 建構工具

**部署技術**
- 支援 Zeabur 部署
- Docker 容器化
- 環境變數配置
- 自動化 CI/CD

## 安裝與運行

### 環境需求
- Node.js 18+
- MongoDB 5+
- Git

### 安裝步驟

1. **克隆專案**
```bash
git clone <repository-url>
cd 發包管理系統
```

2. **安裝後端依賴**
```bash
npm install
```

3. **安裝前端依賴** 
```bash
cd client
npm install
```

4. **配置環境變數**
```bash
# 複製環境變數檔案
cp .env.example .env

# 編輯 .env 檔案，設定以下變數：
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/construction_procurement
JWT_SECRET=your_jwt_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

5. **啟動 MongoDB**
```bash
# 使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo:5

# 或使用本地安裝的 MongoDB
mongod
```

6. **運行開發環境**
```bash
# 後端開發服務器
npm run dev

# 前端開發服務器（新終端）
cd client
npm run dev
```

7. **訪問應用**
- 前端：http://localhost:3000
- 後端 API：http://localhost:5000

## 系統流程

### 1. 專案建立流程
```
新建專案 → 設定預算 → 主管審核 → 生成合約編號 → 通知會計
```

### 2. 工料分析流程
```
上傳工程圖 → 自動識別材料 → 生成工料分析表 → 核准發送詢價
```

### 3. 採購流程
```
發送詢價單 → 收集報價 → 生成比價表 → 選定廠商 → 生成採購單 → 扣除預算
```

### 4. 進度追蹤流程
```
建立進度表 → 任務分配 → 進度更新 → 延誤預警 → 自動報告
```

### 5. 完工結算流程
```
進度完成 → 傳票彙整 → 生成總帳 → 完工報告 → 寄送會計
```

## API 文檔

### 認證 API
- `POST /api/auth/login` - 使用者登入
- `POST /api/auth/register` - 使用者註冊
- `GET /api/auth/profile` - 獲取使用者資料

### 專案管理 API
- `GET /api/projects` - 獲取專案列表
- `POST /api/projects` - 創建新專案
- `PUT /api/projects/:id/budget` - 更新專案預算
- `POST /api/projects/:id/approve` - 審核專案

### 廠商管理 API
- `GET /api/vendors` - 獲取廠商列表
- `POST /api/vendors` - 新增廠商
- `PUT /api/vendors/:id` - 更新廠商資料

### 工料管理 API
- `GET /api/materials` - 獲取材料列表
- `POST /api/materials/analysis` - 創建工料分析
- `POST /api/materials/analysis/from-drawing` - 從工程圖生成分析

### 採購管理 API
- `POST /api/purchases/quotations` - 創建詢價單
- `POST /api/purchases/price-comparison` - 生成比價表
- `POST /api/purchases/purchase-orders` - 創建採購單

### 進度管理 API
- `POST /api/progress/schedule` - 創建進度表
- `PUT /api/progress/schedule/:id/task/:taskId` - 更新任務進度
- `GET /api/progress/alerts/:projectId` - 獲取專案提醒

### 報表 API
- `GET /api/reports/project-summary/:projectId` - 專案摘要報表
- `POST /api/reports/completion-report/:projectId` - 生成完工報告

## 部署到 Zeabur

1. **準備部署檔案**
```bash
# 建構前端
cd client
npm run build
cd ..
```

2. **設定 Zeabur 配置**
- 上傳專案到 GitHub
- 在 Zeabur 中連接 GitHub repository
- 設定環境變數
- 配置 MongoDB 數據庫

3. **自動部署**
- 推送代碼到 main 分支自動觸發部署
- Zeabur 會自動偵測並部署 Node.js 應用

## 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 聯絡資訊

如有問題或建議，請聯絡：
- Email: support@construction-system.com
- 專案 Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 更新日誌

### v1.0.0 (2025-01-01)
- 初始版本發布
- 完整的發包管理流程
- 支援工料分析和自動報價
- 進度追蹤和提醒功能
- PDF 報告生成
- 自動化郵件通知