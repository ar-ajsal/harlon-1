import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';

class CategoryService {
    async getAll(filters = {}) {
        const query = {};

        // Pagination
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 20;
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            Category.find(query).sort({ name: 1 }).skip(skip).limit(limit),
            Category.countDocuments(query)
        ]);

        return {
            data: categories,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        };
    }

    async getById(id) {
        const category = await Category.findById(id);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }
        return category;
    }

    async create(data) {
        const slug = data.name.toLowerCase().replace(/\s+/g, '-');
        return Category.create({ ...data, slug });
    }

    async update(id, data) {
        const slug = data.name.toLowerCase().replace(/\s+/g, '-');
        const category = await Category.findByIdAndUpdate(
            id,
            { ...data, slug },
            { new: true, runValidators: true }
        );
        if (!category) {
            throw ApiError.notFound('Category not found');
        }
        return category;
    }

    async delete(id) {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            throw ApiError.notFound('Category not found');
        }
        return category;
    }

    async getCount() {
        return Category.countDocuments();
    }
}

export default new CategoryService();
