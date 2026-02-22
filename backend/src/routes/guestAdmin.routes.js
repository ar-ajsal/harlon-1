import { Router } from 'express';
import adminSecret from '../middleware/adminSecret.js';
import {
    getGuestOrders,
    getGuestOrderById,
    updateDeliveryStatus,
    updatePaymentStatus,
    notifyWhatsApp,
    getInquiries,
    updateInquiryStatus
} from '../controllers/guestAdmin.controller.js';

const router = Router();

// All routes protected by adminSecret middleware
router.use(adminSecret);

// ── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', getGuestOrders);
router.get('/orders/:orderId', getGuestOrderById);
router.patch('/orders/:orderId/delivery', updateDeliveryStatus);
router.patch('/orders/:orderId/payment', updatePaymentStatus);
router.post('/orders/:orderId/whatsapp-notify', notifyWhatsApp);

// ── Inquiries ─────────────────────────────────────────────────────────────────
router.get('/inquiries', getInquiries);
router.patch('/inquiries/:id/status', updateInquiryStatus);

export default router;
