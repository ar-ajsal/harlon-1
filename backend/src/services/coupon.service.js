import Coupon from '../models/Coupon.js';
import CouponSale from '../models/CouponSale.js';
import ApiError from '../utils/ApiError.js';

class CouponService {
    // Get all coupons with stats
    async getAll(filters = {}) {
        const query = {};

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive === 'true';
        }

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 50;
        const skip = (page - 1) * limit;

        const [coupons, total] = await Promise.all([
            Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Coupon.countDocuments(query)
        ]);

        return {
            data: coupons,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        };
    }

    // Get single coupon by ID with sales data
    async getById(id) {
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            throw ApiError.notFound('Coupon not found');
        }

        // Get sales data for this coupon
        const sales = await CouponSale.find({ couponCode: coupon.code })
            .populate('productId')
            .sort({ createdAt: -1 });

        const confirmedSales = sales.filter(s => s.status === 'Confirmed');
        const pendingSales = sales.filter(s => s.status === 'Pending');
        const totalRevenue = confirmedSales.reduce((sum, s) => sum + s.amount, 0);

        return {
            ...coupon.toObject(),
            sales,
            stats: {
                confirmedCount: confirmedSales.length,
                pendingCount: pendingSales.length,
                totalRevenue
            }
        };
    }

    // Validate coupon code (public endpoint)
    async validateCode(code) {
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            throw ApiError.notFound('Coupon code not found');
        }

        if (!coupon.isValid()) {
            const reason = !coupon.isActive ? 'inactive' :
                coupon.isExpired ? 'expired' :
                    coupon.isTargetReached ? 'target_reached' : 'invalid';

            throw ApiError.badRequest(`Coupon is ${reason}`);
        }

        return {
            code: coupon.code,
            name: coupon.name,
            currentSales: coupon.currentSales,
            targetSales: coupon.targetSales,
            remainingSales: coupon.targetSales - coupon.currentSales,
            progressPercentage: coupon.progressPercentage,
            expiryDate: coupon.expiryDate
        };
    }

    // Create new coupon
    async create(data) {
        // Auto-generate code if not provided
        if (!data.code) {
            data.code = this.generateCode();
        } else {
            data.code = data.code.toUpperCase();
        }

        // Check if code already exists
        const existing = await Coupon.findOne({ code: data.code });
        if (existing) {
            throw ApiError.badRequest('Coupon code already exists');
        }

        // Set default expiry if not provided (30 days from now)
        if (!data.expiryDate) {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            data.expiryDate = expiry;
        }

        const coupon = await Coupon.create(data);
        return coupon;
    }

    // Update coupon
    async update(id, data) {
        if (data.code) {
            data.code = data.code.toUpperCase();

            // Check if new code already exists
            const existing = await Coupon.findOne({
                code: data.code,
                _id: { $ne: id }
            });
            if (existing) {
                throw ApiError.badRequest('Coupon code already exists');
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!coupon) {
            throw ApiError.notFound('Coupon not found');
        }

        return coupon;
    }

    // Delete coupon
    async delete(id) {
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            throw ApiError.notFound('Coupon not found');
        }

        // Check if there are confirmed sales
        const confirmedSales = await CouponSale.countDocuments({
            couponCode: coupon.code,
            status: 'Confirmed'
        });

        if (confirmedSales > 0) {
            throw ApiError.badRequest('Cannot delete coupon with confirmed sales. Set to inactive instead.');
        }

        await Coupon.findByIdAndDelete(id);

        // Delete associated pending/rejected sales
        await CouponSale.deleteMany({
            couponCode: coupon.code,
            status: { $in: ['Pending', 'Rejected'] }
        });

        return coupon;
    }

    // Generate random coupon code
    generateCode() {
        const prefix = 'REF';
        const random = Math.random().toString(36).substr(2, 6).toUpperCase();
        return `${prefix}-${random}`;
    }

    // Get coupon stats
    async getStats() {
        const total = await Coupon.countDocuments();
        const active = await Coupon.countDocuments({ isActive: true });
        const expired = await Coupon.countDocuments({
            expiryDate: { $lt: new Date() }
        });
        const targetReached = await Coupon.countDocuments({
            $expr: { $gte: ['$currentSales', '$targetSales'] }
        });

        return {
            total,
            active,
            expired,
            targetReached
        };
    }
}

export default new CouponService();
