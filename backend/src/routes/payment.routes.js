import { Router } from 'express';
import express from 'express';
import { razorpayWebhook } from '../controllers/payment.controller.js';

const router = Router();

/**
 * POST /api/payment/webhook
 *
 * IMPORTANT: This route must receive the RAW request body (Buffer) for
 * HMAC signature verification. express.raw() is applied here ONLY for
 * this specific path. The global express.json() in app.js is NOT used here.
 */
router.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    razorpayWebhook
);

export default router;
