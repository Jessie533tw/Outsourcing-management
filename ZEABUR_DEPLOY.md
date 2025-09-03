# Zeabur 部署指南

## 快速部署到 Zeabur

### 步驟 1: 推送到 GitHub

1. **初始化 Git 並推送**
```bash
git init
git add .
git commit -m "Initial commit: Construction Procurement Management System"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 步驟 2: 在 Zeabur 創建專案

1. 前往 [Zeabur Dashboard](https://dash.zeabur.com)
2. 點擊 "Create Project"
3. 選擇 "Import from GitHub"
4. 選擇您的 repository

### 步驟 3: 配置服務

#### 3.1 添加 Web 服務
1. 在專案中點擊 "Add Service"
2. 選擇 "Git Repository"
3. 選擇您的 repository
4. 服務會自動檢測到 Node.js 專案

#### 3.2 添加 PostgreSQL 數據庫
1. 在同一專案中點擊 "Add Service"
2. 選擇 "Prebuilt" > "PostgreSQL"
3. 等待數據庫創建完成

### 步驟 4: 環境變數設定

在 Web 服務的設定中，添加以下環境變數：

#### 必需的環境變數
```bash
NODE_ENV=production
JWT_SECRET=your_super_strong_jwt_secret_key_minimum_32_characters_long
```

#### 可選的環境變數 (郵件功能)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

**注意**: PostgreSQL 的 `DATABASE_URL` 會由 Zeabur 自動注入，不需要手動設定。

### 步驟 5: 自定義域名 (可選)

1. 在服務設定中找到 "Domain"
2. 點擊 "Generate Domain" 或設定自訂域名
3. 等待 SSL 證書自動配置

### 步驟 6: 驗證部署

1. **檢查服務狀態**: 確認所有服務都顯示為 "Running"
2. **訪問健康檢查**: `https://your-app.zeabur.app/api/health`
3. **訪問應用**: `https://your-app.zeabur.app`

### 預期結果

✅ **成功部署後您將看到**:
- 健康檢查 API 返回狀態
- React 前端應用正常載入
- 登入功能正常運作
- PostgreSQL 數據庫連接成功

## 故障排除

### 查看日誌

1. 在 Zeabur Dashboard 中選擇您的 Web 服務
2. 點擊 "Logs" 標籤查看即時日誌
3. 查找以下關鍵信息：
   - `服務器運行在端口 5000`
   - `已連接到 PostgreSQL 數據庫`
   - 任何錯誤訊息

### 常見問題

#### 1. 資料庫連接失敗
**症狀**: 日誌顯示 "PostgreSQL 連接失敗"
**解決方案**: 
- 確認 PostgreSQL 服務正在運行
- 檢查 Zeabur 是否自動注入了 `DATABASE_URL`

#### 2. JWT 錯誤
**症狀**: 登入時出現 "Invalid JWT secret"
**解決方案**: 
- 確認 `JWT_SECRET` 環境變數已設定且長度足夠

#### 3. 前端無法載入
**症狀**: 訪問根 URL 時出現 404
**解決方案**: 
- 檢查建構過程是否成功
- 確認 `client/dist` 目錄存在

#### 4. API 請求失敗
**症狀**: 前端無法連接到後端 API
**解決方案**: 
- 檢查 CORS 設定
- 確認 API 路由正確配置

### 手動初始化資料 (可選)

如果需要測試資料，可以在 Zeabur Terminal 中執行：

```bash
npm run init-data
```

這將創建：
- 3個測試使用者帳戶
- 5種建材樣本
- 3家廠商資料

## 維護和更新

### 自動部署
- 推送到 `main` 分支會自動觸發重新部署
- Zeabur 會自動建構和部署最新版本

### 手動重新部署
1. 在 Zeabur Dashboard 中選擇服務
2. 點擊 "Redeploy" 按鈕

### 監控
- 在 Dashboard 中查看服務指標
- 設定告警通知
- 檢查資源使用情況

## 生產環境最佳實踐

1. **安全性**
   - 使用強 JWT Secret
   - 啟用 HTTPS (Zeabur 自動提供)
   - 定期更新依賴項

2. **效能**
   - 啟用 gzip 壓縮 (已內建)
   - 使用 CDN (Zeabur 提供)
   - 優化資料庫查詢

3. **備份**
   - 定期備份 PostgreSQL 資料
   - 監控服務健康狀態
   - 設定告警通知

## 支援

如遇部署問題，請檢查：
1. [Zeabur 文檔](https://zeabur.com/docs)
2. 專案 GitHub Issues
3. Zeabur Discord 社群