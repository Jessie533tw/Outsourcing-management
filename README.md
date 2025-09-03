# 外包發包管理系統

完整的外包發包流程管理解決方案，支援從工料分析到成本控管的全流程自動化。

## 核心功能

### 🏗️ 主要業務流程
1. **工料分析表** - 根據設計圖或施工圖生成工料分析表
2. **詢價管理** - 向多家廠商發送詢價單
3. **計價比較** - 智能比價系統，整理各廠商報價差異
4. **採購管理** - 開立採購單並自動扣除預算
5. **進度監控** - 發包施工進度表，確保施工進度
6. **成本控管** - 工程採購明細表（按進度）和工料採購明細表（按材料）

### 🤖 自動化功能
- 新建專案時自動建立資料夾和預算表
- 預算填寫完成後自動通知主管審核
- 輸入材料時自動生成傳票並更新成本
- 預算通過後自動生成合約編號並寄送PDF給會計
- 進度表更新時自動寄送進度報告給管理層
- 工程完工時自動彙整傳票並輸出總帳報告

### 📊 智能監控
- 比對「預計下單日期」vs「實際交貨日期」vs「現場進度」
- 延誤提醒和風險警告
- 即時預算使用率監控
- 完整的成本分析報表

## 技術架構

### 後端技術棧
- **Node.js** + **TypeScript** - 現代化後端開發
- **Express.js** - Web 框架
- **Prisma** - 現代化 ORM 與資料庫管理
- **PostgreSQL** - 主資料庫
- **JWT** - 身份認證
- **Zod** - 資料驗證
- **bcryptjs** - 密碼加密

### 前端技術棧
- **React 18** - 現代化前端框架
- **TypeScript** - 型別安全
- **Vite** - 快速構建工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **React Router** - 路由管理
- **React Query** - 資料管理與快取
- **Zustand** - 狀態管理
- **React Hook Form** - 表單處理
- **Heroicons** - 圖示庫

## 快速開始

### 環境需求
- Node.js 18.0.0 或以上
- PostgreSQL 資料庫
- npm 或 yarn 包管理器

### 安裝步驟

1. **克隆專案**
```bash
git clone <repository-url>
cd construction-management
```

2. **安裝依賴**
```bash
npm install
cd client && npm install
```

3. **設定環境變數**
```bash
cp .env.example .env
```

編輯 `.env` 檔案，設定以下內容：
```env
# 資料庫連接
DATABASE_URL="postgresql://username:password@localhost:5432/construction_db"

# JWT 設定
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# 服務器設定
PORT=3001
NODE_ENV="development"

# 前端設定
FRONTEND_URL="http://localhost:3000"
```

4. **資料庫設定**
```bash
# 生成 Prisma Client
npx prisma generate

# 執行資料庫遷移
npx prisma db push

# （可選）填入測試資料
npx prisma db seed
```

5. **啟動開發服務器**

後端服務器（Port 3001）：
```bash
npm run dev
```

前端服務器（Port 3000）：
```bash
cd client
npm run dev
```

6. **訪問應用程式**
- 前端：http://localhost:3000
- 後端 API：http://localhost:3001
- 資料庫管理：`npx prisma studio`

## 部署到 Zeabur

### 部署步驟

1. **推送到 GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **在 Zeabur 上部署**
- 登入 [Zeabur](https://zeabur.com)
- 點擊 "New Project"
- 連接您的 GitHub 倉庫
- 選擇此專案倉庫

3. **設定環境變數**
在 Zeabur 專案設定中添加以下環境變數：
```
DATABASE_URL=<your-postgresql-url>
JWT_SECRET=<your-jwt-secret>
NODE_ENV=production
```

4. **資料庫設定**
- 在 Zeabur 中添加 PostgreSQL 服務
- 複製資料庫連接字符串到 `DATABASE_URL`
- 部署完成後執行資料庫遷移

## 專案結構

```
├── src/                    # 後端源碼
│   ├── controllers/        # 控制器
│   ├── middleware/         # 中間件
│   ├── routes/            # 路由定義
│   ├── services/          # 業務邏輯
│   ├── types/             # 類型定義
│   └── utils/             # 工具函數
├── client/                # 前端源碼
│   ├── src/
│   │   ├── components/    # React 元件
│   │   ├── pages/         # 頁面元件
│   │   ├── services/      # API 服務
│   │   ├── store/         # 狀態管理
│   │   └── types/         # 類型定義
│   └── public/            # 靜態檔案
├── prisma/                # 資料庫 Schema
│   ├── schema.prisma      # Prisma Schema
│   └── seed.ts           # 種子資料
└── uploads/               # 檔案上傳目錄
```

## API 文件

### 認證相關
- `POST /api/auth/login` - 用戶登入
- `POST /api/auth/register` - 用戶註冊
- `GET /api/auth/me` - 獲取當前用戶資訊
- `PUT /api/auth/profile` - 更新用戶資料
- `POST /api/auth/logout` - 用戶登出

### 專案管理
- `GET /api/projects` - 獲取專案列表
- `POST /api/projects` - 建立新專案
- `GET /api/projects/:id` - 獲取專案詳情
- `PUT /api/projects/:id` - 更新專案
- `DELETE /api/projects/:id` - 刪除專案

### 其他模組
- `/api/material-analysis` - 工料分析管理
- `/api/budgets` - 預算管理
- `/api/suppliers` - 廠商管理
- `/api/inquiries` - 詢價管理
- `/api/purchase-orders` - 採購管理
- `/api/reports` - 報表中心

## 開發指南

### 資料庫 Schema 修改
```bash
# 修改 schema.prisma 後執行
npx prisma db push
npx prisma generate
```

### 新增 API 路由
1. 在 `src/routes/` 中建立路由檔案
2. 在 `src/index.ts` 中註冊路由
3. 更新前端 API 服務（`client/src/services/api.ts`）

### 新增前端頁面
1. 在 `client/src/pages/` 中建立頁面元件
2. 在 `client/src/App.tsx` 中添加路由
3. 更新導航選單（`client/src/components/Layout.tsx`）

## 測試帳號

系統預設提供以下測試帳號：

- **管理員**: `admin` / `password123`
- **專案經理**: `manager` / `password123`  
- **一般員工**: `staff` / `password123`

## 授權協議

MIT License

## 支援與回饋

如有問題或建議，請開立 Issue 或聯繫開發團隊。