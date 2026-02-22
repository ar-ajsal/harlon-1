import api from './axios.js';

/** Create a guest order (Razorpay or WhatsApp). */
export const createOrder = (payload) =>
    api.post('/guest-orders/create', payload);

/** Track by email + orderId. */
export const trackOrder = (email, orderId) =>
    api.get('/guest-orders/track', { params: { email, orderId } });

/** Track by secure token (from email link or success page). */
export const trackByToken = (token) =>
    api.get(`/guest-orders/track/${token}`);
