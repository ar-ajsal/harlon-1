import { Router } from 'express';
import FanCollection from '../models/FanCollection.js';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// ── GET /api/fan/leaderboard — top collectors (public) ───────────────────────
router.get('/leaderboard', async (req, res) => {
    try {
        const collections = await FanCollection.find({ isPublic: true })
            .select('username displayName avatarUrl jerseys')
            .sort({ updatedAt: -1 });

        const leaderboard = collections
            .map(c => ({
                username: c.username,
                displayName: c.displayName || c.username,
                avatarUrl: c.avatarUrl,
                jerseyCount: c.jerseys.length
            }))
            .sort((a, b) => b.jerseyCount - a.jerseyCount)
            .slice(0, 50);

        res.json({ success: true, data: leaderboard });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/fan/profile — create or get a fan profile ─────────────────────
router.post('/profile', async (req, res) => {
    try {
        const { username, displayName, bio, email, phone } = req.body;
        if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

        let profile = await FanCollection.findOne({ username: username.toLowerCase() });
        if (!profile) {
            const shareToken = crypto.randomBytes(6).toString('hex');
            profile = await FanCollection.create({
                username: username.toLowerCase(),
                displayName: displayName || username,
                bio: bio || '',
                email: email || '',
                phone: phone || '',
                shareToken
            });
        }
        res.json({ success: true, data: profile });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/fan/:username — public profile page ─────────────────────────────
router.get('/:username', async (req, res) => {
    try {
        const profile = await FanCollection.findOne({
            username: req.params.username.toLowerCase(),
            isPublic: true
        }).populate('jerseys.productId', 'name price images category');

        if (!profile) return res.status(404).json({ success: false, message: 'Fan profile not found' });
        res.json({ success: true, data: profile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/fan/token/:shareToken — profile by share token ──────────────────
router.get('/token/:shareToken', async (req, res) => {
    try {
        const profile = await FanCollection.findOne({ shareToken: req.params.shareToken })
            .populate('jerseys.productId', 'name price images category');
        if (!profile) return res.status(404).json({ success: false, message: 'Collection not found' });
        res.json({ success: true, data: profile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/fan/:username/add — add jersey to collection ───────────────────
router.post('/:username/add', async (req, res) => {
    try {
        const { productId, note } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: 'productId is required' });

        const profile = await FanCollection.findOne({ username: req.params.username.toLowerCase() });
        if (!profile) return res.status(404).json({ success: false, message: 'Fan profile not found' });

        // Check if already in collection
        const exists = profile.jerseys.some(j => j.productId.toString() === productId);
        if (exists) return res.json({ success: true, message: 'Already in your collection' });

        // Verify product exists
        const product = await Product.findById(productId).select('_id');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        profile.jerseys.push({ productId, note: note || '' });
        await profile.save();
        res.json({ success: true, message: 'Jersey added to collection!', data: { jerseyCount: profile.jerseys.length } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/fan/:username/remove/:productId — remove jersey ──────────────
router.delete('/:username/remove/:productId', async (req, res) => {
    try {
        const profile = await FanCollection.findOne({ username: req.params.username.toLowerCase() });
        if (!profile) return res.status(404).json({ success: false, message: 'Fan profile not found' });

        profile.jerseys = profile.jerseys.filter(j => j.productId.toString() !== req.params.productId);
        await profile.save();
        res.json({ success: true, message: 'Removed from collection', data: { jerseyCount: profile.jerseys.length } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/fan/:username — update profile info ───────────────────────────
router.patch('/:username', async (req, res) => {
    try {
        const { displayName, bio, avatarUrl, isPublic } = req.body;
        const update = {};
        if (displayName !== undefined) update.displayName = displayName;
        if (bio !== undefined) update.bio = bio;
        if (avatarUrl !== undefined) update.avatarUrl = avatarUrl;
        if (isPublic !== undefined) update.isPublic = isPublic;

        const profile = await FanCollection.findOneAndUpdate(
            { username: req.params.username.toLowerCase() },
            { $set: update },
            { new: true }
        );
        if (!profile) return res.status(404).json({ success: false, message: 'Fan profile not found' });
        res.json({ success: true, data: profile });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
