import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

// ─── In-Memory Cache ─────────────────────────────────────────────────────────
// Caches public product listing for 2 minutes — eliminates repeated DB hits on
// the busiest endpoint without needing Redis.
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const cache = new Map(); // key → { data, expiresAt }

function cacheKey(filters) {
    return JSON.stringify({
        category: filters.category || '',
        featured: filters.featured || '',
        bestSeller: filters.bestSeller || '',
        search: filters.search || '',
        page: filters.page || 1,
        limit: filters.limit || 20,
    });
}

function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function cacheSet(key, data) {
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    // Prevent unbounded growth
    if (cache.size > 200) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
}

export function invalidateProductCache() {
    cache.clear();
}
// ─────────────────────────────────────────────────────────────────────────────

class ProductService {
    async getAll(filters = {}) {
        const isAdminRequest = filters._admin === 'true';
        const key = cacheKey(filters);

        // Only cache public (non-admin) requests
        if (!isAdminRequest) {
            const cached = cacheGet(key);
            if (cached) return cached;
        }

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

        // Always show visible products for public; admin sees all
        if (!isAdminRequest) {
            query.isVisible = true;
        }

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const skip = (page - 1) * limit;

        // Field projection — public gets card-only fields (~50% smaller payload)
        const projection = isAdminRequest
            ? null
            : 'name price originalPrice images category sizes soldOut inStock featured bestSeller priority isVisible tryOnEnabled overlayImage';

        const dbQuery = Product
            .find(query)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();  // plain JS objects — ~30% faster than Mongoose docs

        if (projection) dbQuery.select(projection);

        const [products, total] = await Promise.all([
            dbQuery,
            Product.countDocuments(query)
        ]);

        const result = {
            data: products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        };

        if (!isAdminRequest) cacheSet(key, result);

        return result;
    }

    async getById(id) {
        const product = await Product.findById(id).lean();
        if (!product) {
            throw ApiError.notFound('Product not found');
        }
        return product;
    }

    async create(data) {
        const product = await Product.create(data);
        invalidateProductCache();
        return product;
    }

    async update(id, data) {
        const product = await Product.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true
        });
        if (!product) {
            throw ApiError.notFound('Product not found');
        }
        invalidateProductCache();
        return product;
    }

    async delete(id) {
        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            throw ApiError.notFound('Product not found');
        }
        invalidateProductCache();
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
            invalidateProductCache();
        }

        return true;
    }

    async getCount() {
        return Product.countDocuments();
    }
}

export default new ProductService();
