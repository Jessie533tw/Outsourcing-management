const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');
const { Material } = require('../src/models/Material');
const Vendor = require('../src/models/Vendor');

const initData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_procurement');
    console.log('已連接到 MongoDB');

    await User.deleteMany({});
    await Material.deleteMany({});
    await Vendor.deleteMany({});
    
    const users = [
      {
        username: 'admin',
        email: 'admin@company.com',
        password: 'password',
        role: 'admin',
        department: '資訊部'
      },
      {
        username: 'manager',
        email: 'manager@company.com', 
        password: 'password',
        role: 'manager',
        department: '工程部'
      },
      {
        username: 'supervisor',
        email: 'supervisor@company.com',
        password: 'password',
        role: 'supervisor',
        department: '施工部'
      }
    ];

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await User.create({ ...userData, password: hashedPassword });
    }

    const materials = [
      {
        materialId: 'MAT-001',
        name: '水泥',
        category: '建材',
        unit: '包',
        specification: '台泥 1號水泥 50kg',
        standardPrice: 200,
        isActive: true
      },
      {
        materialId: 'MAT-002',
        name: '鋼筋',
        category: '建材',
        unit: '公噸',
        specification: 'SD420W #5 鋼筋',
        standardPrice: 25000,
        isActive: true
      },
      {
        materialId: 'MAT-003',
        name: '紅磚',
        category: '建材',
        unit: '塊',
        specification: '標準紅磚 230x110x60mm',
        standardPrice: 8,
        isActive: true
      },
      {
        materialId: 'MAT-004',
        name: '石材',
        category: '裝修',
        unit: '平方公尺',
        specification: '花崗岩石材 厚度3cm',
        standardPrice: 1500,
        isActive: true
      },
      {
        materialId: 'MAT-005',
        name: '混凝土',
        category: '建材',
        unit: '立方公尺',
        specification: '280kgf/cm² 預拌混凝土',
        standardPrice: 3500,
        isActive: true
      }
    ];

    await Material.insertMany(materials);

    const vendors = [
      {
        vendorId: 'VEN-001',
        name: '建材供應商A',
        companyName: '台北建材有限公司',
        contactPerson: '王經理',
        email: 'vendor-a@example.com',
        phone: '02-1234-5678',
        address: '台北市信義區建材路123號',
        taxId: '12345678',
        specialties: ['建材', '水泥', '鋼筋'],
        rating: 4.5,
        isActive: true,
        paymentTerms: '月結30天',
        notes: '主要建材供應商，品質穩定'
      },
      {
        vendorId: 'VEN-002',
        name: '裝修材料商B',
        companyName: '新北裝修材料股份有限公司',
        contactPerson: '李經理',
        email: 'vendor-b@example.com',
        phone: '02-8765-4321',
        address: '新北市板橋區裝修街456號',
        taxId: '87654321',
        specialties: ['裝修', '石材', '瓷磚'],
        rating: 4.2,
        isActive: true,
        paymentTerms: '月結45天',
        notes: '裝修材料專業供應商'
      },
      {
        vendorId: 'VEN-003',
        name: '混凝土供應商C',
        companyName: '高雄混凝土工業社',
        contactPerson: '張經理',
        email: 'vendor-c@example.com',
        phone: '07-9876-5432',
        address: '高雄市三民區混凝土大道789號',
        taxId: '13579246',
        specialties: ['混凝土', '預拌', '泵送'],
        rating: 4.8,
        isActive: true,
        paymentTerms: '現金交易',
        notes: '南部最大混凝土供應商'
      }
    ];

    await Vendor.insertMany(vendors);

    console.log('測試資料初始化完成！');
    console.log('使用者帳戶：');
    console.log('- admin@company.com / password (管理員)');
    console.log('- manager@company.com / password (經理)');
    console.log('- supervisor@company.com / password (主管)');
    console.log('材料資料：5 項');
    console.log('廠商資料：3 家');
    
  } catch (error) {
    console.error('初始化資料失敗:', error);
  } finally {
    await mongoose.disconnect();
  }
};

initData();