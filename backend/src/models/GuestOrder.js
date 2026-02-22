import mongoose from 'mongoose';
import crypto from 'crypto';

const trackingEventSchema = new mongoose.Schema({
    status: { type: String, required: true },
    note: { type: String, default: '' },
    location: { type: String, default: '' },
    actor: { type: String, default: 'system' }, // 'system' | 'admin'
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const guestOrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Secure one-click tracking token (32 random bytes → 64 hex chars)
    trackToken: {
        type: String,
        unique: true,
        index: true,
        default: () => crypto.randomBytes(32).toString('hex')
    },

    product: {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String, default: '' },
        size: { type: String, required: true },
        price: { type: Number, required: true }
    },

    customer: {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        company: { type: String, default: '', trim: true },
        country: { type: String, required: true, trim: true, default: 'India' },
        streetAddress: { type: String, required: true, trim: true },
        apartment: { type: String, default: '', trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pinCode: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        orderNotes: { type: String, default: '', trim: true }
    },

    payment: {
        method: {
            type: String,
            enum: ['razorpay', 'cod', 'whatsapp'],
            required: true
        },
        razorpay_order_id: { type: String, default: null },
        razorpay_payment_id: { type: String, default: null },
        payment_status: {
            type: String,
            enum: ['pending', 'paid', 'cod_pending', 'cod_confirmed', 'failed'],
            default: 'pending'
        }
    },

    deliveryStatus: {
        type: String,
        enum: ['processing', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'processing'
    },

    // Full timeline — one entry per status change
    trackingEvents: [trackingEventSchema],

    // Courier / shipping info set by admin
    courier: {
        name: { type: String, default: '' },
        trackingNumber: { type: String, default: '' },
        url: { type: String, default: '' }
    },

    // Authoritative order total in INR (rupees)
    amount: { type: Number, default: 0 }

}, { timestamps: true });

// Compound index for fast track-order lookups
guestOrderSchema.index({ orderId: 1, 'customer.email': 1 });

export default mongoose.model('GuestOrder', guestOrderSchema);
