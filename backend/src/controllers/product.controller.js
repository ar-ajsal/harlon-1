import productService from '../services/product.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const products = await productService.getAll(req.query);
    res.json(ApiResponse.success(products));
});

export const getById = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id);
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
