import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/validate/:code', couponController.validateCode);

// Protected routes (admin only)
router.get('/', authMiddleware, couponController.getAll);
router.get('/stats', authMiddleware, couponController.getStats);
router.get('/:id', authMiddleware, couponController.getById);
router.post('/', authMiddleware, couponController.create);
router.put('/:id', authMiddleware, couponController.update);
router.delete('/:id', authMiddleware, couponController.remove);

export default router;
