import api from './axios.js';

export const offersApi = {
    // ── Public (no auth) ─────────────────────────────────────────────
    // Validate a promo code at checkout. Pass amount, productId, category for full eligibility check.
    validate: (code, amount = 0, productId = null, category = null) =>
        api.get(`/offers/validate/${encodeURIComponent(code)}`, {
            params: { amount, ...(productId && { productId }), ...(category && { category }) }
        }),

    // ── Admin ────────────────────────────────────────────────────────
    getAll: (params) => api.get('/offers', { params }),
    getById: (id) => api.get(`/offers/${id}`),
    getStats: () => api.get('/offers/stats'),
    create: (data) => api.post('/offers', data),
    update: (id, data) => api.put(`/offers/${id}`, data),
    delete: (id) => api.delete(`/offers/${id}`),
    // Manually record a usage (e.g., after COD order placed)
    markUsed: (code) => api.post(`/offers/${code}/use`),
};
