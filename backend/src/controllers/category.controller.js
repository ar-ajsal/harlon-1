import categoryService from '../services/category.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAll(req.query);
    res.json(ApiResponse.success(categories));
});

export const getById = asyncHandler(async (req, res) => {
    const category = await categoryService.getById(req.params.id);
    res.json(ApiResponse.success(category));
});

export const create = asyncHandler(async (req, res) => {
    const category = await categoryService.create(req.body);
    res.status(201).json(ApiResponse.success(category, 'Category created successfully'));
});

export const update = asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.params.id, req.body);
    res.json(ApiResponse.success(category, 'Category updated successfully'));
});

export const remove = asyncHandler(async (req, res) => {
    await categoryService.delete(req.params.id);
    res.json(ApiResponse.success(null, 'Category deleted successfully'));
});
