const express = require('express');
const jwt = require('jsonwebtoken');
const { getModels } = require('../models');

const router = express.Router();

// 健康檢查
router.get('/health', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

// 註冊
router.post('/register', async (req, res) => {
  try {
    const { User } = getModels();
    const { username, email, password, role, department } = req.body;

    if (!username || !email || !password || !department) {
      return res.status(400).json({ message: '請填寫所有必填欄位' });
    }

    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: '用戶名或電子郵件已存在' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user',
      department
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: '用戶註冊成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
});

// 登入
router.post('/login', async (req, res) => {
  try {
    const { User } = getModels();
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: '請提供用戶名和密碼' });
    }

    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username },
          { email: username }
        ]
      }
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: '用戶名或密碼錯誤' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: '帳戶已停用' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: '登入成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服務器錯誤' });
  }
});

module.exports = router;