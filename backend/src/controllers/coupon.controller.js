import couponService from '../services/coupon.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get all coupons
export const getAll = asyncHandler(async (req, res) => {
    const coupons = await couponService.getAll(req.query);
    res.json(ApiResponse.success(coupons));
});

// Get single coupon by ID
export const getById = asyncHandler(async (req, res) => {
    const coupon = await couponService.getById(req.params.id);
    res.json(ApiResponse.success(coupon));
});

// Validate coupon code (public)
export const validateCode = asyncHandler(async (req, res) => {
    const coupon = await couponService.validateCode(req.params.code);
    res.json(ApiResponse.success(coupon, 'Coupon is valid'));
});

// Create new coupon
export const create = asyncHandler(async (req, res) => {
    const coupon = await couponService.create(req.body);
    res.status(201).json(ApiResponse.success(coupon, 'Coupon created successfully'));
});

// Update coupon
export const update = asyncHandler(async (req, res) => {
    const coupon = await couponService.update(req.params.id, req.body);
    res.json(ApiResponse.success(coupon, 'Coupon updated successfully'));
});

// Delete coupon
export const remove = asyncHandler(async (req, res) => {
    await couponService.delete(req.params.id);
    res.json(ApiResponse.success(null, 'Coupon deleted successfully'));
});

// Get coupon stats
export const getStats = asyncHandler(async (req, res) => {
    const stats = await couponService.getStats();
    res.json(ApiResponse.success(stats));
});
