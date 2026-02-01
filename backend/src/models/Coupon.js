import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    targetSales: {
        type: Number,
        required: true,
        min: 1,
        default: 5
    },
    currentSales: {
        type: Number,
        default: 0,
        min: 0
    },
    rewardDescription: {
        type: String,
        required: true,
        default: '1 Free Jersey'
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'none'],
        default: 'none'
    },
    discountValue: {
        type: Number,
        default: 0,
        min: [0, 'Discount value cannot be negative']
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    createdBy: {
        type: String,
        default: 'admin'
    }
}, {
    timestamps: true
});

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function () {
    return new Date() > this.expiryDate;
});

// Virtual for checking if target is reached
couponSchema.virtual('isTargetReached').get(function () {
    return this.currentSales >= this.targetSales;
});

// Virtual for progress percentage
couponSchema.virtual('progressPercentage').get(function () {
    return Math.min(100, Math.round((this.currentSales / this.targetSales) * 100));
});

// Instance method to check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        now >= this.startDate &&
        now <= this.expiryDate &&
        !this.isTargetReached;
};

// Static method to find active coupons
couponSchema.statics.findActive = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        startDate: { $lte: now },
        expiryDate: { $gte: now }
    });
};

// Ensure virtual fields are included in JSON
couponSchema.set('toJSON', { virtuals: true });
couponSchema.set('toObject', { virtuals: true });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
