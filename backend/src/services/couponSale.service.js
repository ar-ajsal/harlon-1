import CouponSale from '../models/CouponSale.js';
import Coupon from '../models/Coupon.js';
import ApiError from '../utils/ApiError.js';

class CouponSaleService {
    // Get all sales
    async getAll(filters = {}) {
        const query = {};

        if (filters.couponCode) {
            query.couponCode = filters.couponCode.toUpperCase();
        }

        if (filters.status) {
            query.status = filters.status;
        }

        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 50;
        const skip = (page - 1) * limit;

        const [sales, total] = await Promise.all([
            CouponSale.find(query)
                .populate('productId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CouponSale.countDocuments(query)
        ]);

        return {
            data: sales,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        };
    }

    // Get sales by coupon code
    async getByCouponCode(couponCode) {
        const sales = await CouponSale.find({
            couponCode: couponCode.toUpperCase()
        })
            .populate('productId')
            .sort({ createdAt: -1 });

        return sales;
    }

    // Create new pending sale (when customer orders with coupon)
    async create(data) {
        // Verify coupon exists and is valid
        const coupon = await Coupon.findOne({ code: data.couponCode.toUpperCase() });
        if (!coupon) {
            throw ApiError.notFound('Coupon code not found');
        }

        if (!coupon.isValid()) {
            throw ApiError.badRequest('Coupon is not valid');
        }

        data.couponCode = data.couponCode.toUpperCase();
        data.status = 'Pending';

        const sale = await CouponSale.create(data);
        return await sale.populate('productId');
    }

    // Confirm a sale (admin action)
    async confirmSale(id, adminId = 'admin') {
        const sale = await CouponSale.findById(id).populate('productId');
        if (!sale) {
            throw ApiError.notFound('Sale not found');
        }

        if (sale.status === 'Confirmed') {
            throw ApiError.badRequest('Sale is already confirmed');
        }

        if (sale.status === 'Rejected') {
            throw ApiError.badRequest('Cannot confirm a rejected sale');
        }

        // Update sale status
        sale.status = 'Confirmed';
        sale.confirmedBy = adminId;
        sale.confirmedAt = new Date();
        await sale.save();

        // Increment coupon counter
        await Coupon.findOneAndUpdate(
            { code: sale.couponCode },
            { $inc: { currentSales: 1 } }
        );

        // Get updated coupon to check if target reached
        const coupon = await Coupon.findOne({ code: sale.couponCode });

        return {
            sale,
            targetReached: coupon.isTargetReached,
            currentProgress: `${coupon.currentSales}/${coupon.targetSales}`
        };
    }

    // Reject a sale (admin action)
    async rejectSale(id, adminId = 'admin', notes = '') {
        const sale = await CouponSale.findById(id);
        if (!sale) {
            throw ApiError.notFound('Sale not found');
        }

        if (sale.status === 'Confirmed') {
            throw ApiError.badRequest('Cannot reject a confirmed sale');
        }

        sale.status = 'Rejected';
        sale.rejectedBy = adminId;
        sale.rejectedAt = new Date();
        if (notes) {
            sale.notes = notes;
        }
        await sale.save();

        return sale;
    }

    // Delete a sale (only for pending/rejected)
    async delete(id) {
        const sale = await CouponSale.findById(id);
        if (!sale) {
            throw ApiError.notFound('Sale not found');
        }

        if (sale.status === 'Confirmed') {
            throw ApiError.badRequest('Cannot delete confirmed sale');
        }

        await CouponSale.findByIdAndDelete(id);
        return sale;
    }

    // Get pending sales count
    async getPendingCount() {
        return await CouponSale.countDocuments({ status: 'Pending' });
    }

    // Get stats
    async getStats() {
        const total = await CouponSale.countDocuments();
        const pending = await CouponSale.countDocuments({ status: 'Pending' });
        const confirmed = await CouponSale.countDocuments({ status: 'Confirmed' });
        const rejected = await CouponSale.countDocuments({ status: 'Rejected' });

        const totalRevenue = await CouponSale.aggregate([
            { $match: { status: 'Confirmed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
            total,
            pending,
            confirmed,
            rejected,
            totalRevenue: totalRevenue[0]?.total || 0
        };
    }
}

export default new CouponSaleService();
