const API_URL = import.meta.env.VITE_API_URL || '/api';
console.log('Using API URL:', API_URL);

// Helper to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('harlon_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Products API
export const productsApi = {
    getAll: async (options = {}) => {
        const { category, page = 1, limit = 12, search } = typeof options === 'string'
            ? { category: options }
            : options;

        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        if (search) params.append('search', search);

        const queryString = params.toString();
        const url = queryString ? `${API_URL}/products?${queryString}` : `${API_URL}/products`;
        const res = await fetch(url);
        return res.json();
    },

    getFeatured: async () => {
        const res = await fetch(`${API_URL}/products?featured=true`);
        return res.json();
    },

    getById: async (id) => {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    create: async (product) => {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(product)
        });
        return res.json();
    },

    update: async (id, product) => {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(product)
        });
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return res.json();
    },

    reorder: async (products) => {
        const res = await fetch(`${API_URL}/products/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ products })
        });
        return res.json();
    }
};

// Categories API
export const categoriesApi = {
    getAll: async () => {
        const res = await fetch(`${API_URL}/categories`);
        return res.json();
    },

    create: async (category) => {
        const res = await fetch(`${API_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(category)
        });
        return res.json();
    },

    update: async (id, category) => {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify(category)
        });
        return res.json();
    },

    delete: async (id) => {
        const res = await fetch(`${API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return res.json();
    }
};

// Upload API
export const uploadApi = {
    uploadSingle: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch(`${API_URL}/upload/single`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });
        return res.json();
    },

    uploadMultiple: async (files) => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        const res = await fetch(`${API_URL}/upload/multiple`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });
        return res.json();
    },

    delete: async (publicId) => {
        const res = await fetch(`${API_URL}/upload/${publicId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return res.json();
    }
};

// Auth API
export const authApi = {
    login: async (password) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        return res.json();
    },

    verify: async (token) => {
        const res = await fetch(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    }
};
