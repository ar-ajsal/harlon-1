import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { createOrder, trackOrder, trackByToken } from '../controllers/guestOrder.controller.js';

const router = Router();

// Rate limit for createOrder: 10 requests per minute per IP
const createLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many order attempts. Please try again in a minute.' }
});

// Rate limit for track-order: 30 requests per 15 minutes per IP
const trackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many tracking requests. Please try again in 15 minutes.' }
});

router.post('/create', createLimiter, createOrder);
router.get('/track', trackLimiter, trackOrder);
router.get('/track/:token', trackLimiter, trackByToken);

export default router;
