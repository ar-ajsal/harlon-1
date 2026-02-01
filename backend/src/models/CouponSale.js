import mongoose from 'mongoose';

const couponSaleSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        uppercase: true,
        index: true,
        ref: 'Coupon'
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true
    },
    productName: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    size: {
        type: String,
        default: 'M'
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rejected'],
        default: 'Pending',
        index: true
    },
    whatsappMessage: {
        type: String
    },
    confirmedBy: {
        type: String
    },
    confirmedAt: {
        type: Date
    },
    rejectedBy: {
        type: String
    },
    rejectedAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient querying
couponSaleSchema.index({ couponCode: 1, status: 1 });
couponSaleSchema.index({ status: 1, createdAt: -1 });

// Static method to get sales count by coupon
couponSaleSchema.statics.getConfirmedCount = function (couponCode) {
    return this.countDocuments({
        couponCode,
        status: 'Confirmed'
    });
};

// Static method to get pending sales
couponSaleSchema.statics.findPending = function () {
    return this.find({ status: 'Pending' })
        .populate('productId')
        .sort({ createdAt: -1 });
};

const CouponSale = mongoose.model('CouponSale', couponSaleSchema);

export default CouponSale;
