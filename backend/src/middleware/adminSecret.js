/**
 * adminSecret middleware
 * Protects admin routes by requiring X-Admin-Secret header.
 */
const adminSecret = (req, res, next) => {
    const secret = process.env.ADMIN_SECRET;
    const provided = req.headers['x-admin-secret'];

    if (!secret) {
        console.error('[adminSecret] ADMIN_SECRET env var not set');
        return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    if (!provided || provided !== secret) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    next();
};

export default adminSecret;
