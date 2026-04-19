/**
 * AuthModal — slides up from bottom when a guest tries to checkout.
 * After login/signup, calls onSuccess() so the caller can proceed.
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { userApi } from '../api/user.api'

export default function AuthModal({ onClose, onSuccess }) {
    const [tab, setTab] = useState('login')
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

    const { userLogin, userSignup } = useAuth()
    const { onUserLogin } = useCart()

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
                toast.success(tab === 'login' ? `Welcome back, ${result.user.name.split(' ')[0]}! 👋` : `Welcome, ${result.user.name.split(' ')[0]}! 🎉`)
                onUserLogin(localStorage.getItem('harlon_user_token'))
                onSuccess?.(result.user)
            } else {
                toast.error(result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogle = () => {
        sessionStorage.setItem('harlon_post_google', 'checkout')
        window.location.href = userApi.googleAuthUrl()
    }

    return (
        <AnimatePresence>
            <motion.div
                key="auth-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={e => { if (e.target === e.currentTarget) onClose() }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    padding: '0 0 0 0',
                }}
            >
                <motion.div
                    key="auth-modal-panel"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    style={{
                        width: '100%', maxWidth: 500,
                        background: 'rgba(14,11,4,0.98)',
                        border: '1px solid rgba(200,150,43,0.2)',
                        borderRadius: '24px 24px 0 0',
                        padding: '32px 28px 40px',
                        boxShadow: '0 -24px 60px rgba(0,0,0,0.6)',
                    }}
                >
                    {/* Handle */}
                    <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 24px' }} />

                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#f5f0e8', margin: 0 }}>
                                {tab === 'login' ? 'Sign in to checkout' : 'Create an account'}
                            </h2>
                            <p style={{ color: '#666', fontSize: 13, margin: '4px 0 0', fontFamily: 'Inter, sans-serif' }}>
                                {tab === 'login' ? 'Access your cart & orders' : 'Join Harlon in seconds'}
                            </p>
                        </div>
                        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 10, padding: 10, cursor: 'pointer', color: '#aaa', display: 'flex' }}>
                            <FiX size={18} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 3, marginBottom: 20 }}>
                        {['login', 'signup'].map(t => (
                            <button key={t} onClick={() => setTab(t)} style={{
                                flex: 1, padding: '9px', border: 'none', cursor: 'pointer', borderRadius: 8,
                                fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
                                background: tab === t ? 'hsl(38,65%,55%)' : 'transparent',
                                color: tab === t ? '#0a0a0a' : '#888', transition: 'all 0.2s',
                            }}>
                                {t === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>
                        ))}
                    </div>

                    {/* Google */}
                    <motion.button
                        whileTap={{ scale: 0.97 }} onClick={handleGoogle}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            padding: '12px', borderRadius: 10, background: 'rgba(255,255,255,0.07)',
                            border: '1px solid rgba(255,255,255,0.1)', color: '#f5f0e8', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 16,
                        }}
                    >
                        <FcGoogle size={18} /> Continue with Google
                    </motion.button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <span style={{ color: '#555', fontSize: 12, fontFamily: 'Inter, sans-serif' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    </div>

                    <form onSubmit={handleSubmit}>
                        {tab === 'signup' && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={inputWrap}><FiUser style={iconStyle} />
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Full name" required style={inputStyle} />
                                </div>
                            </div>
                        )}
                        <div style={{ marginBottom: 12 }}>
                            <div style={inputWrap}><FiMail style={iconStyle} />
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required style={inputStyle} />
                            </div>
                        </div>
                        {tab === 'signup' && (
                            <div style={{ marginBottom: 12 }}>
                                <div style={inputWrap}><FiPhone style={iconStyle} />
                                    <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" style={inputStyle} />
                                </div>
                            </div>
                        )}
                        <div style={{ marginBottom: 20, position: 'relative' }}>
                            <div style={inputWrap}><FiLock style={iconStyle} />
                                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Password" required style={{ ...inputStyle, paddingRight: 44 }} />
                                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex' }}>
                                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                                </button>
                            </div>
                        </div>

                        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }} style={{
                            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                            background: loading ? '#555' : 'hsl(38,65%,55%)',
                            color: '#0a0a0a', fontFamily: 'Syne, sans-serif', fontWeight: 800,
                            fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                        }}>
                            {loading ? '...' : tab === 'login' ? '🔒 Sign In & Checkout' : '✨ Create Account & Checkout'}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

const inputWrap = {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, position: 'relative',
}
const iconStyle = { marginLeft: 14, color: '#555', flexShrink: 0, fontSize: 15 }
const inputStyle = {
    flex: 1, padding: '12px 14px', background: 'transparent',
    border: 'none', outline: 'none', color: '#f5f0e8',
    fontFamily: 'Inter, sans-serif', fontSize: 14,
}
