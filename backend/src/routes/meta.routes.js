import { Router } from 'express';
import { getCatalogFeed } from '../controllers/meta.controller.js';

const router = Router();

// GET /api/meta/catalog-feed.xml
router.get('/catalog-feed.xml', getCatalogFeed);

export default router;
