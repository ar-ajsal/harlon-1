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
// ── Monitoring ─────────────────────────────────────────────────────────────────
import vitalsRoutes from './vitals.routes.js';
// ── Football Fan Platform ──────────────────────────────────────────────────────
import dropRoutes from './drop.routes.js';
import predictionRoutes from './prediction.routes.js';
import fanCollectionRoutes from './fanCollection.routes.js';
import offerRoutes from './offer.routes.js';
import settingsRoutes from './settings.routes.js';


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
// ── Monitoring ─────────────────────────────────────────────────────────────────
router.use('/vitals', vitalsRoutes);
// ── Football Fan Platform ──────────────────────────────────────────────────────
router.use('/drops', dropRoutes);
router.use('/predictions', predictionRoutes);
router.use('/fan', fanCollectionRoutes);
// ── Offer / Promo Management ───────────────────────────────────────────────────
router.use('/offers', offerRoutes);
// ── App Settings (payment/order toggles) ───────────────────────────────────────────
router.use('/settings', settingsRoutes);


export default router;

