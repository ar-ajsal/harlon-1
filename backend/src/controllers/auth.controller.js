import { loginAdmin } from '../middleware/auth.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
    const { password } = req.body;
    console.log('Login attempt:', {
        receivedPassword: password,
        body: req.body,
        contentType: req.headers['content-type']
    });

    // Check against both env and default for debugging
    const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
    console.log('Expected:', adminPass);
    console.log('Match?', password === adminPass);

    const result = loginAdmin(password);

    if (result.success) {
        res.json(ApiResponse.success({ token: result.token }, 'Login successful'));
    } else {
        res.status(401).json(ApiResponse.error('Invalid credentials'));
    }
});

export const verify = asyncHandler(async (req, res) => {
    // If request reaches here, auth middleware passed
    res.json(ApiResponse.success({ valid: true }, 'Token is valid'));
});
