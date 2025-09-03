const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateEmail } = require('../utils/helpers');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, department } = req.body;

    if (!username || !email || !password || !department) {
      return res.status(400).json({ message: '請填寫所有必填欄位' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: '請輸入有效的電子郵件地址' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ message: '用戶名或電子郵件已存在' });
    }

    const user = new User({ username, email, password, role, department });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '用戶註冊成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '請輸入電子郵件和密碼' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: '無效的憑證' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '無效的憑證' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登入成功',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

router.get('/profile', authenticateToken, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department
    }
  });
});

module.exports = router;