import productService from '../services/product.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Public cache TTL: 60s browser cache, 300s CDN/proxy stale-while-revalidate
const PUBLIC_CACHE = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

export const getAll = asyncHandler(async (req, res) => {
    const isAdmin = req.query._admin === 'true';
    const products = await productService.getAll(req.query);

    if (!isAdmin) {
        res.setHeader('Cache-Control', PUBLIC_CACHE);
        res.setHeader('Vary', 'Accept-Encoding');
    } else {
        res.setHeader('Cache-Control', 'no-store');
    }

    res.json(ApiResponse.success(products));
});

export const getById = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id);

    // Individual product pages cache for 60s
    res.setHeader('Cache-Control', PUBLIC_CACHE);
    res.setHeader('Vary', 'Accept-Encoding');

    res.json(ApiResponse.success(product));
});

export const create = asyncHandler(async (req, res) => {
    const product = await productService.create(req.body);
    res.status(201).json(ApiResponse.success(product, 'Product created successfully'));
});

export const update = asyncHandler(async (req, res) => {
    const product = await productService.update(req.params.id, req.body);
    res.json(ApiResponse.success(product, 'Product updated successfully'));
});

export const remove = asyncHandler(async (req, res) => {
    await productService.delete(req.params.id);
    res.json(ApiResponse.success(null, 'Product deleted successfully'));
});

export const reorder = asyncHandler(async (req, res) => {
    await productService.reorder(req.body.products);
    res.json(ApiResponse.success(null, 'Products reordered successfully'));
});

export const updateStock = asyncHandler(async (req, res) => {
    const { stock } = req.body;
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) {
        return res.status(400).json(ApiResponse.error('stock must be a non-negative number'));
    }
    const newStock = Math.floor(Number(stock));
    const product = await productService.update(req.params.id, {
        stock: newStock,
        inStock: newStock > 0
    });
    res.json(ApiResponse.success(product, `Stock updated to ${newStock}`));
});
