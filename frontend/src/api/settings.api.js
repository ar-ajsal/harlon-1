import api from './axios'

export const settingsApi = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.put('/settings', data)
}
