import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();
router.use(authenticateToken);

router.get('/', asyncHandler(async (_req, res) => {
  const response: ApiResponse = {
    success: true,
    data: { inquiries: [] }
  };
  res.json(response);
}));

export { router as inquiryRoutes };