import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'fallback_secret';

export const signUserToken = (userId) => {
    return jwt.sign({ userId, type: 'user' }, JWT_SECRET(), { expiresIn: '30d' });
};

export const userAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        if (!token) throw ApiError.unauthorized('Login required');

        const decoded = jwt.verify(token, JWT_SECRET());
        if (decoded.type !== 'user') throw ApiError.unauthorized('Invalid token type');

        req.userId = decoded.userId;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return next(ApiError.unauthorized('Session expired. Please login again.'));
        }
        next(err);
    }
};

// Optional auth — attaches userId if token present but doesn't block
export const optionalUserAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
            const decoded = jwt.verify(token, JWT_SECRET());
            if (decoded.type === 'user') req.userId = decoded.userId;
        }
    } catch (_) {}
    next();
};
