# 建設公司發包管理系統 - Zeabur 部署指南

## 🚀 Zeabur 部署步驟

### 1. 準備工作
- 確保所有代碼已提交到 Git 倉庫（GitHub、GitLab 等）
- 註冊 [Zeabur](https://zeabur.com) 帳號

### 2. 部署配置文件
已創建以下配置文件：
- `zbpack.json` - Zeabur 建構配置
- `.env.production` - 生產環境變數模板
- `.zeaburignore` - 部署忽略文件

### 3. 在 Zeabur 部署
1. 登入 Zeabur Dashboard
2. 創建新項目 (New Project)
3. 連接你的 Git 倉庫
4. 選擇此倉庫進行部署
5. Zeabur 會自動檢測 Node.js 項目並開始建構

### 4. 環境變數設置
在 Zeabur 項目設置中添加以下環境變數：

```bash
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-for-construction-management-system-2024-production
JWT_EXPIRES_IN=7d
DATABASE_URL=file:./prod.db
UPLOAD_PATH=./uploads
PORT=3001
```

### 5. 可選環境變數（郵件功能）
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 6. 部署後驗證
- 訪問 Zeabur 提供的域名
- 測試登入功能
- 驗證 API 端點：`/health`, `/api/auth/login`

## 🔧 測試帳號
- **管理員**: username: `admin`, password: `password123`
- **經理**: username: `manager`, password: `password123`
- **員工**: username: `staff`, password: `password123`

## 📁 項目結構
- 前端應用會被建構到 `client/dist/` 並由後端服務器提供服務
- 資料庫使用 SQLite，會自動創建和初始化
- 上傳文件存儲在 `./uploads` 目錄

## 🌐 域名配置
部署成功後，Zeabur 會提供一個 `.zeabur.app` 域名。如需自定義域名，可在項目設置中配置。

## 🔄 自動部署
每次推送到主分支，Zeabur 會自動重新部署應用程序。

## 🐛 故障排除
- 檢查 Zeabur 建構日誌
- 確保所有環境變數正確設置
- 驗證 Node.js 版本兼容性 (>=18.0.0)