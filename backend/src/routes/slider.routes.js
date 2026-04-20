import { Router } from 'express';
import { getSlides, getAllSlides, addSlide, updateSlide, deleteSlide } from '../controllers/slider.controller.js';
import { adminOnly, verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getSlides);

// Admin routes
router.get('/all', verifyToken, adminOnly, getAllSlides);
router.post('/', verifyToken, adminOnly, addSlide);
router.patch('/:id', verifyToken, adminOnly, updateSlide);
router.delete('/:id', verifyToken, adminOnly, deleteSlide);

export default router;
