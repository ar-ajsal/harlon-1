import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone, FiArrowLeft } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { userApi } from '../api/user.api'

export default function LoginPage() {
    const [tab, setTab] = useState('login') // 'login' | 'signup'
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    // Support both ?redirect= (from UserProtectedRoute) and ?next= (legacy)
    const redirectTo = searchParams.get('redirect') ? decodeURIComponent(searchParams.get('redirect')) : (searchParams.get('next') || '/')
    const fromCheckout = redirectTo.includes('/checkout')
    const { userLogin, userSignup, isLoggedIn } = useAuth()
    const { onUserLogin } = useCart()

    useEffect(() => {
        if (isLoggedIn) navigate(redirectTo, { replace: true })
    }, [isLoggedIn, navigate, redirectTo])

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            let result
            if (tab === 'login') {
                result = await userLogin(form.email, form.password)
            } else {
                if (!form.name.trim()) { toast.error('Name is required'); setLoading(false); return }
                if (form.password.length < 6) { toast.error('Password must be at least 6 chars'); setLoading(false); return }
                result = await userSignup(form)
            }
            if (result.success) {
                toast.success(tab === 'login' ? `Welcome back, ${result.user.name.split(' ')[0]}! 👋` : `Account created! Welcome, ${result.user.name.split(' ')[0]}! 🎉`)
                onUserLogin(localStorage.getItem('harlon_user_token'))
                navigate(redirectTo, { replace: true })
            } else {
                toast.error(result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = () => {
        window.location.href = userApi.googleAuthUrl()
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1006 50%, #0a0a0a 100%)',
            padding: '24px 16px',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Ambient glow */}
            <div style={{
                position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
                width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(38,65%,55%,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    width: '100%', maxWidth: 440,
                    background: 'rgba(18,14,5,0.92)',
                    border: '1px solid rgba(200,150,43,0.2)',
                    borderRadius: 24, padding: '40px 36px',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(200,150,43,0.1)',
                    position: 'relative',
                }}
            >
                {/* Back */}
                <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13, textDecoration: 'none', marginBottom: 28, fontFamily: 'Inter, sans-serif' }}>
                    <FiArrowLeft size={14} /> Back to shop
                </Link>

                {/* Checkout banner */}
                {fromCheckout && (
                    <div style={{
                        background: 'rgba(200,150,43,0.12)', border: '1px solid rgba(200,150,43,0.25)',
                        borderRadius: 12, padding: '12px 16px', marginBottom: 24,
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                        <span style={{ fontSize: 20 }}>🛒</span>
                        <div>
                            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'hsl(38,80%,65%)' }}>Sign in to complete your order</div>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888', marginTop: 2 }}>Your cart is saved — log in to checkout securely.</div>
                        </div>
                    </div>
                )}

                {/* Logo + title */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <img src="/images/logo.png" alt="Harlon" style={{ height: 36, width: 'auto', marginBottom: 16, filter: 'brightness(1.1)' }} />
                    <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#f5f0e8', margin: 0, letterSpacing: '-0.02em' }}>
                        {tab === 'login' ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p style={{ color: '#888', fontSize: 14, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
                        {tab === 'login' ? 'Sign in to your Harlon account' : 'Join the Harlon community'}
                    </p>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12,
                    padding: 4, marginBottom: 28, position: 'relative',
                }}>
                    {['login', 'signup'].map(t => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setForm({ name: '', email: '', phone: '', password: '' }) }}
                            style={{
                                flex: 1, padding: '10px', border: 'none', cursor: 'pointer', borderRadius: 9,
                                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                                background: tab === t ? 'hsl(38,65%,55%)' : 'transparent',
                                color: tab === t ? '#0a0a0a' : '#888',
                            }}
                        >
                            {t === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    ))}
                </div>

                {/* Google Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleGoogle}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)', color: '#f5f0e8', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 20,
                        transition: 'background 0.2s',
                    }}
                >
                    <FcGoogle size={20} />
                    Continue with Google
                </motion.button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                    <span style={{ color: '#555', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>or</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Form */}
                <AnimatePresence mode="wait">
                    <motion.form
                        key={tab}
                        initial={{ opacity: 0, x: tab === 'login' ? -10 : 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onSubmit={handleSubmit}
                    >
                        {tab === 'signup' && (
                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>Full Name *</label>
                                <div style={inputWrap}>
                                    <FiUser style={iconStyle} />
                                    <input
                                        name="name" value={form.name} onChange={handleChange}
                                        placeholder="Your full name" required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: 14 }}>
                            <label style={labelStyle}>Email *</label>
                            <div style={inputWrap}>
                                <FiMail style={iconStyle} />
                                <input
                                    name="email" type="email" value={form.email} onChange={handleChange}
                                    placeholder="you@example.com" required
                                    style={inputStyle}
                                />
                            </div>
                        </div>

                        {tab === 'signup' && (
                            <div style={{ marginBottom: 14 }}>
                                <label style={labelStyle}>Phone <span style={{ color: '#555', fontWeight: 400 }}>(optional)</span></label>
                                <div style={inputWrap}>
                                    <FiPhone style={iconStyle} />
                                    <input
                                        name="phone" type="tel" value={form.phone} onChange={handleChange}
                                        placeholder="98765 43210"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: 24 }}>
                            <label style={labelStyle}>Password *</label>
                            <div style={{ ...inputWrap, position: 'relative' }}>
                                <FiLock style={iconStyle} />
                                <input
                                    name="password" type={showPass ? 'text' : 'password'}
                                    value={form.password} onChange={handleChange}
                                    placeholder={tab === 'signup' ? 'Min 6 characters' : 'Your password'}
                                    required style={{ ...inputStyle, paddingRight: 44 }}
                                />
                                <button
                                    type="button" onClick={() => setShowPass(s => !s)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex' }}
                                >
                                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            type="submit" disabled={loading}
                            whileHover={loading ? {} : { scale: 1.02 }}
                            whileTap={loading ? {} : { scale: 0.97 }}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                                background: loading ? '#555' : 'hsl(38,65%,55%)',
                                color: '#0a0a0a', fontFamily: 'Syne, sans-serif', fontWeight: 800,
                                fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                                letterSpacing: '0.02em', transition: 'background 0.2s',
                            }}
                        >
                            {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                        </motion.button>
                    </motion.form>
                </AnimatePresence>

                <p style={{ textAlign: 'center', marginTop: 20, color: '#555', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>
                    By continuing, you agree to Harlon's Terms & Privacy Policy.
                </p>
            </motion.div>
        </div>
    )
}

const labelStyle = {
    display: 'block', marginBottom: 6,
    fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600,
    color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em',
}

const inputWrap = {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, overflow: 'hidden',
}

const iconStyle = {
    marginLeft: 14, color: '#666', flexShrink: 0, fontSize: 16,
}

const inputStyle = {
    flex: 1, padding: '12px 14px', background: 'transparent',
    border: 'none', outline: 'none', color: '#f5f0e8',
    fontFamily: 'Inter, sans-serif', fontSize: 14,
}
