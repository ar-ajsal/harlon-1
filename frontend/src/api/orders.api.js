import api from './axios';

export const ordersAPI = {
    // Get all orders with optional filters: search, status, paymentMethod, dateFrom, dateTo, page, limit
    getAll: (params = {}) => api.get('/orders', { params }),

    // Get single order by ID
    getById: (id) => api.get(`/orders/${id}`),

    // Create new order
    create: (data) => api.post('/orders', data),

    // Update order status
    updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),

    // Update complete order (edit invoice)
    update: (id, data) => api.put(`/orders/${id}`, data),

    // Delete order
    delete: (id) => api.delete(`/orders/${id}`),

    // Get order statistics (legacy summary)
    getStats: () => api.get('/orders/stats/summary'),

    // Get Today's Stats for Dashboard
    getTodayStats: () => api.get('/orders/stats/today'),

    // Get aggregated stats for the currently active filters (for the calculation panel)
    getFilteredStats: (params = {}) => api.get('/orders/stats/filtered', { params }),

    // Get Monthly Report
    getMonthlyReport: (year, month) => api.get(`/orders/reports/${year}/${month}`),

    // Get PDF download URL
    getPdfUrl: (id) => `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders/${id}/pdf`
};

export default ordersAPI;
