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

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const skip = (page - 1) * limit;

        // Determine if this is an admin request (admin routes send token)
        // Public shop/home listing: project only fields needed for cards (payload ~50% smaller)
        const isAdminRequest = filters._admin === 'true'
        const projection = isAdminRequest
            ? null  // admin gets full document
            : 'name price originalPrice images category sizes soldOut inStock featured bestSeller priority'

        const query_ = Product.find(query).sort({ priority: -1, createdAt: -1 }).skip(skip).limit(limit)
        if (projection) query_.select(projection)
        query_.lean()  // plain JS objects, ~30% faster than Mongoose documents

        const [products, total] = await Promise.all([
            query_,
            Product.countDocuments(query)
        ]);

        return {
            data: products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        };
    }

    async getById(id) {
        const product = await Product.findById(id).lean()  // lean() for speed
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
