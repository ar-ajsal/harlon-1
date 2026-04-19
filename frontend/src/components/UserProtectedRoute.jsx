import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * UserProtectedRoute
 * Wraps customer-facing routes that require login (e.g. Checkout, Profile).
 * - Shows a spinner while the JWT is being verified on mount
 * - Redirects to /login?redirect=<current_path> if the user is not logged in
 * - Renders children once authenticated
 */
export default function UserProtectedRoute({ children }) {
    const { user, userLoading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!userLoading && !user) {
            // Save current path so we can redirect back after login
            const redirect = encodeURIComponent(location.pathname + location.search)
            navigate(`/login?redirect=${redirect}`, { replace: true })
        }
    }, [user, userLoading, navigate, location])

    if (userLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '60vh', flexDirection: 'column', gap: 16,
            }}>
                <div className="spinner" />
                <p style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13,
                    color: '#999', margin: 0,
                }}>
                    Checking your account…
                </p>
            </div>
        )
    }

    if (!user) return null // will redirect via useEffect

    return children
}
