import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// ── Auth ──────────────────────────────────────────────────────────────────────
export const userApi = {
    signup: (data) =>
        axios.post(`${API}/user/signup`, data).then(r => r.data),

    login: (email, password) =>
        axios.post(`${API}/user/login`, { email, password }).then(r => r.data),

    me: (token) =>
        axios.get(`${API}/user/me`, { headers: authHeader(token) }).then(r => r.data),

    // ── Cart ──────────────────────────────────────────────────────────────────
    getCart: (token) =>
        axios.get(`${API}/user/cart`, { headers: authHeader(token) }).then(r => r.data),

    syncCart: (token, cart) =>
        axios.put(`${API}/user/cart`, { cart }, { headers: authHeader(token) }).then(r => r.data),

    addToCart: (token, item) =>
        axios.post(`${API}/user/cart/add`, item, { headers: authHeader(token) }).then(r => r.data),

    removeFromCart: (token, key) =>
        axios.delete(`${API}/user/cart/${encodeURIComponent(key)}`, { headers: authHeader(token) }).then(r => r.data),

    // ── Orders ────────────────────────────────────────────────────────────────
    getOrders: (token) =>
        axios.get(`${API}/user/orders`, { headers: authHeader(token) }).then(r => r.data),

    // ── Profile ───────────────────────────────────────────────────────────────
    updateProfile: (token, data) =>
        axios.put(`${API}/user/profile`, data, { headers: authHeader(token) }).then(r => r.data),

    saveAddress: (token, address) =>
        axios.put(`${API}/user/address`, address, { headers: authHeader(token) }).then(r => r.data),

    // ── Google OAuth URL ──────────────────────────────────────────────────────
    googleAuthUrl: () => `${API}/user/auth/google`,
};
