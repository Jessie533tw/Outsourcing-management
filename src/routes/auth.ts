import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('無效的電子郵件格式'),
  username: z.string().min(3, '用戶名至少需要 3 個字符').max(50, '用戶名不能超過 50 個字符'),
  password: z.string().min(6, '密碼至少需要 6 個字符').max(100, '密碼不能超過 100 個字符'),
  name: z.string().min(1, '姓名不能為空').max(100, '姓名不能超過 100 個字符'),
  department: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1, '請輸入用戶名或電子郵件'),
  password: z.string().min(1, '請輸入密碼'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '請輸入當前密碼'),
  newPassword: z.string().min(6, '新密碼至少需要 6 個字符').max(100, '新密碼不能超過 100 個字符'),
});

// Generate JWT token
const generateToken = (payload: any): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError('JWT 密鑰未配置', 500, 'JWT_SECRET_MISSING');
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const validatedData = registerSchema.parse(req.body);
  
  // Check if username and email already exist
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: validatedData.email },
        { username: validatedData.username },
      ],
    },
  });

  if (existingUser) {
    if (existingUser.email === validatedData.email) {
      throw createError('此電子郵件已被註冊', 409, 'EMAIL_EXISTS');
    } else {
      throw createError('此用戶名已被使用', 409, 'USERNAME_EXISTS');
    }
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      username: validatedData.username,
      password: hashedPassword,
      name: validatedData.name,
      department: validatedData.department,
      phone: validatedData.phone,
      role: 'STAFF', // Default to staff
    },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      department: true,
      phone: true,
      createdAt: true,
    },
  });

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
  });

  const response: ApiResponse = {
    success: true,
    message: '註冊成功',
    data: {
      user,
      token,
    },
  };

  res.status(201).json(response);
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);

  // Find user by username or email
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { username: identifier },
      ],
      isActive: true,
    },
  });

  if (!user) {
    throw createError('用戶名/電子郵件或密碼錯誤', 401, 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw createError('用戶名/電子郵件或密碼錯誤', 401, 'INVALID_CREDENTIALS');
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
  });

  // Update last login time (optional)
  await prisma.user.update({
    where: { id: user.id },
    data: { updatedAt: new Date() },
  });

  const userResponse = {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    department: user.department,
    phone: user.phone,
    createdAt: user.createdAt,
  };

  const response: ApiResponse = {
    success: true,
    message: '登入成功',
    data: {
      user: userResponse,
      token,
    },
  };

  res.json(response);
}));

// Get current user info
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      department: true,
      phone: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createError('用戶不存在', 404, 'USER_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    data: { user },
  };

  res.json(response);
}));

// Update user profile
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const updateSchema = z.object({
    name: z.string().min(1, '姓名不能為空').max(100, '姓名不能超過 100 個字符').optional(),
    department: z.string().optional(),
    phone: z.string().optional(),
  });

  const validatedData = updateSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: validatedData,
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      department: true,
      phone: true,
      updatedAt: true,
    },
  });

  const response: ApiResponse = {
    success: true,
    message: '個人資料更新成功',
    data: { user },
  };

  res.json(response);
}));

// Change password
router.put('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  // Get user current password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { password: true },
  });

  if (!user) {
    throw createError('用戶不存在', 404, 'USER_NOT_FOUND');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw createError('當前密碼錯誤', 400, 'INVALID_CURRENT_PASSWORD');
  }

  // Hash new password
  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedNewPassword },
  });

  const response: ApiResponse = {
    success: true,
    message: '密碼修改成功',
  };

  res.json(response);
}));

// Refresh token
router.post('/refresh', authenticateToken, asyncHandler(async (req, res) => {
  const token = generateToken({
    id: req.user!.id,
    email: req.user!.email,
    username: req.user!.username,
    name: req.user!.name,
    role: req.user!.role,
    department: req.user!.department,
  });

  const response: ApiResponse = {
    success: true,
    message: 'Token 刷新成功',
    data: { token },
  };

  res.json(response);
}));

// Logout (frontend handles this, backend just responds with success)
router.post('/logout', authenticateToken, (_req, res) => {
  const response: ApiResponse = {
    success: true,
    message: '登出成功',
  };

  res.json(response);
});

export { router as authRoutes };