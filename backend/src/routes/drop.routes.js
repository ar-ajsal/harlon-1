import { Router } from 'express';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// ── GET /api/drops/active — public: all active/upcoming drops ────────────────
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const drops = await Product.find({
            dropEnabled: true,
            isVisible: true,
            $or: [
                { dropStartTime: { $lte: now }, dropEndTime: { $gte: now } }, // live drop
                { dropStartTime: { $gt: now } }  // upcoming drop
            ]
        })
            .select('_id name price originalPrice images dropEnabled dropStartTime dropEndTime dropQuantity dropSold category')
            .sort({ dropStartTime: 1 })
            .limit(20);

        res.json({ success: true, data: drops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/drops/:productId — single drop info ─────────────────────────────
router.get('/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
            .select('_id name price images dropEnabled dropStartTime dropEndTime dropQuantity dropSold dropReminders');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        const data = product.toObject();
        data.reminderCount = product.dropReminders?.length || 0;
        delete data.dropReminders; // never expose emails/phones
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/drops/:productId/remind — subscribe for reminder ───────────────
router.post('/:productId/remind', async (req, res) => {
    try {
        const { email, phone } = req.body;
        if (!email && !phone) {
            return res.status(400).json({ success: false, message: 'Provide email or phone number' });
        }
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Prevent duplicates
        const exists = product.dropReminders.some(r =>
            (email && r.email === email) || (phone && r.phone === phone)
        );
        if (exists) {
            return res.json({ success: true, message: 'Already subscribed for this drop' });
        }

        product.dropReminders.push({ email, phone });
        await product.save();
        res.json({ success: true, message: 'Subscribed for drop reminder!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/drops/:productId — admin: configure drop ─────────────────────
router.patch('/:productId', authMiddleware, async (req, res) => {
    try {
        const { dropEnabled, dropStartTime, dropEndTime, dropQuantity } = req.body;
        const update = {};
        if (dropEnabled !== undefined) update.dropEnabled = dropEnabled;
        if (dropStartTime !== undefined) update.dropStartTime = dropStartTime;
        if (dropEndTime !== undefined) update.dropEndTime = dropEndTime;
        if (dropQuantity !== undefined) update.dropQuantity = dropQuantity;

        const product = await Product.findByIdAndUpdate(
            req.params.productId,
            { $set: update },
            { new: true, runValidators: true }
        ).select('_id name dropEnabled dropStartTime dropEndTime dropQuantity dropSold');

        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/drops/admin/list — admin: all products with drop config ──────────
router.get('/admin/list', authMiddleware, async (req, res) => {
    try {
        const products = await Product.find({ isVisible: true })
            .select('_id name price images dropEnabled dropStartTime dropEndTime dropQuantity dropSold dropReminders category')
            .sort({ dropEnabled: -1, dropStartTime: 1 });
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
