import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 10000,  // 10s default — Razorpay calls should pass { timeout: 25000 } override
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('harlon_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor — error handling + auto-retry for network failures
api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const config = error.config

        // Auto-retry on network errors only (not 4xx/5xx server errors)
        if (!error.response && config && !config._retry) {
            config._retry = true
            config._retryCount = (config._retryCount || 0) + 1
            if (config._retryCount <= 2) {
                await new Promise(r => setTimeout(r, 800 * config._retryCount))
                return api(config)
            }
        }

        // No response = backend unreachable after retries
        if (!error.response) {
            return Promise.reject(new Error('Could not connect to server. Check your connection.'))
        }
        const message = error.response?.data?.message || error.message || 'Something went wrong'
        return Promise.reject(new Error(message))
    }
)

export default api;
