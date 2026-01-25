import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller.js';
import upload from '../middleware/upload.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Protected routes
router.post('/single', authMiddleware, upload.single('image'), uploadController.uploadSingleImage);
router.post('/multiple', authMiddleware, upload.array('images', 5), uploadController.uploadMultipleImages);
router.delete('/', authMiddleware, uploadController.removeImage);

export default router;
