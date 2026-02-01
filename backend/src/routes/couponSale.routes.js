import { Router } from 'express';
import * as couponSaleController from '../controllers/couponSale.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public route - create pending sale
router.post('/', couponSaleController.create);

// Protected routes (admin only)
router.get('/', authMiddleware, couponSaleController.getAll);
router.get('/stats', authMiddleware, couponSaleController.getStats);
router.get('/pending-count', authMiddleware, couponSaleController.getPendingCount);
router.get('/coupon/:code', authMiddleware, couponSaleController.getByCoupon);
router.put('/:id/confirm', authMiddleware, couponSaleController.confirmSale);
router.put('/:id/reject', authMiddleware, couponSaleController.rejectSale);
router.delete('/:id', authMiddleware, couponSaleController.remove);

export default router;
