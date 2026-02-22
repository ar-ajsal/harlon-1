import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    timeout: 30000,   // 30 s — needed for Razorpay API + cold Render starts
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor (add auth token)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('harlon_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // No response = backend unreachable (CORS, server down, wrong URL, etc.)
        if (!error.response) {
            return Promise.reject(new Error('Could not connect to server. Please try again.'));
        }
        const message = error.response?.data?.message || error.message || 'Something went wrong';
        return Promise.reject(new Error(message));
    }
);

export default api;
