import { Router } from 'express';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import uploadRoutes from './upload.routes.js';
import authRoutes from './auth.routes.js';
import orderRoutes from './order.routes.js';
import investmentRoutes from './investment.routes.js';

const router = Router();

router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/upload', uploadRoutes);
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/investments', investmentRoutes);

export default router;
