import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: AppError | Prisma.PrismaClientKnownRequestError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = '內部服務器錯誤';
  let code = 'INTERNAL_ERROR';

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = '輸入資料驗證錯誤';
    code = 'VALIDATION_ERROR';
    
    const errors = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));

    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details: errors,
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = '資料重複，違反唯一性約束';
        code = 'DUPLICATE_ERROR';
        break;
      case 'P2025':
        statusCode = 404;
        message = '找不到相關記錄';
        code = 'NOT_FOUND';
        break;
      case 'P2003':
        statusCode = 400;
        message = '外鍵約束失敗';
        code = 'FOREIGN_KEY_ERROR';
        break;
      case 'P2014':
        statusCode = 400;
        message = '資料關聯衝突';
        code = 'RELATION_ERROR';
        break;
      default:
        statusCode = 500;
        message = '資料庫操作錯誤';
        code = 'DATABASE_ERROR';
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = '資料驗證錯誤';
    code = 'VALIDATION_ERROR';
  } else if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
  }

  // Log error (production should use proper logging system)
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, {
    error: error.message,
    stack: error.stack,
    statusCode,
    code,
    userId: (req as any).user?.id || 'anonymous',
  });

  // Development environment returns detailed error info
  const isDevelopment = process.env.NODE_ENV === 'development';

  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(isDevelopment && {
        stack: error.stack,
        details: error,
      }),
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

// Async error wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create custom error
export const createError = (message: string, statusCode: number, code?: string): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
};