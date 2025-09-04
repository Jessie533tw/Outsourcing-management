import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticateToken, requireSupervisor } from '../middleware/auth';
import { ApiResponse, ProjectWithDetails, PaginatedResponse } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, '專案名稱不能為空').max(200, '專案名稱不能超過 200 個字符'),
  code: z.string().min(1, '專案代碼不能為空').max(50, '專案代碼不能超過 50 個字符'),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  estimatedCost: z.number().min(0, '預估成本不能為負數').optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  managerId: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, '專案名稱不能為空').max(200, '專案名稱不能超過 200 個字符').optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  estimatedCost: z.number().min(0, '預估成本不能為負數').optional(),
  actualCost: z.number().min(0, '實際成本不能為負數').optional(),
  status: z.enum(['PLANNING', 'BUDGETING', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  managerId: z.string().optional(),
});

// Get projects list with filters and pagination
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  
  const {
    status,
    managerId,
    search,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build where clause
  const where: any = {};
  
  if (status) {
    where.status = { in: Array.isArray(status) ? status : [status] };
  }
  
  if (managerId) {
    where.managerId = managerId;
  }
  
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { code: { contains: search as string, mode: 'insensitive' } },
      { clientName: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate as string);
    if (endDate) where.createdAt.lte = new Date(endDate as string);
  }

  // Non-admin users can only see their own projects
  if (req.user!.role !== 'ADMIN') {
    where.OR = [
      { createdById: req.user!.id },
      { managerId: req.user!.id },
    ];
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, name: true, username: true }
        },
        manager: {
          select: { id: true, name: true, username: true }
        },
        _count: {
          select: {
            materialAnalysisLists: true,
            budgets: true,
            inquiries: true,
            purchaseOrders: true,
            schedules: true
          }
        }
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  const response: ApiResponse<PaginatedResponse<ProjectWithDetails>> = {
    success: true,
    data: {
      data: projects as ProjectWithDetails[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    },
  };

  res.json(response);
}));

// Get project by ID
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...(req.user!.role !== 'ADMIN' && {
        OR: [
          { createdById: req.user!.id },
          { managerId: req.user!.id },
        ],
      }),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, username: true, email: true }
      },
      manager: {
        select: { id: true, name: true, username: true, email: true }
      },
      materialAnalysisLists: {
        include: {
          items: true,
          createdBy: {
            select: { id: true, name: true, username: true }
          }
        },
        orderBy: { version: 'desc' }
      },
      budgets: {
        include: {
          items: true,
          approvedBy: {
            select: { id: true, name: true, username: true }
          }
        },
        orderBy: { version: 'desc' }
      },
      inquiries: {
        include: {
          createdBy: {
            select: { id: true, name: true, username: true }
          },
          _count: {
            select: { quotes: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      purchaseOrders: {
        include: {
          supplier: {
            select: { id: true, name: true, contactPerson: true }
          },
          createdBy: {
            select: { id: true, name: true, username: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      schedules: {
        include: {
          items: {
            include: {
              purchaseOrder: {
                select: { id: true, orderNumber: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          materialAnalysisLists: true,
          budgets: true,
          inquiries: true,
          purchaseOrders: true,
          schedules: true,
          progressReports: true,
          contracts: true,
          vouchers: true,
        }
      }
    },
  });

  if (!project) {
    throw createError('專案不存在或無權訪問', 404, 'PROJECT_NOT_FOUND');
  }

  const response: ApiResponse = {
    success: true,
    data: { project },
  };

  res.json(response);
}));

// Create new project (requires supervisor role)
router.post('/', requireSupervisor, asyncHandler(async (req, res) => {
  const validatedData = createProjectSchema.parse(req.body);
  
  // Check if project code already exists
  const existingProject = await prisma.project.findUnique({
    where: { code: validatedData.code },
  });

  if (existingProject) {
    throw createError('專案代碼已存在', 409, 'PROJECT_CODE_EXISTS');
  }

  // Verify manager exists if provided
  if (validatedData.managerId) {
    const manager = await prisma.user.findFirst({
      where: {
        id: validatedData.managerId,
        isActive: true,
        role: { in: ['ADMIN', 'MANAGER', 'SUPERVISOR'] }
      }
    });

    if (!manager) {
      throw createError('指定的專案經理不存在或無管理權限', 400, 'INVALID_MANAGER');
    }
  }

  // Create project folder path
  const folderPath = `/projects/${validatedData.code}`;

  const project = await prisma.project.create({
    data: {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
      estimatedCost: validatedData.estimatedCost || 0,
      folderPath,
      createdById: req.user!.id,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, username: true }
      },
      manager: {
        select: { id: true, name: true, username: true }
      },
    },
  });

  // Create initial budget template
  await prisma.budget.create({
    data: {
      projectId: project.id,
      version: 1,
      totalAmount: validatedData.estimatedCost || 0,
      status: 'DRAFT',
    },
  });

  const response: ApiResponse = {
    success: true,
    message: '專案創建成功',
    data: { project },
  };

  res.status(201).json(response);
}));

// Update project
router.put('/:id', requireSupervisor, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const validatedData = updateProjectSchema.parse(req.body);

  const existingProject = await prisma.project.findFirst({
    where: {
      id,
      ...(req.user!.role !== 'ADMIN' && {
        OR: [
          { createdById: req.user!.id },
          { managerId: req.user!.id },
        ],
      }),
    },
  });

  if (!existingProject) {
    throw createError('專案不存在或無權修改', 404, 'PROJECT_NOT_FOUND');
  }

  // Verify manager exists if provided
  if (validatedData.managerId) {
    const manager = await prisma.user.findFirst({
      where: {
        id: validatedData.managerId,
        isActive: true,
        role: { in: ['ADMIN', 'MANAGER', 'SUPERVISOR'] }
      }
    });

    if (!manager) {
      throw createError('指定的專案經理不存在或無管理權限', 400, 'INVALID_MANAGER');
    }
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, username: true }
      },
      manager: {
        select: { id: true, name: true, username: true }
      },
    },
  });

  const response: ApiResponse = {
    success: true,
    message: '專案更新成功',
    data: { project },
  };

  res.json(response);
}));

// Delete project (admin only)
router.delete('/:id', requireSupervisor, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...(req.user!.role !== 'ADMIN' && {
        createdById: req.user!.id,
      }),
    },
  });

  if (!project) {
    throw createError('專案不存在或無權刪除', 404, 'PROJECT_NOT_FOUND');
  }

  // Check if project has related data
  const hasRelatedData = await prisma.project.findFirst({
    where: { id },
    include: {
      _count: {
        select: {
          budgets: true,
          inquiries: true,
          purchaseOrders: true,
          schedules: true,
        }
      }
    }
  });

  if (hasRelatedData && (
    hasRelatedData._count.budgets > 0 ||
    hasRelatedData._count.inquiries > 0 ||
    hasRelatedData._count.purchaseOrders > 0 ||
    hasRelatedData._count.schedules > 0
  )) {
    throw createError('專案包含相關資料，無法直接刪除。請先處理所有相關的預算、詢價單、採購單和進度表。', 400, 'PROJECT_HAS_RELATED_DATA');
  }

  await prisma.project.delete({
    where: { id },
  });

  const response: ApiResponse = {
    success: true,
    message: '專案刪除成功',
  };

  res.json(response);
}));

// Get project dashboard stats
router.get('/:id/stats', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ...(req.user!.role !== 'ADMIN' && {
        OR: [
          { createdById: req.user!.id },
          { managerId: req.user!.id },
        ],
      }),
    },
  });

  if (!project) {
    throw createError('專案不存在或無權訪問', 404, 'PROJECT_NOT_FOUND');
  }

  // Get project statistics
  const [budgetStats, purchaseStats, scheduleStats, delayStats] = await Promise.all([
    // Budget stats
    prisma.budget.aggregate({
      where: { projectId: id, status: 'APPROVED' },
      _sum: { totalAmount: true, usedAmount: true, remainingAmount: true },
      _count: true,
    }),
    // Purchase order stats
    prisma.purchaseOrder.aggregate({
      where: { projectId: id },
      _sum: { totalAmount: true },
      _count: { _all: true },
    }),
    // Schedule stats
    prisma.scheduleItem.aggregate({
      where: { schedule: { projectId: id } },
      _count: { _all: true },
      _avg: { currentProgress: true },
    }),
    // Delay stats
    prisma.scheduleItem.count({
      where: { 
        schedule: { projectId: id },
        isDelayed: true 
      }
    }),
  ]);

  const stats = {
    budget: {
      total: budgetStats._sum.totalAmount || 0,
      used: budgetStats._sum.usedAmount || 0,
      remaining: budgetStats._sum.remainingAmount || 0,
      approvedBudgets: budgetStats._count,
    },
    purchaseOrders: {
      total: purchaseStats._count._all || 0,
      totalAmount: purchaseStats._sum.totalAmount || 0,
    },
    schedule: {
      totalItems: scheduleStats._count._all || 0,
      avgProgress: scheduleStats._avg.currentProgress || 0,
      delayedItems: delayStats,
    },
    project: {
      estimatedCost: project.estimatedCost,
      actualCost: project.actualCost,
      status: project.status,
    },
  };

  const response: ApiResponse = {
    success: true,
    data: { stats },
  };

  res.json(response);
}));

export { router as projectRoutes };