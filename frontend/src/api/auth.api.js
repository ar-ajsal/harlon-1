import api from './axios';

export const authApi = {
    login: (credentials) => api.post('/auth/login', credentials),
    verify: () => api.get('/auth/verify')
};
