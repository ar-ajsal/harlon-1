import Product from '../models/Product.js';
import Offer from '../models/Offer.js';
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
        sleeveLength: filters.sleeveLength || '',
        collarType: filters.collarType || '',
        zip: filters.zip || '',
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
            const searchTerms = filters.search.trim().split(/\s+/).filter(Boolean);
            
            if (searchTerms.length > 0) {
                // For each term, it must appear in at least one of the fields (name, desc, category)
                const andConditions = searchTerms.map(term => {
                    // Escape special regex characters
                    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const regex = new RegExp(safeTerm, 'i');
                    return {
                        $or: [
                            { name: regex },
                            { description: regex },
                            { category: regex }
                        ]
                    };
                });

                if (query.$and) {
                    query.$and.push(...andConditions);
                } else {
                    query.$and = andConditions;
                }
            }
        }
        if (filters.sleeveLength) {
            query.sleeveLength = filters.sleeveLength;
        }
        if (filters.collarType) {
            query.collarType = filters.collarType;
        }
        if (filters.zip !== undefined && filters.zip !== '') {
            query.zip = filters.zip === 'true';
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
            : 'name price originalPrice images category sizes sleeveLength collarType zip soldOut inStock featured bestSeller priority isVisible tryOnEnabled overlayImage';

        const dbQuery = Product
            .find(query)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();  // plain JS objects — ~30% faster than Mongoose docs

        if (projection) dbQuery.select(projection);

        const [products, total, activeOffers] = await Promise.all([
            dbQuery,
            Product.countDocuments(query),
            Offer.findActive()
        ]);

        // Evaluate and apply automatic discounts
        if (activeOffers && activeOffers.length > 0) {
            for (const product of products) {
                let bestDiscount = 0;
                let bestOffer = null;

                for (const offer of activeOffers) {
                    if (offer.isEligibleFor(product._id, product.category)) {
                        const discount = offer.calculateDiscount(product.price);
                        if (discount > bestDiscount) {
                            bestDiscount = discount;
                            bestOffer = offer;
                        }
                    }
                }

                if (bestDiscount > 0) {
                    // Set original price if it doesn't exist or is incorrectly lower
                    if (!product.originalPrice || product.originalPrice <= product.price) {
                        product.originalPrice = product.price;
                    }
                    product.price = product.price - bestDiscount;
                    product.activeOffer = {
                        description: bestOffer.description,
                        isAutomatic: true,
                        value: bestOffer.discountValue
                    };
                }
            }
        }

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

        const activeOffers = await Offer.findActive();
        if (activeOffers && activeOffers.length > 0) {
            let bestDiscount = 0;
            let bestOffer = null;

            for (const offer of activeOffers) {
                if (offer.isEligibleFor(product._id, product.category)) {
                    const discount = offer.calculateDiscount(product.price);
                    if (discount > bestDiscount) {
                        bestDiscount = discount;
                        bestOffer = offer;
                    }
                }
            }

            if (bestDiscount > 0) {
                if (!product.originalPrice || product.originalPrice <= product.price) {
                    product.originalPrice = product.price;
                }
                product.price = product.price - bestDiscount;
                product.activeOffer = {
                    description: bestOffer.description,
                    isAutomatic: true,
                    value: bestOffer.discountValue
                };
            }
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
