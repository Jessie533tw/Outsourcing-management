import { Router } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', asyncHandler(async (_req, res) => {
  const budgets = await prisma.budget.findMany({
    include: {
      project: { select: { id: true, name: true, code: true } },
      approvedBy: { select: { id: true, name: true, username: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    data: { budgets }
  };

  res.json(response);
}));

export { router as budgetRoutes };