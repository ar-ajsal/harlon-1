import api from './axios';

export const uploadApi = {
    uploadImages: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteImage: (public_id) => api.delete('/upload', { data: { public_id } })
};
