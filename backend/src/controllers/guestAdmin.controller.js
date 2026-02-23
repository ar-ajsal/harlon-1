import GuestOrder from '../models/GuestOrder.js';
import Inquiry from '../models/Inquiry.js';
import { sendOrderEmail } from '../config/mailer.js';

const PAGE_SIZE = 50;
// Read lazily at call-time so dotenv has already populated process.env
function getSiteUrl() {
    return process.env.SITE_URL || process.env.FRONTEND_URL || 'https://harlon.shop';
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

/**
 * GET /api/guest-admin/orders?page=1&status=&paymentStatus=&q=
 */
export const getGuestOrders = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const filter = {};

        if (req.query.status) filter.deliveryStatus = req.query.status;
        if (req.query.paymentStatus) filter['payment.payment_status'] = req.query.paymentStatus;

        // Free-text search on orderId or customer email
        if (req.query.q) {
            const q = req.query.q.trim();
            filter.$or = [
                { orderId: { $regex: q, $options: 'i' } },
                { 'customer.email': { $regex: q, $options: 'i' } },
                { 'customer.firstName': { $regex: q, $options: 'i' } },
                { 'customer.lastName': { $regex: q, $options: 'i' } },
                { 'product.name': { $regex: q, $options: 'i' } }
            ];
        }

        const [orders, total] = await Promise.all([
            GuestOrder.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .lean(),
            GuestOrder.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            orders,
            pagination: { page, pageSize: PAGE_SIZE, total, pages: Math.ceil(total / PAGE_SIZE) }
        });
    } catch (err) {
        console.error('[guestAdmin] getGuestOrders error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * GET /api/guest-admin/orders/:orderId
 * Returns full order detail for admin.
 */
export const getGuestOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await GuestOrder.findOne({ orderId }).lean();
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.status(200).json({ success: true, order });
    } catch (err) {
        console.error('[guestAdmin] getGuestOrderById error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * PATCH /api/guest-admin/orders/:orderId/delivery
 * Body: { deliveryStatus, note?, courier?: { name, trackingNumber, url } }
 */
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { deliveryStatus, note, courier } = req.body;

        const validStatuses = ['processing', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(deliveryStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid deliveryStatus' });
        }

        const order = await GuestOrder.findOne({ orderId });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order.deliveryStatus = deliveryStatus;

        // Push tracking event
        order.trackingEvents.push({
            status: deliveryStatus,
            note: note || `Status updated to ${deliveryStatus}`,
            actor: 'admin',
            timestamp: new Date()
        });

        // Save optional courier info
        if (courier && typeof courier === 'object') {
            order.courier = {
                name: (courier.name || '').trim(),
                trackingNumber: (courier.trackingNumber || '').trim(),
                url: (courier.url || '').trim()
            };
        }

        await order.save();

        // Send email for key milestones
        const emailStatuses = ['shipped', 'out-for-delivery', 'delivered'];
        if (emailStatuses.includes(deliveryStatus)) {
            sendOrderEmail(deliveryStatus, order).catch(console.error);
        }

        return res.status(200).json({ success: true, order, emailSent: emailStatuses.includes(deliveryStatus) });
    } catch (err) {
        console.error('[guestAdmin] updateDeliveryStatus error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * PATCH /api/guest-admin/orders/:orderId/payment
 * Body: { payment_status }
 */
export const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { payment_status } = req.body;

        const validStatuses = ['pending', 'paid', 'cod_pending', 'cod_confirmed', 'failed'];
        if (!validStatuses.includes(payment_status)) {
            return res.status(400).json({ success: false, message: 'Invalid payment_status' });
        }

        const order = await GuestOrder.findOne({ orderId });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        order.payment.payment_status = payment_status;

        order.trackingEvents.push({
            status: `payment_${payment_status}`,
            note: `Payment status updated to ${payment_status}`,
            actor: 'admin',
            timestamp: new Date()
        });

        await order.save();

        return res.status(200).json({ success: true, order });
    } catch (err) {
        console.error('[guestAdmin] updatePaymentStatus error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * POST /api/guest-admin/orders/:orderId/whatsapp-notify
 * Returns a prefilled wa.me link so the admin can open it.
 */
export const notifyWhatsApp = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await GuestOrder.findOne({ orderId }).lean();
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const firstName = order.customer?.firstName || 'Customer';
        const trackLink = `${getSiteUrl()}/track-order?token=${order.trackToken}`;
        const status = order.deliveryStatus;
        const product = order.product?.name || 'your jersey';

        const messageMap = {
            processing: `Hi ${firstName}! Your Harlon order (${orderId}) for *${product}* is being processed. Track here: ${trackLink}`,
            confirmed: `Hi ${firstName}! Your Harlon order (${orderId}) for *${product}* has been confirmed! Track here: ${trackLink}`,
            packed: `Hi ${firstName}! Your Harlon order (${orderId}) for *${product}* is packed and ready to ship. Track here: ${trackLink}`,
            shipped: `Hi ${firstName}! Great news — your Harlon order (${orderId}) for *${product}* is on the way! Track: ${trackLink}${order.courier?.trackingNumber ? '\n\nCourier: ' + (order.courier.name || '') + ' | Tracking No: ' + order.courier.trackingNumber : ''}`,
            'out-for-delivery': `Hi ${firstName}! Your Harlon order (${orderId}) for *${product}* is out for delivery today! 🚚 Track: ${trackLink}`,
            delivered: `Hi ${firstName}! Your Harlon order (${orderId}) for *${product}* has been delivered! 🎉 We hope you love it. Track: ${trackLink}`,
        };

        const message = messageMap[status] ||
            `Hi ${firstName}! Update on your Harlon order (${orderId}): status is now *${status}*. Track: ${trackLink}`;

        const phone = (order.customer?.phone || '').replace(/\D/g, '');
        const waUrl = `https://wa.me/${phone || ''}?text=${encodeURIComponent(message)}`;

        return res.status(200).json({ success: true, whatsappUrl: waUrl, message });
    } catch (err) {
        console.error('[guestAdmin] notifyWhatsApp error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── INQUIRIES ────────────────────────────────────────────────────────────────

export const getInquiries = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page || '1', 10));
        const filter = {};
        if (req.query.status) filter.status = req.query.status;

        const [inquiries, total] = await Promise.all([
            Inquiry.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .lean(),
            Inquiry.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true, inquiries,
            pagination: { page, pageSize: PAGE_SIZE, total, pages: Math.ceil(total / PAGE_SIZE) }
        });
    } catch (err) {
        console.error('[guestAdmin] getInquiries error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['new', 'contacted', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const inquiry = await Inquiry.findByIdAndUpdate(id, { status }, { new: true, lean: true });
        if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

        return res.status(200).json({ success: true, inquiry });
    } catch (err) {
        console.error('[guestAdmin] updateInquiryStatus error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
