import { Router } from 'express';
import { createInquiry } from '../controllers/inquiry.controller.js';

const router = Router();

router.post('/', createInquiry);

export default router;
