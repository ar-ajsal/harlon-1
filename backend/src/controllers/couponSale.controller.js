import couponSaleService from '../services/couponSale.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// Get all sales
export const getAll = asyncHandler(async (req, res) => {
    const sales = await couponSaleService.getAll(req.query);
    res.json(ApiResponse.success(sales));
});

// Get sales by coupon code
export const getByCoupon = asyncHandler(async (req, res) => {
    const sales = await couponSaleService.getByCouponCode(req.params.code);
    res.json(ApiResponse.success(sales));
});

// Create new pending sale
export const create = asyncHandler(async (req, res) => {
    const sale = await couponSaleService.create(req.body);
    res.status(201).json(ApiResponse.success(sale, 'Sale recorded successfully'));
});

// Confirm sale (admin)
export const confirmSale = asyncHandler(async (req, res) => {
    const result = await couponSaleService.confirmSale(req.params.id, req.user?.id);
    res.json(ApiResponse.success(result, 'Sale confirmed successfully'));
});

// Reject sale (admin)
export const rejectSale = asyncHandler(async (req, res) => {
    const sale = await couponSaleService.rejectSale(
        req.params.id,
        req.user?.id,
        req.body.notes
    );
    res.json(ApiResponse.success(sale, 'Sale rejected'));
});

// Delete sale
export const remove = asyncHandler(async (req, res) => {
    await couponSaleService.delete(req.params.id);
    res.json(ApiResponse.success(null, 'Sale deleted successfully'));
});

// Get pending sales count
export const getPendingCount = asyncHandler(async (req, res) => {
    const count = await couponSaleService.getPendingCount();
    res.json(ApiResponse.success({ count }));
});

// Get stats
export const getStats = asyncHandler(async (req, res) => {
    const stats = await couponSaleService.getStats();
    res.json(ApiResponse.success(stats));
});
