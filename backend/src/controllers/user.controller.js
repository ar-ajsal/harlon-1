import bcrypt from 'bcryptjs';
import passport from 'passport';
import User from '../models/User.js';
import GuestOrder from '../models/GuestOrder.js';
import { signUserToken } from '../middleware/userAuth.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

// ── POST /api/user/signup ─────────────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name?.trim()) return res.status(400).json(ApiResponse.error('Name is required'));
    if (!email?.trim()) return res.status(400).json(ApiResponse.error('Email is required'));
    if (!password || password.length < 6) return res.status(400).json(ApiResponse.error('Password must be at least 6 characters'));

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json(ApiResponse.error('An account with this email already exists'));

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || '',
        passwordHash,
    });

    const token = signUserToken(user._id.toString());
    res.status(201).json(ApiResponse.success({
        token,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
    }, 'Account created successfully'));
});

// ── POST /api/user/login ──────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json(ApiResponse.error('Email and password are required'));

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json(ApiResponse.error('Invalid email or password'));

    if (!user.passwordHash) {
        return res.status(401).json(ApiResponse.error('This account uses Google login. Please sign in with Google.'));
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json(ApiResponse.error('Invalid email or password'));

    const token = signUserToken(user._id.toString());
    res.json(ApiResponse.success({
        token,
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
    }, 'Login successful'));
});

// ── GET /api/user/me ──────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('-passwordHash -googleId');
    if (!user) return res.status(404).json(ApiResponse.error('User not found'));
    res.json(ApiResponse.success({
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
    }));
});

// ── GET /api/user/cart ────────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('cart');
    if (!user) return res.status(404).json(ApiResponse.error('User not found'));
    res.json(ApiResponse.success({ cart: user.cart }));
});

// ── PUT /api/user/cart — replace full cart ────────────────────────────────────
export const syncCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    if (!Array.isArray(cart)) return res.status(400).json(ApiResponse.error('cart must be an array'));

    const user = await User.findByIdAndUpdate(
        req.userId,
        { cart },
        { new: true, select: 'cart' }
    );
    res.json(ApiResponse.success({ cart: user.cart }));
});

// ── POST /api/user/cart/add ───────────────────────────────────────────────────
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, name, price, image, size, qty = 1 } = req.body;
    if (!productId || !size) return res.status(400).json(ApiResponse.error('productId and size are required'));

    const key = `${productId}-${size}`;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json(ApiResponse.error('User not found'));

    const idx = user.cart.findIndex(i => i.key === key);
    if (idx >= 0) {
        user.cart[idx].qty += qty;
    } else {
        user.cart.push({ productId, name, price, image: image || '', size, qty, key });
    }
    await user.save();
    res.json(ApiResponse.success({ cart: user.cart }));
});

// ── DELETE /api/user/cart/:key ────────────────────────────────────────────────
export const removeFromCart = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json(ApiResponse.error('User not found'));

    user.cart = user.cart.filter(i => i.key !== decodeURIComponent(key));
    await user.save();
    res.json(ApiResponse.success({ cart: user.cart }));
});

// ── GET /api/user/auth/google ─────────────────────────────────────────────────
export const googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// ── GET /api/user/auth/google/callback ───────────────────────────────────────
export const googleCallback = (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
        if (err || !user) {
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontendUrl}/login?error=google_failed`);
        }
        const token = signUserToken(user._id.toString());
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(user.avatar || '')}`);
    })(req, res, next);
};

// ── GET /api/user/orders — fetch orders by user email ────────────────────────
export const getOrders = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('email');
    if (!user) return res.status(404).json(ApiResponse.error('User not found'));

    const orders = await GuestOrder.find({
        'customer.email': user.email,
    }).sort({ createdAt: -1 }).limit(50);

    res.json(ApiResponse.success({ orders }));
});

// ── PUT /api/user/profile — update name / phone ───────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const update = {};
    if (name?.trim()) update.name = name.trim();
    if (phone !== undefined) update.phone = phone.trim();

    const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-passwordHash -googleId');
    if (!user) return res.status(404).json(ApiResponse.error('User not found'));

    res.json(ApiResponse.success({
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar },
    }, 'Profile updated'));
});

// ── PUT /api/user/address — save default delivery address ─────────────────────
export const saveAddress = asyncHandler(async (req, res) => {
    const { streetAddress, apartment, city, state, pinCode, country } = req.body;
    const address = { streetAddress, apartment, city, state, pinCode, country: country || 'India' };

    const user = await User.findByIdAndUpdate(
        req.userId,
        { address },
        { new: true }
    ).select('address');

    res.json(ApiResponse.success({ address: user.address }, 'Address saved'));
});
