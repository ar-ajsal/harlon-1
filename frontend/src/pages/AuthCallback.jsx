/**
 * Google OAuth callback page — /auth/callback
 * Backend redirects here after Google login with token in URL params.
 * We store the token and redirect to the intended destination.
 */
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import HarlonLoader from '../components/HarlonLoader'

export default function AuthCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { handleGoogleCallback } = useAuth()
    const { onUserLogin } = useCart()

    useEffect(() => {
        const token = searchParams.get('token')
        const name = searchParams.get('name')
        const email = searchParams.get('email')
        const avatar = searchParams.get('avatar')
        const error = searchParams.get('error')

        if (error || !token) {
            toast.error('Google sign-in failed. Please try again.')
            navigate('/login', { replace: true })
            return
        }

        const userData = { name, email, avatar, id: null }
        handleGoogleCallback(token, userData)
        onUserLogin(token)

        toast.success(`Welcome, ${name?.split(' ')[0]}! 🎉`)

        // Redirect to checkout if that was the intent, else home
        const postGoogle = sessionStorage.getItem('harlon_post_google')
        sessionStorage.removeItem('harlon_post_google')
        navigate(postGoogle === 'checkout' ? '/checkout?cart=true' : '/', { replace: true })
    }, [])

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
            <div style={{ textAlign: 'center', color: '#f5f0e8' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#888' }}>Signing you in…</p>
            </div>
        </div>
    )
}
