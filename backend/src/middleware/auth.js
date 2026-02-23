import ApiError from '../utils/ApiError.js';

export const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || token !== 'admin-authenticated') {
        throw ApiError.unauthorized('Please login to access this resource');
    }

    next();
};

export const loginAdmin = (password) => {
    // Read at call-time so dotenv has already populated process.env
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === adminPassword) {
        return { success: true, token: 'admin-authenticated' };
    }
    return { success: false };
};
