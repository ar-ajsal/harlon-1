import ApiError from '../utils/ApiError.js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || token !== 'admin-authenticated') {
        throw ApiError.unauthorized('Please login to access this resource');
    }

    next();
};

export const loginAdmin = (password) => {
    if (password === ADMIN_PASSWORD) {
        return { success: true, token: 'admin-authenticated' };
    }
    return { success: false };
};
