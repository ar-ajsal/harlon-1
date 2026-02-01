import api from './axios.js';

export const couponsApi = {
    // Public
    validate: (code) => api.get(`/coupons/validate/${code}`),

    // Admin
    getAll: (params) => api.get('/coupons', { params }),
    getById: (id) => api.get(`/coupons/${id}`),
    getStats: () => api.get('/coupons/stats'),
    create: (data) => api.post('/coupons', data),
    update: (id, data) => api.put(`/coupons/${id}`, data),
    delete: (id) => api.delete(`/coupons/${id}`)
};

export const couponSalesApi = {
    // Public - record sale when customer orders
    create: (data) => api.post('/coupon-sales', data),

    // Admin
    getAll: (params) => api.get('/coupon-sales', { params }),
    getByCoupon: (code) => api.get(`/coupon-sales/coupon/${code}`),
    getStats: () => api.get('/coupon-sales/stats'),
    getPendingCount: () => api.get('/coupon-sales/pending-count'),
    confirmSale: (id) => api.put(`/coupon-sales/${id}/confirm`),
    rejectSale: (id, notes) => api.put(`/coupon-sales/${id}/reject`, { notes }),
    delete: (id) => api.delete(`/coupon-sales/${id}`)
};
