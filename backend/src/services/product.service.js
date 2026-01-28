import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

class ProductService {
    async getAll(filters = {}) {
        const query = {};

        if (filters.category && filters.category !== 'all') {
            query.category = new RegExp(filters.category, 'i');
        }
        if (filters.featured === 'true') {
            query.featured = true;
        }
        if (filters.bestSeller === 'true') {
            query.bestSeller = true;
        }
        if (filters.search) {
            query.$text = { $search: filters.search };
        }

        return Product.find(query).sort({ priority: -1, createdAt: -1 });
    }

    async getById(id) {
        const product = await Product.findById(id);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }
        return product;
    }

    async create(data) {
        return Product.create(data);
    }

    async update(id, data) {
        const product = await Product.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!product) {
            throw ApiError.notFound('Product not found');
        }
        return product;
    }

    async delete(id) {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }
        return product;
    }

    async reorder(updates) {
        const operations = updates.map(({ _id, priority }) => ({
            updateOne: {
                filter: { _id },
                update: { $set: { priority } }
            }
        }));

        if (operations.length > 0) {
            await Product.bulkWrite(operations);
        }

        return true;
    }

    async getCount() {
        return Product.countDocuments();
    }
}

export default new ProductService();
