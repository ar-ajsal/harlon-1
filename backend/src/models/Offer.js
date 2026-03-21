import mongoose from 'mongoose';

/**
 * Offer — Promo code system for cart discounts at checkout
 * Separate from the referral Coupon model.
 * 
 * Types:
 *   'percentage' — e.g. "10% off"
 *   'fixed'      — e.g. "₹100 off"
 *   'freeship'   — Free shipping (UI only, no price math needed)
 */
const offerSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        default: 'Special Offer',
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'freeship'],
        required: true,
        default: 'percentage',
    },
    discountValue: {
        type: Number,
        default: 0,
        min: 0,
        // For percentage: 1–100. For fixed: rupee amount. For freeship: unused.
    },
    maxDiscount: {
        // Cap on percentage discounts (e.g., max ₹200 off even if 20% is more)
        type: Number,
        default: null,
    },
    minOrderAmount: {
        // Minimum order total for the offer to apply
        type: Number,
        default: 0,
    },
    usageLimit: {
        // Total times the offer can be used (null = unlimited)
        type: Number,
        default: null,
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    perUserLimit: {
        // Max times a single phone number can use this (null = unlimited)
        type: Number,
        default: 1,
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    categories: {
        // If applicableTo='categories', only products in these category names apply
        type: [String],
        default: [],
    },
    products: {
        // If applicableTo='products', only these product IDs get the discount
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: 'Product',
    },
    applicableTo: {
        // 'all'        — works on every product (default)
        // 'categories' — only products whose category is in categories[]
        // 'products'   — only the specific product IDs in products[]
        type: String,
        enum: ['all', 'categories', 'products'],
        default: 'all',
    },
    createdBy: {
        type: String,
        default: 'admin',
    },
}, {
    timestamps: true,
});

// ── Virtuals ─────────────────────────────────────────────────────────
offerSchema.virtual('isExpired').get(function () {
    return new Date() > this.expiryDate;
});

offerSchema.virtual('isExhausted').get(function () {
    return this.usageLimit !== null && this.usedCount >= this.usageLimit;
});

offerSchema.virtual('isValid').get(function () {
    const now = new Date();
    return this.isActive
        && now >= this.startDate
        && now <= this.expiryDate
        && (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// ── Instance methods ──────────────────────────────────────────────────
offerSchema.methods.calculateDiscount = function (orderAmount) {
    if (!this.isValid) return 0;
    if (orderAmount < this.minOrderAmount) return 0;

    if (this.discountType === 'freeship') return 0; // Handled in UI
    if (this.discountType === 'fixed') {
        return Math.min(this.discountValue, orderAmount);
    }
    if (this.discountType === 'percentage') {
        const raw = Math.round((orderAmount * this.discountValue) / 100);
        return this.maxDiscount ? Math.min(raw, this.maxDiscount) : raw;
    }
    return 0;
};

// Check if this offer is eligible for a given product (by id and category)
offerSchema.methods.isEligibleFor = function (productId, productCategory) {
    if (this.applicableTo === 'all') return true;
    if (this.applicableTo === 'categories') {
        if (!this.categories || this.categories.length === 0) return true;
        return this.categories.some(c =>
            c.toLowerCase() === (productCategory || '').toLowerCase()
        );
    }
    if (this.applicableTo === 'products') {
        if (!this.products || this.products.length === 0) return true;
        return this.products.some(id => String(id) === String(productId));
    }
    return true;
};

// ── Statics ───────────────────────────────────────────────────────────
offerSchema.statics.findActive = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gte: now },
    });
};

// ── JSON ──────────────────────────────────────────────────────────────
offerSchema.set('toJSON', { virtuals: true });
offerSchema.set('toObject', { virtuals: true });

const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
