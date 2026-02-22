import api from './axios.js';

/**
 * Submit a product inquiry.
 * @param {{ productId, productName, customer, message }} payload
 */
export const createInquiry = (payload) => api.post('/inquiries', payload);
