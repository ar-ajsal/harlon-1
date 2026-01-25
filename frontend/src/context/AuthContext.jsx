import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('harlon_token')
        if (token) {
            verifyToken(token)
        } else {
            setLoading(false)
        }
    }, [])

    const verifyToken = async (token) => {
        try {
            const result = await authApi.verify(token)
            // Backend returns: { success: true, data: { valid: true } }
            if (result.success && result.data?.valid) {
                setIsAuthenticated(true)
            } else {
                localStorage.removeItem('harlon_token')
                setIsAuthenticated(false)
            }
        } catch (err) {
            localStorage.removeItem('harlon_token')
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    const login = async (password) => {
        try {
            const result = await authApi.login(password)
            // Backend returns: { success: true, data: { token: '...' } }
            if (result.success && result.data?.token) {
                setIsAuthenticated(true)
                localStorage.setItem('harlon_token', result.data.token)
                return { success: true }
            }
            return { success: false, error: result.message || 'Invalid credentials' }
        } catch (err) {
            console.error('Login error:', err)
            return { success: false, error: err.message || 'Network error' }
        }
    }

    const logout = () => {
        setIsAuthenticated(false)
        localStorage.removeItem('harlon_token')
    }

    const value = {
        isAuthenticated,
        loading,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
