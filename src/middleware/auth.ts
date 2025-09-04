import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { createError } from './errorHandler';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        name: string;
        role: string;
        department?: string;
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  department?: string;
}

// JWT authentication middleware
export const authenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('未提供認證令牌', 401, 'MISSING_TOKEN');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw createError('JWT 密鑰未配置', 500, 'JWT_SECRET_MISSING');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    // Verify user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        department: true,
      },
    });

    if (!user) {
      throw createError('用戶不存在或已被停用', 401, 'USER_NOT_FOUND');
    }

    req.user = {
      ...user,
      department: user.department || undefined
    };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      if (error instanceof jwt.TokenExpiredError) {
        next(createError('認證令牌已過期', 401, 'TOKEN_EXPIRED'));
      } else {
        next(createError('無效的認證令牌', 401, 'INVALID_TOKEN'));
      }
    } else {
      next(error);
    }
  }
};

// Role permission check middleware
export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('用戶未認證', 401, 'USER_NOT_AUTHENTICATED'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('權限不足', 403, 'INSUFFICIENT_PERMISSION'));
    }

    next();
  };
};

// Admin permission check
export const requireAdmin = requireRole('ADMIN');

// Supervisor permission check (supervisor or admin)
export const requireSupervisor = requireRole('ADMIN', 'SUPERVISOR', 'MANAGER');

// Accountant permission check
export const requireAccountant = requireRole('ADMIN', 'ACCOUNTANT');

// Optional authentication middleware
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next();
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        department: true,
      },
    });

    if (user) {
      req.user = {
        ...user,
        department: user.department || undefined
      };
    }

    next();
  } catch (error) {
    // For optional auth, we ignore authentication errors
    next();
  }
};