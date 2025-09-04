#!/bin/bash

# 確保環境變數存在
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL 環境變數未設定，但繼續啟動..."
fi

# 設定 NODE_ENV
export NODE_ENV=production

# 顯示環境資訊
echo "Node.js 版本: $(node --version)"
echo "NPM 版本: $(npm --version)"
echo "環境: $NODE_ENV"
echo "埠口: $PORT"

# 啟動應用
echo "啟動建設公司發包管理系統..."
node src/app.js