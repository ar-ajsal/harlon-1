import { Router } from 'express';
import * as investmentController from '../controllers/investment.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// CRUD routes
router.get('/', investmentController.getAll);
router.get('/total', investmentController.getTotal);
router.get('/by-category', investmentController.getByCategory);
router.get('/monthly/:year/:month', investmentController.getMonthly);
router.get('/:id', investmentController.getById);
router.post('/', investmentController.create);
router.put('/:id', investmentController.update);
router.delete('/:id', investmentController.remove);

export default router;
