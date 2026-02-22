import { Router } from 'express';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import uploadRoutes from './upload.routes.js';
import authRoutes from './auth.routes.js';
import orderRoutes from './order.routes.js';
import couponRoutes from './coupon.routes.js';
import couponSaleRoutes from './couponSale.routes.js';
// ── Guest Checkout System ──────────────────────────────────────────────────────
import guestOrderRoutes from './guestOrder.routes.js';
import paymentRoutes from './payment.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import guestAdminRoutes from './guestAdmin.routes.js';

const router = Router();

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/coupon-sales', couponSaleRoutes);
// ── Guest Checkout System ──────────────────────────────────────────────────────
router.use('/guest-orders', guestOrderRoutes);
router.use('/payment', paymentRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/guest-admin', guestAdminRoutes);

export default router;
