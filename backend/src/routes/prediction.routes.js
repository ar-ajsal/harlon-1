import { Router } from 'express';
import PredictionMatch from '../models/Prediction.js';
import Coupon from '../models/Coupon.js';
import { authMiddleware } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// ── GET /api/predictions — list all matches (public) ─────────────────────────
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const matches = await PredictionMatch.find(filter)
            .select('-entries.email -entries.phone') // don't expose contacts in list
            .sort({ matchDate: -1 })
            .limit(50);
        res.json({ success: true, data: matches });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/predictions/leaderboard — all-time top scorers ──────────────────
router.get('/leaderboard', async (req, res) => {
    try {
        // Aggregate across all matches
        const results = await PredictionMatch.aggregate([
            { $unwind: '$entries' },
            {
                $group: {
                    _id: { name: '$entries.name', phone: '$entries.phone' },
                    totalPoints: { $sum: '$entries.points' },
                    predictions: { $sum: 1 }
                }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: 50 },
            {
                $project: {
                    _id: 0,
                    name: '$_id.name',
                    totalPoints: 1,
                    predictions: 1
                }
            }
        ]);
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /api/predictions/:matchId — single match details ─────────────────────
router.get('/:matchId', async (req, res) => {
    try {
        const match = await PredictionMatch.findById(req.params.matchId)
            .select('-entries.email -entries.phone');
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        res.json({ success: true, data: match });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/predictions/:matchId/submit — user submits prediction ──────────
router.post('/:matchId/submit', async (req, res) => {
    try {
        const { name, phone, email, predictedScoreA, predictedScoreB } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Name is required' });
        if (predictedScoreA === undefined || predictedScoreB === undefined) {
            return res.status(400).json({ success: false, message: 'Predicted scores are required' });
        }

        const match = await PredictionMatch.findById(req.params.matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        if (match.status === 'finished') {
            return res.status(400).json({ success: false, message: 'This match has already ended' });
        }
        if (new Date() > new Date(match.matchDate)) {
            return res.status(400).json({ success: false, message: 'Prediction window has closed' });
        }

        // Check if phone/email already submitted
        if (phone || email) {
            const duplicate = match.entries.find(e =>
                (phone && e.phone === phone) || (email && e.email === email)
            );
            if (duplicate) {
                return res.status(400).json({ success: false, message: 'You have already submitted a prediction for this match' });
            }
        }

        match.entries.push({ name, phone, email, predictedScoreA, predictedScoreB });
        await match.save();
        res.json({ success: true, message: 'Prediction submitted! Good luck ⚽' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /api/predictions — admin: create a match ────────────────────────────
router.post('/', authMiddleware, async (req, res) => {
    try {
        const match = new PredictionMatch(req.body);
        await match.save();
        res.status(201).json({ success: true, data: match });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── PATCH /api/predictions/:matchId — admin: update match info ────────────────
router.patch('/:matchId', authMiddleware, async (req, res) => {
    try {
        const match = await PredictionMatch.findByIdAndUpdate(
            req.params.matchId, req.body, { new: true, runValidators: true }
        );
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        res.json({ success: true, data: match });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── POST /api/predictions/:matchId/result — admin: enter result & award coupons
router.post('/:matchId/result', authMiddleware, async (req, res) => {
    try {
        const { resultScoreA, resultScoreB } = req.body;
        const match = await PredictionMatch.findById(req.params.matchId);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        if (match.winnersProcessed) {
            return res.status(400).json({ success: false, message: 'Winners already processed' });
        }

        match.resultScoreA = resultScoreA;
        match.resultScoreB = resultScoreB;
        match.status = 'finished';

        let winnersCount = 0;
        // Score entries and award coupons to exact-score winners
        for (const entry of match.entries) {
            let pts = 0;
            // Exact score = 10 pts
            if (entry.predictedScoreA === resultScoreA && entry.predictedScoreB === resultScoreB) {
                pts = 10;
                // Generate a coupon code for exact-score winners
                const code = `${match.couponPrefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
                entry.couponCode = code;
                entry.points = pts;
                winnersCount++;
                // Create the coupon in the DB
                try {
                    await Coupon.create({
                        code,
                        discountType: 'percentage',
                        discountValue: 10,
                        minOrderValue: 0,
                        maxUses: 1,
                        validFrom: new Date(),
                        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                        isActive: true,
                        description: `Prediction winner: ${match.title}`
                    });
                } catch (couponErr) {
                    console.error('Failed to create coupon for winner:', couponErr.message);
                }
            } else {
                // Result type = 3 pts (correct winner or draw prediction)
                const actualOutcome = Math.sign(resultScoreA - resultScoreB);
                const predictedOutcome = Math.sign(entry.predictedScoreA - entry.predictedScoreB);
                if (actualOutcome === predictedOutcome) pts = 3;
                entry.points = pts;
            }
        }

        match.winnersProcessed = true;
        await match.save();
        res.json({ success: true, message: `Result saved. ${winnersCount} winner(s) awarded coupons.`, data: match });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── DELETE /api/predictions/:matchId — admin: delete a match ──────────────────
router.delete('/:matchId', authMiddleware, async (req, res) => {
    try {
        await PredictionMatch.findByIdAndDelete(req.params.matchId);
        res.json({ success: true, message: 'Match deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
