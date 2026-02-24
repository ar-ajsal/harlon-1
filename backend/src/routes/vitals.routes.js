import { Router } from 'express';

const router = Router();

/**
 * POST /api/vitals
 * Receives Web Vitals RUM data from the frontend.
 * In production: log and flag slow routes/devices.
 */
router.post('/', (req, res) => {
    const { name, value, url, ua, navigationType } = req.body;
    if (!name || value === undefined) {
        return res.status(400).json({ ok: false, message: 'Missing name or value' });
    }

    // Log in production — replace with Logtail/BetterStack in future
    const isSlowLCP = name === 'LCP' && value > 2500;
    const isSlowINP = name === 'INP' && value > 250;
    const isBadCLS = name === 'CLS' && value > 0.1;

    if (isSlowLCP || isSlowINP || isBadCLS) {
        console.warn(`[RUM SLOW] ${name}=${value}${name === 'CLS' ? '' : 'ms'} route=${url} nav=${navigationType}`);
    } else {
        console.log(`[RUM] ${name}=${value}${name === 'CLS' ? '' : 'ms'} route=${url}`);
    }

    res.json({ ok: true });
});

export default router;
