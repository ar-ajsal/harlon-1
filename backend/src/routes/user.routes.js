import { Router } from 'express';
import {
    signup, login, getMe,
    getCart, syncCart, addToCart, removeFromCart,
    googleAuth, googleCallback,
    getOrders, updateProfile, saveAddress,
} from '../controllers/user.controller.js';
import { userAuthMiddleware } from '../middleware/userAuth.js';

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', userAuthMiddleware, getMe);
router.put('/profile', userAuthMiddleware, updateProfile);
router.put('/address', userAuthMiddleware, saveAddress);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get('/orders', userAuthMiddleware, getOrders);

// ── Cart (protected) ──────────────────────────────────────────────────────────
router.get('/cart', userAuthMiddleware, getCart);
router.put('/cart', userAuthMiddleware, syncCart);
router.post('/cart/add', userAuthMiddleware, addToCart);
router.delete('/cart/:key', userAuthMiddleware, removeFromCart);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback);

export default router;
