import { Router } from 'express';
import { getSlides, getAllSlides, addSlide, updateSlide, deleteSlide } from '../controllers/slider.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getSlides);

// Admin routes
router.get('/all', authMiddleware, getAllSlides);
router.post('/', authMiddleware, addSlide);
router.patch('/:id', authMiddleware, updateSlide);
router.delete('/:id', authMiddleware, deleteSlide);

export default router;
