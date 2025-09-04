import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('開始填入種子資料...');

  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      email: 'admin@construction.com',
      username: 'admin',
      password: hashedPassword,
      name: '系統管理員',
      role: 'ADMIN',
      department: '資訊部',
      phone: '02-1234-5678',
    },
  });

  const manager = await prisma.user.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      email: 'manager@construction.com',
      username: 'manager',
      password: hashedPassword,
      name: '專案經理',
      role: 'MANAGER',
      department: '工程部',
      phone: '02-2345-6789',
    },
  });

  const staff = await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      email: 'staff@construction.com',
      username: 'staff',
      password: hashedPassword,
      name: '一般員工',
      role: 'STAFF',
      department: '工程部',
      phone: '02-3456-7890',
    },
  });

  console.log('用戶資料已建立:', { admin: admin.id, manager: manager.id, staff: staff.id });

  // Create test suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: '大成建材股份有限公司',
      code: 'SUP001',
      contactPerson: '張建成',
      phone: '02-8765-4321',
      email: 'contact@dacheng.com.tw',
      address: '台北市中山區建國北路100號',
      taxNumber: '12345678',
      rating: 4,
      paymentTerms: '月結 30 天',
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: '泰興營造有限公司',
      code: 'SUP002',
      contactPerson: '李泰興',
      phone: '02-9876-5432',
      email: 'info@taising.com.tw',
      address: '新北市板橋區中山路二段50號',
      taxNumber: '87654321',
      rating: 5,
      paymentTerms: '月結 45 天',
    },
  });

  console.log('廠商資料已建立:', { supplier1: supplier1.id, supplier2: supplier2.id });

  // Create test project
  const project = await prisma.project.create({
    data: {
      name: '台北101商業大樓改建案',
      code: 'PRJ001',
      description: '台北101商業大樓內裝改建工程，包含辦公空間重新規劃、機電系統更新等',
      location: '台北市信義區信義路五段7號',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      estimatedCost: 25000000,
      actualCost: 0,
      status: 'IN_PROGRESS',
      clientName: '台北101股份有限公司',
      clientContact: '王經理 02-8101-8101',
      folderPath: '/projects/PRJ001',
      createdById: manager.id,
      managerId: manager.id,
    },
  });

  console.log('專案資料已建立:', project.id);

  // Create budget for the project
  const budget = await prisma.budget.create({
    data: {
      projectId: project.id,
      version: 1,
      totalAmount: 25000000,
      usedAmount: 0,
      remainingAmount: 25000000,
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedById: admin.id,
      items: {
        create: [
          {
            category: '結構工程',
            item: '鋼筋混凝土工程',
            unit: '立方公尺',
            quantity: 500,
            unitPrice: 15000,
            totalPrice: 7500000,
          },
          {
            category: '裝修工程',
            item: '室內裝修工程',
            unit: '坪',
            quantity: 1000,
            unitPrice: 12000,
            totalPrice: 12000000,
          },
          {
            category: '機電工程',
            item: '電氣設備安裝',
            unit: '式',
            quantity: 1,
            unitPrice: 5500000,
            totalPrice: 5500000,
          },
        ],
      },
    },
  });

  console.log('預算資料已建立:', budget.id);

  // Create material analysis list
  const materialList = await prisma.materialAnalysisList.create({
    data: {
      projectId: project.id,
      name: '台北101改建工料分析表',
      description: '主要結構及裝修材料分析',
      version: 1,
      status: 'APPROVED',
      createdById: manager.id,
      items: {
        create: [
          {
            category: '結構材料',
            item: '混凝土 C240',
            unit: '立方公尺',
            quantity: 500,
            unitPrice: 4000,
            totalPrice: 2000000,
            specification: '抗壓強度 240kgf/cm²',
          },
          {
            category: '結構材料',
            item: '鋼筋 SD420W',
            unit: '公噸',
            quantity: 50,
            unitPrice: 35000,
            totalPrice: 1750000,
            specification: '直徑 #4-#8',
          },
          {
            category: '裝修材料',
            item: '大理石地磚',
            unit: '平方公尺',
            quantity: 2000,
            unitPrice: 2500,
            totalPrice: 5000000,
            specification: '60x60cm 拋光面',
          },
        ],
      },
    },
  });

  console.log('工料分析資料已建立:', materialList.id);

  // Create test notifications
  await prisma.notification.create({
    data: {
      title: '預算審核通知',
      message: '台北101商業大樓改建案預算已通過審核',
      type: 'BUDGET_APPROVAL',
      users: {
        create: [
          {
            userId: manager.id,
            isRead: false,
          },
        ],
      },
    },
  });

  await prisma.notification.create({
    data: {
      title: '專案進度更新',
      message: '結構工程已完成 60%，進度正常',
      type: 'PROGRESS_UPDATE',
      users: {
        create: [
          {
            userId: admin.id,
            isRead: false,
          },
          {
            userId: manager.id,
            isRead: true,
          },
        ],
      },
    },
  });

  console.log('通知資料已建立');

  console.log('種子資料填入完成！');
}

main()
  .catch((e) => {
    console.error('種子資料填入失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });