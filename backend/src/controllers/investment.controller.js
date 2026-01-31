import investmentService from '../services/investment.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAll = asyncHandler(async (req, res) => {
    const investments = await investmentService.getAll(req.query);
    res.json(ApiResponse.success(investments));
});

export const getById = asyncHandler(async (req, res) => {
    const investment = await investmentService.getById(req.params.id);
    res.json(ApiResponse.success(investment));
});

export const create = asyncHandler(async (req, res) => {
    const investment = await investmentService.create(req.body);
    res.status(201).json(ApiResponse.success(investment, 'Investment added successfully'));
});

export const update = asyncHandler(async (req, res) => {
    const investment = await investmentService.update(req.params.id, req.body);
    res.json(ApiResponse.success(investment, 'Investment updated successfully'));
});

export const remove = asyncHandler(async (req, res) => {
    await investmentService.delete(req.params.id);
    res.json(ApiResponse.success(null, 'Investment deleted successfully'));
});

export const getTotal = asyncHandler(async (req, res) => {
    const total = await investmentService.getTotalInvestment();
    res.json(ApiResponse.success({ total }));
});

export const getByCategory = asyncHandler(async (req, res) => {
    const breakdown = await investmentService.getInvestmentByCategory();
    res.json(ApiResponse.success(breakdown));
});

export const getMonthly = asyncHandler(async (req, res) => {
    const { year, month } = req.params;
    const total = await investmentService.getMonthlyInvestment(parseInt(year), parseInt(month));
    res.json(ApiResponse.success({ total }));
});
