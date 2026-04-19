import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { userApi } from '../api/user.api'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

// ── Admin auth (unchanged) ────────────────────────────────────────────────────
const ADMIN_TOKEN_KEY = 'harlon_token'
// ── User/customer auth ────────────────────────────────────────────────────────
const USER_TOKEN_KEY = 'harlon_user_token'
const USER_DATA_KEY = 'harlon_user_data'

export function AuthProvider({ children }) {
    // Admin state
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [adminLoading, setAdminLoading] = useState(true)

    // User state
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_DATA_KEY)) || null } catch { return null }
    })
    const [userLoading, setUserLoading] = useState(true)

    const loading = adminLoading || userLoading

    // ── Admin token verify ────────────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem(ADMIN_TOKEN_KEY)
        if (token && token === 'admin-authenticated') {
            setIsAuthenticated(true)
        }
        setAdminLoading(false)
    }, [])

    // ── User token verify on mount ────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem(USER_TOKEN_KEY)
        if (!token) { setUserLoading(false); return }
        userApi.me(token)
            .then(res => {
                if (res.success && res.data?.user) {
                    setUser(res.data.user)
                    localStorage.setItem(USER_DATA_KEY, JSON.stringify(res.data.user))
                } else {
                    localStorage.removeItem(USER_TOKEN_KEY)
                    localStorage.removeItem(USER_DATA_KEY)
                    setUser(null)
                }
            })
            .catch(() => {
                localStorage.removeItem(USER_TOKEN_KEY)
                localStorage.removeItem(USER_DATA_KEY)
                setUser(null)
            })
            .finally(() => setUserLoading(false))
    }, [])

    // ── Admin login ───────────────────────────────────────────────────────────
    const login = useCallback(async (password) => {
        try {
            const { authApi } = await import('../services/api')
            const result = await authApi.login(password)
            if (result.success && result.data?.token) {
                setIsAuthenticated(true)
                localStorage.setItem(ADMIN_TOKEN_KEY, result.data.token)
                return { success: true }
            }
            return { success: false, error: result.message || 'Invalid credentials' }
        } catch (err) {
            return { success: false, error: err.message || 'Network error' }
        }
    }, [])

    const logout = useCallback(() => {
        setIsAuthenticated(false)
        localStorage.removeItem(ADMIN_TOKEN_KEY)
    }, [])

    // ── User signup ───────────────────────────────────────────────────────────
    const userSignup = useCallback(async ({ name, email, phone, password }) => {
        try {
            const res = await userApi.signup({ name, email, phone, password })
            if (res.success && res.data?.token) {
                const userData = res.data.user
                localStorage.setItem(USER_TOKEN_KEY, res.data.token)
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
                setUser(userData)
                return { success: true, user: userData }
            }
            return { success: false, error: res.message || 'Signup failed' }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Signup failed'
            return { success: false, error: msg }
        }
    }, [])

    // ── User login ────────────────────────────────────────────────────────────
    const userLogin = useCallback(async (email, password) => {
        try {
            const res = await userApi.login(email, password)
            if (res.success && res.data?.token) {
                const userData = res.data.user
                localStorage.setItem(USER_TOKEN_KEY, res.data.token)
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
                setUser(userData)
                return { success: true, user: userData }
            }
            return { success: false, error: res.message || 'Login failed' }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Login failed'
            return { success: false, error: msg }
        }
    }, [])

    // ── Google OAuth callback handler ─────────────────────────────────────────
    const handleGoogleCallback = useCallback((token, userData) => {
        localStorage.setItem(USER_TOKEN_KEY, token)
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
        setUser(userData)
    }, [])

    // ── User logout ───────────────────────────────────────────────────────────
    const userLogout = useCallback(() => {
        setUser(null)
        localStorage.removeItem(USER_TOKEN_KEY)
        localStorage.removeItem(USER_DATA_KEY)
    }, [])

    // ── Helpers ───────────────────────────────────────────────────────────────
    const getUserToken = useCallback(() => localStorage.getItem(USER_TOKEN_KEY), [])
    const isLoggedIn = !!user

    return (
        <AuthContext.Provider value={{
            // Admin
            isAuthenticated, loading, login, logout,
            // User
            user, isLoggedIn, userLoading,
            userSignup, userLogin, userLogout,
            handleGoogleCallback, getUserToken,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
