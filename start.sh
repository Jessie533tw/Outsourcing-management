#!/bin/bash

# 確保環境變數存在
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL 環境變數未設定"
  exit 1
fi

# 生成 Prisma Client
echo "生成 Prisma Client..."
npx prisma generate

# 等待資料庫準備就緒
echo "等待資料庫連接..."
for i in {1..30}; do
  if npx prisma db push --accept-data-loss --skip-seed > /dev/null 2>&1; then
    echo "資料庫連接成功"
    break
  fi
  echo "等待資料庫... ($i/30)"
  sleep 2
done

# 部署資料庫遷移（如果需要）
echo "部署資料庫遷移..."
npx prisma migrate deploy || echo "遷移失敗，繼續啟動..."

# 播種資料
echo "播種初始資料..."
npx prisma db seed || echo "播種失敗，繼續啟動..."

# 啟動應用
echo "啟動應用..."
node dist/index.js