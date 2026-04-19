import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiShoppingBag, FiMinus, FiPlus, FiTrash2, FiArrowRight, FiLock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function CartPage() {
    const { items, removeItem, updateQty, totalItems, totalPrice, clearCart } = useCart()
    const { isLoggedIn } = useAuth()
    const navigate = useNavigate()
    const [showAuth, setShowAuth] = useState(false)

    const handleCheckout = () => {
        if (items.length === 0) return
        if (!isLoggedIn) {
            setShowAuth(true)
            return
        }
        navigate('/checkout?cart=true')
    }

    const isEmpty = items.length === 0

    return (
        <div style={{ minHeight: '80vh', maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 8, color: 'var(--color-text, #0a0a0a)' }}>
                Your Cart
            </h1>
            <p style={{ color: 'var(--color-text-muted, #888)', fontFamily: 'Inter, sans-serif', marginBottom: 32, fontSize: 14 }}>
                {totalItems > 0 ? `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart` : 'Your cart is empty'}
            </p>

            {isEmpty ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '60px 20px' }}
                >
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Nothing here yet</h2>
                    <p style={{ color: '#999', fontFamily: 'Inter, sans-serif', marginBottom: 24 }}>Browse our drops and add jerseys to your cart</p>
                    <Link to="/shop" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'hsl(38,65%,55%)', color: '#0a0a0a', padding: '12px 28px',
                        borderRadius: 10, fontFamily: 'Inter, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: 14,
                    }}>
                        Shop the Drop <FiArrowRight />
                    </Link>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
                    {/* Items */}
                    <div>
                        <AnimatePresence>
                            {items.map(item => (
                                <motion.div
                                    key={item.key}
                                    layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                        display: 'flex', gap: 16, padding: '16px 0',
                                        borderBottom: '1px solid rgba(128,128,128,0.12)',
                                        alignItems: 'center',
                                    }}
                                >
                                    {/* Image */}
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} style={{
                                            width: 80, height: 80, objectFit: 'cover', borderRadius: 10, flexShrink: 0,
                                        }} />
                                    ) : (
                                        <div style={{ width: 80, height: 80, background: 'rgba(200,150,43,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👕</div>
                                    )}

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, margin: '0 0 4px', color: 'var(--color-text, #0a0a0a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.name}
                                        </p>
                                        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888', margin: '0 0 10px' }}>Size: {item.size}</p>

                                        {/* Qty controls */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <button onClick={() => updateQty(item.key, item.qty - 1)} style={qtyBtnStyle}>
                                                <FiMinus size={11} />
                                            </button>
                                            <span style={{ width: 28, textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                                            <button onClick={() => updateQty(item.key, item.qty + 1)} style={qtyBtnStyle}>
                                                <FiPlus size={11} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price + remove */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, margin: '0 0 8px', color: 'hsl(38,65%,55%)' }}>
                                            {fmt(item.price * item.qty)}
                                        </p>
                                        <button onClick={() => removeItem(item.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 4, display: 'flex' }}>
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button onClick={clearCart} style={{ marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontFamily: 'Inter, sans-serif', fontSize: 12, padding: 0 }}>
                            Clear cart
                        </button>
                    </div>

                    {/* Summary */}
                    <div style={{
                        background: 'rgba(200,150,43,0.06)', border: '1px solid rgba(200,150,43,0.15)',
                        borderRadius: 16, padding: '24px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#888' }}>
                            <span>Subtotal ({totalItems} items)</span>
                            <span>{fmt(totalPrice)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#4ade80' }}>
                            <span>Delivery</span>
                            <span>FREE 🎉</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(200,150,43,0.2)', paddingTop: 16, display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>Total</span>
                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'hsl(38,65%,55%)' }}>{fmt(totalPrice)}</span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={handleCheckout}
                            style={{
                                width: '100%', padding: '15px', borderRadius: 12, border: 'none',
                                background: 'hsl(38,65%,55%)', color: '#0a0a0a',
                                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            }}
                        >
                            <FiLock size={16} />
                            {isLoggedIn ? 'Proceed to Checkout' : 'Sign In & Checkout'}
                        </motion.button>

                        {!isLoggedIn && (
                            <p style={{ textAlign: 'center', marginTop: 10, color: '#888', fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                                You'll be asked to login before checkout
                            </p>
                        )}
                    </div>
                </div>
            )}

            {showAuth && (
                <AuthModal
                    onClose={() => setShowAuth(false)}
                    onSuccess={() => { setShowAuth(false); navigate('/checkout?cart=true') }}
                />
            )}
        </div>
    )
}

const qtyBtnStyle = {
    width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(128,128,128,0.2)',
    background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'inherit',
}
