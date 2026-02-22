import crypto from 'crypto';
import GuestOrder from '../models/GuestOrder.js';
import Product from '../models/Product.js';
import { sendOrderEmail } from '../config/mailer.js';

/**
 * POST /api/payment/webhook
 * Verifies Razorpay signature and marks the order as paid.
 *
 * ⚠️  This route uses express.raw() — the raw Buffer body must be intact.
 */
export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not set');
            return res.status(500).json({ success: false, message: 'Server misconfiguration' });
        }

        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            return res.status(400).json({ success: false, message: 'Missing signature' });
        }

        // req.body is a Buffer when using express.raw()
        const rawBody = req.body;

        const expectedSig = crypto
            .createHmac('sha256', webhookSecret)
            .update(rawBody)
            .digest('hex');

        let isValid = false;
        try {
            const sigBuf = Buffer.from(signature, 'hex');
            const expBuf = Buffer.from(expectedSig, 'hex');
            // timingSafeEqual requires same byte length
            if (sigBuf.length === expBuf.length) {
                isValid = crypto.timingSafeEqual(sigBuf, expBuf);
            }
        } catch (sigErr) {
            console.warn('[webhook] Signature comparison error:', sigErr.message);
        }

        if (!isValid) {
            console.warn('[webhook] Invalid signature');
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        const payload = JSON.parse(rawBody.toString());
        const event = payload.event;

        if (event === 'payment.captured' || event === 'payment.authorized') {
            const paymentEntity = payload.payload?.payment?.entity;
            const razorpay_order_id = paymentEntity?.order_id;
            const razorpay_payment_id = paymentEntity?.id;

            if (!razorpay_order_id) {
                return res.status(400).json({ success: false, message: 'No order_id in payload' });
            }

            const order = await GuestOrder.findOne({ 'payment.razorpay_order_id': razorpay_order_id });
            if (!order) {
                console.warn('[webhook] GuestOrder not found for razorpay_order_id:', razorpay_order_id);
                return res.status(200).json({ success: true }); // stop retries
            }

            // Idempotency — skip if already paid
            if (order.payment.payment_status === 'paid') {
                return res.status(200).json({ success: true });
            }

            // Update payment fields
            order.payment.payment_status = 'paid';
            order.payment.razorpay_payment_id = razorpay_payment_id;
            order.deliveryStatus = 'processing';

            // Push tracking event
            order.trackingEvents.push({
                status: 'payment_confirmed',
                note: 'Payment confirmed via Razorpay',
                actor: 'system',
                timestamp: new Date()
            });

            await order.save();

            // ── Decrement stock ─────────────────────────────────────────────
            try {
                const updated = await Product.findByIdAndUpdate(
                    order.product.productId,
                    [{
                        $set: {
                            stock: { $max: [0, { $subtract: ['$stock', 1] }] },
                            inStock: { $gt: [{ $max: [0, { $subtract: ['$stock', 1] }] }, 0] }
                        }
                    }],
                    { new: true }
                );
                if (updated) {
                    console.log(`[stock] ${updated.name} → stock: ${updated.stock}, inStock: ${updated.inStock}`);
                }
            } catch (stockErr) {
                console.error('[stock] Failed to decrement stock:', stockErr.message);
            }

            // Non-blocking email with trackToken in the template
            sendOrderEmail('paid', order).catch(console.error);
        }

        // Always return 200 to Razorpay to stop retries
        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('[webhook] Error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
