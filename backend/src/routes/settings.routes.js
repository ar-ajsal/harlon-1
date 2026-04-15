import { Router } from 'express';
import Settings from '../models/Settings.js';
import { authMiddleware } from '../middleware/auth.js';


const router = Router();

// GET /api/settings — public (checkout reads this to know which methods to show)
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.getSettings();
        res.json({
            success: true,
            data: {
                whatsappOrderEnabled: settings.whatsappOrderEnabled,
                onlinePaymentEnabled: settings.onlinePaymentEnabled,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT /api/settings — admin only
router.put('/', authMiddleware, async (req, res) => {
    try {
        const { whatsappOrderEnabled, onlinePaymentEnabled } = req.body;
        const updates = {};
        if (typeof whatsappOrderEnabled === 'boolean') updates.whatsappOrderEnabled = whatsappOrderEnabled;
        if (typeof onlinePaymentEnabled === 'boolean') updates.onlinePaymentEnabled = onlinePaymentEnabled;

        const settings = await Settings.updateSettings(updates);
        res.json({ success: true, data: settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
