import { Router } from 'express';
import offerService from '../services/offer.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ── Public routes (no auth) ───────────────────────────────────────────
// Validate a promo code at checkout
router.get('/validate/:code', asyncHandler(async (req, res) => {
    const orderAmount = parseFloat(req.query.amount) || 0;
    const productId = req.query.productId || null;
    const productCategory = req.query.category || null;
    const offer = await offerService.validateCode(req.params.code, orderAmount, productId, productCategory);
    res.json(ApiResponse.success(offer, 'Offer is valid'));
}));

// ── Admin-only routes ─────────────────────────────────────────────────
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
    const offers = await offerService.getAll(req.query);
    res.json(ApiResponse.success(offers));
}));

router.get('/stats', authMiddleware, asyncHandler(async (req, res) => {
    const stats = await offerService.getStats();
    res.json(ApiResponse.success(stats));
}));

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const offer = await offerService.getById(req.params.id);
    res.json(ApiResponse.success(offer));
}));

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
    const offer = await offerService.create(req.body);
    res.status(201).json(ApiResponse.success(offer, 'Offer created successfully'));
}));

router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
    const offer = await offerService.update(req.params.id, req.body);
    res.json(ApiResponse.success(offer, 'Offer updated successfully'));
}));

router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
    await offerService.delete(req.params.id);
    res.json(ApiResponse.success(null, 'Offer deleted successfully'));
}));

// Manually increment usage (admin / order-completion webhook)
router.post('/:code/use', authMiddleware, asyncHandler(async (req, res) => {
    await offerService.incrementUsage(req.params.code);
    res.json(ApiResponse.success(null, 'Usage incremented'));
}));

export default router;
