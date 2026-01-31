import Investment from '../models/Investment.js';
import ApiError from '../utils/ApiError.js';

class InvestmentService {
    async getAll(filters = {}) {
        const query = {};

        if (filters.category) {
            query.category = filters.category;
        }

        // Date range filter
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) {
                query.date.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.date.$lte = new Date(filters.endDate);
            }
        }

        const investments = await Investment.find(query).sort({ date: -1 });
        return investments;
    }

    async getById(id) {
        const investment = await Investment.findById(id);
        if (!investment) {
            throw ApiError.notFound('Investment not found');
        }
        return investment;
    }

    async create(data) {
        return Investment.create(data);
    }

    async update(id, data) {
        const investment = await Investment.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!investment) {
            throw ApiError.notFound('Investment not found');
        }
        return investment;
    }

    async delete(id) {
        const investment = await Investment.findByIdAndDelete(id);
        if (!investment) {
            throw ApiError.notFound('Investment not found');
        }
        return investment;
    }

    async getTotalInvestment() {
        const result = await Investment.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        return result[0]?.total || 0;
    }

    async getInvestmentByCategory() {
        const result = await Investment.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);
        return result;
    }

    async getMonthlyInvestment(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        const result = await Investment.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        return result[0]?.total || 0;
    }
}

export default new InvestmentService();
