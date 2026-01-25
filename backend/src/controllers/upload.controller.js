import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinaryService from '../services/cloudinary.service.js';

export const uploadSingleImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json(ApiResponse.error('No file uploaded'));
    }
    // Matching frontend expectation: result.url
    res.json({ success: true, url: req.file.path });
});

export const uploadMultipleImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json(ApiResponse.error('No files uploaded'));
    }

    const urls = req.files.map(file => file.path);
    // Return explicit structure if needed, or standard ApiResponse
    // Frontend services/api.js uploadMultiple returns res.json()
    // But ImageUploader doesn't use uploadMultiple currently (it maps uploadSingle).
    // So this is for future use.
    res.json(ApiResponse.success(urls, 'Images uploaded successfully'));
});

export const removeImage = asyncHandler(async (req, res) => {
    const { public_id } = req.body;
    if (!public_id) {
        return res.status(400).json(ApiResponse.error('Public ID is required'));
    }

    await cloudinaryService.deleteImage(public_id);
    res.json(ApiResponse.success(null, 'Image deleted successfully'));
});
