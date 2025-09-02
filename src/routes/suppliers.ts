import { Router } from 'express';
import { prisma } from '../index';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', asyncHandler(async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  const response: ApiResponse = {
    success: true,
    data: { suppliers }
  };

  res.json(response);
}));

export { router as supplierRoutes };