import crypto from 'crypto';
import Product from '../models/Product.js';
import GuestOrder from '../models/GuestOrder.js';
import { sendOrderEmail } from '../config/mailer.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateOrderId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const suffix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `HRL-${Date.now()}-${suffix}`;
}

function sanitize(str) {
    return (str || '').replace(/<[^>]*>/g, '').trim();
}

// Minimal public-safe order view (no internal IDs, full customer details)
function publicView(order) {
    return {
        orderId: order.orderId,
        product: order.product,
        amount: order.amount,
        paymentStatus: order.payment.payment_status,
        paymentMethod: order.payment.method,
        deliveryStatus: order.deliveryStatus,
        trackingEvents: order.trackingEvents,
        courier: order.courier,
        createdAt: order.createdAt,
        trackLink: `${process.env.SITE_URL || process.env.FRONTEND_URL || 'https://harlon.shop'}/track-order?token=${order.trackToken}`
    };
}

// ─── Create Order ─────────────────────────────────────────────────────────────

export const createOrder = async (req, res) => {
    try {
        const { productId, size, customer, paymentMethod } = req.body;

        if (!productId || !size || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'productId, size, and paymentMethod are required' });
        }
        if (!customer?.firstName || !customer?.lastName || !customer?.email ||
            !customer?.phone || !customer?.streetAddress || !customer?.city ||
            !customer?.state || !customer?.pinCode) {
            return res.status(400).json({ success: false, message: 'First name, last name, email, phone, street address, city, state, and PIN code are required' });
        }
        if (!['razorpay', 'whatsapp'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Invalid paymentMethod' });
        }

        const product = await Product.findById(productId).lean();
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (!product.inStock || product.stock <= 0) {
            return res.status(400).json({ success: false, message: 'Product is out of stock' });
        }
        if (product.sizes?.length > 0 && !product.sizes.includes(size)) {
            return res.status(400).json({ success: false, message: `Size ${size} not available for this product` });
        }

        const orderId = generateOrderId();
        const priceFromDB = product.price;
        const amountPaise = Math.round(priceFromDB * 100);

        const customerData = {
            firstName: sanitize(customer.firstName),
            lastName: sanitize(customer.lastName),
            company: sanitize(customer.company || ''),
            country: sanitize(customer.country || 'India'),
            streetAddress: sanitize(customer.streetAddress),
            apartment: sanitize(customer.apartment || ''),
            city: sanitize(customer.city),
            state: sanitize(customer.state),
            pinCode: sanitize(customer.pinCode),
            phone: sanitize(customer.phone),
            email: sanitize(customer.email).toLowerCase(),
            orderNotes: sanitize(customer.orderNotes || '')
        };

        const productData = {
            productId: product._id,
            name: product.name,
            image: product.images?.[0] || '',
            size,
            price: priceFromDB
        };

        const initialEvent = {
            status: 'order_placed',
            note: 'Order placed by customer',
            actor: 'system',
            timestamp: new Date()
        };

        // ── RAZORPAY ──────────────────────────────────────────────────────────
        if (paymentMethod === 'razorpay') {
            let razorpayOrder;
            try {
                const { default: getRazorpay } = await import('../config/razorpay.js');
                razorpayOrder = await getRazorpay().orders.create({
                    amount: amountPaise,
                    currency: 'INR',
                    receipt: orderId,
                    notes: { orderId, productName: product.name, size }
                });
            } catch (rzErr) {
                console.error('[guestOrder] Razorpay order creation failed:', rzErr.message);
                return res.status(502).json({ success: false, message: 'Payment gateway error. Try again.' });
            }

            const newOrder = await GuestOrder.create({
                orderId,
                product: productData,
                customer: customerData,
                amount: priceFromDB,
                payment: {
                    method: 'razorpay',
                    razorpay_order_id: razorpayOrder.id,
                    payment_status: 'pending'
                },
                trackingEvents: [initialEvent]
            });

            return res.status(201).json({
                success: true,
                paymentMethod: 'razorpay',
                orderId,
                trackToken: newOrder.trackToken,
                razorpayOrderId: razorpayOrder.id,
                keyId: process.env.RAZORPAY_KEY_ID,
                amount: amountPaise,
                currency: 'INR',
                customerName: `${customerData.firstName} ${customerData.lastName}`,
                customerEmail: customerData.email,
                customerPhone: customerData.phone
            });
        }

        // ── WHATSAPP ──────────────────────────────────────────────────────────
        if (paymentMethod === 'whatsapp') {
            const newOrder = await GuestOrder.create({
                orderId,
                product: productData,
                customer: customerData,
                amount: priceFromDB,
                payment: { method: 'whatsapp', payment_status: 'pending' },
                trackingEvents: [initialEvent]
            });

            return res.status(201).json({
                success: true,
                paymentMethod: 'whatsapp',
                orderId,
                trackToken: newOrder.trackToken
            });
        }

    } catch (err) {
        console.error('[guestOrder] createOrder error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── Track Order (email + orderId) ────────────────────────────────────────────

export const trackOrder = async (req, res) => {
    try {
        const { email, orderId } = req.query;
        if (!email || !orderId) {
            return res.status(400).json({ success: false, message: 'Email and orderId are required' });
        }

        const order = await GuestOrder.findOne({
            orderId: orderId.trim(),
            'customer.email': email.trim().toLowerCase()
        }).lean();

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found. Please check your email and order ID.' });
        }

        return res.status(200).json({ success: true, order: publicView(order) });
    } catch (err) {
        console.error('[guestOrder] trackOrder error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// ─── Track Order (token) ──────────────────────────────────────────────────────

export const trackByToken = async (req, res) => {
    try {
        const { token } = req.params;
        if (!token || token.length < 32) {
            return res.status(400).json({ success: false, message: 'Invalid tracking token' });
        }

        const order = await GuestOrder.findOne({ trackToken: token }).lean();
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found. The link may have expired or be invalid.' });
        }

        return res.status(200).json({ success: true, order: publicView(order) });
    } catch (err) {
        console.error('[guestOrder] trackByToken error:', err.message);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
