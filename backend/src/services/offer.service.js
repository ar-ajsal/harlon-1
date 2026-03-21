import Offer from '../models/Offer.js';
import ApiError from '../utils/ApiError.js';

const offerService = {
    // Get all offers (admin)
    async getAll(query = {}) {
        const { page = 1, limit = 50, active, search } = query;
        const filter = {};

        if (active !== undefined) filter.isActive = active === 'true';
        if (search) filter.code = { $regex: search, $options: 'i' };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [data, total] = await Promise.all([
            Offer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Offer.countDocuments(filter),
        ]);

        return {
            data,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
        };
    },

    // Get by ID
    async getById(id) {
        const offer = await Offer.findById(id);
        if (!offer) throw new ApiError(404, 'Offer not found');
        return offer;
    },

    // Validate offer code (public — called from checkout)
    // Pass orderAmount, productId, and productCategory for full validation
    async validateCode(code, orderAmount = 0, productId = null, productCategory = null) {
        const offer = await Offer.findOne({ code: code.toUpperCase().trim() });

        if (!offer) throw new ApiError(404, 'Invalid offer code');
        if (!offer.isActive) throw new ApiError(400, 'This offer is no longer active');

        const now = new Date();
        if (now < offer.startDate) throw new ApiError(400, 'This offer has not started yet');
        if (now > offer.expiryDate) throw new ApiError(400, 'This offer has expired');
        if (offer.usageLimit !== null && offer.usedCount >= offer.usageLimit) {
            throw new ApiError(400, 'This offer has reached its usage limit');
        }
        if (orderAmount > 0 && orderAmount < offer.minOrderAmount) {
            throw new ApiError(400, `Minimum order amount of ₹${offer.minOrderAmount} required for this offer`);
        }

        // ── Product / Category eligibility check ───────────────────────────────
        if (productId || productCategory) {
            const eligible = offer.isEligibleFor(productId, productCategory);
            if (!eligible) {
                if (offer.applicableTo === 'categories') {
                    throw new ApiError(400, `This offer is only valid for: ${offer.categories.join(', ')}`);
                }
                if (offer.applicableTo === 'products') {
                    throw new ApiError(400, 'This offer is not valid for the selected product');
                }
            }
        }

        const discountAmount = offer.calculateDiscount(orderAmount);

        return {
            _id: offer._id,
            code: offer.code,
            description: offer.description,
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            maxDiscount: offer.maxDiscount,
            minOrderAmount: offer.minOrderAmount,
            applicableTo: offer.applicableTo,
            categories: offer.categories,
            products: offer.products,
            discountAmount,
            isValid: offer.isValid,
        };
    },

    // Create offer
    async create(data) {
        // Validate percentage value
        if (data.discountType === 'percentage' && (data.discountValue < 1 || data.discountValue > 100)) {
            throw new ApiError(400, 'Percentage discount must be between 1 and 100');
        }
        const offer = await Offer.create(data);
        return offer;
    },

    // Update offer
    async update(id, data) {
        const offer = await Offer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!offer) throw new ApiError(404, 'Offer not found');
        return offer;
    },

    // Delete offer
    async delete(id) {
        const offer = await Offer.findByIdAndDelete(id);
        if (!offer) throw new ApiError(404, 'Offer not found');
    },

    // Increment usage (called when order is placed successfully)
    async incrementUsage(code) {
        await Offer.findOneAndUpdate(
            { code: code.toUpperCase().trim() },
            { $inc: { usedCount: 1 } }
        );
    },

    // Stats for dashboard
    async getStats() {
        const now = new Date();
        const [total, active, expired, totalUsage] = await Promise.all([
            Offer.countDocuments(),
            Offer.countDocuments({ isActive: true, expiryDate: { $gte: now } }),
            Offer.countDocuments({ expiryDate: { $lt: now } }),
            Offer.aggregate([{ $group: { _id: null, total: { $sum: '$usedCount' } } }]),
        ]);

        return {
            total,
            active,
            expired,
            inactive: total - active - expired,
            totalUsage: totalUsage[0]?.total ?? 0,
        };
    },
};

export default offerService;
