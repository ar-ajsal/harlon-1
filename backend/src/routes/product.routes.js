import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Protected routes
router.post('/', authMiddleware, productController.create);
router.put('/reorder', authMiddleware, productController.reorder);
router.patch('/:id/stock', authMiddleware, productController.updateStock);
router.put('/:id', authMiddleware, productController.update);
router.delete('/:id', authMiddleware, productController.remove);

export default router;
