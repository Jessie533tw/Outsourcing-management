import { Router } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();
router.use(authenticateToken);

// Get material analysis lists
router.get('/', asyncHandler(async (_req, res) => {
  const lists = await prisma.materialAnalysisList.findMany({
    include: {
      project: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, name: true, username: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const response: ApiResponse = {
    success: true,
    data: { lists }
  };

  res.json(response);
}));

export { router as materialAnalysisRoutes };