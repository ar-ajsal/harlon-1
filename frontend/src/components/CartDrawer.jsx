import { AnimatePresence, motion } from 'framer-motion'
import { FiX, FiShoppingBag, FiMinus, FiPlus, FiTrash2, FiArrowRight, FiLock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { WHATSAPP_NUMBER } from '../config/constants'
import '../styles/cart-drawer.css'

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

function buildWhatsAppMsg(items, total) {
    const lines = items.map(i => `• ${i.name} (${i.size}) x${i.qty} — ${fmt(i.price * i.qty)}`)
    return encodeURIComponent(
        `Hi HARLON! 🏆 I want to order:\n\n${lines.join('\n')}\n\nTotal: ${fmt(total)}\n\nPlease confirm availability.`
    )
}

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeItem, updateQty, totalItems, totalPrice } = useCart()
    const { isLoggedIn } = useAuth()
    const navigate = useNavigate()


    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="cart-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={e => { if (e.target === e.currentTarget) closeCart() }}
                >
                    <motion.div
                        className="cart-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    >
                        {/* Header */}
                        <div className="cart-header">
                            <h2 className="cart-header-title">
                                Your Drop
                                {totalItems > 0 && (
                                    <span className="cart-count-pill">{totalItems}</span>
                                )}
                            </h2>
                            <button className="cart-close-btn" onClick={closeCart} aria-label="Close cart">
                                <FiX />
                            </button>
                        </div>

                        {/* Items */}
                        {items.length === 0 ? (
                            <div className="cart-empty">
                                <div className="cart-empty-icon">👕</div>
                                <h3 className="cart-empty-title">Your drop is empty.</h3>
                                <p className="cart-empty-sub">The legends won't wait.</p>
                                <Link to="/shop" className="cart-empty-shop" onClick={closeCart}>
                                    Shop the Drop <FiArrowRight />
                                </Link>
                            </div>
                        ) : (
                            <div className="cart-items">
                                {items.map(item => (
                                    <div key={item.key} className="cart-item">
                                        {item.image && (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="cart-item-img"
                                            />
                                        )}
                                        <div className="cart-item-info">
                                            <p className="cart-item-name">{item.name}</p>
                                            <p className="cart-item-size">Size: {item.size}</p>
                                            <div className="cart-item-qty-row">
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateQty(item.key, item.qty - 1)}
                                                    aria-label="Decrease"
                                                >
                                                    <FiMinus size={12} />
                                                </button>
                                                <span className="cart-qty-val">{item.qty}</span>
                                                <button
                                                    className="cart-qty-btn"
                                                    onClick={() => updateQty(item.key, item.qty + 1)}
                                                    aria-label="Increase"
                                                >
                                                    <FiPlus size={12} />
                                                </button>
                                                <span className="cart-item-price">{fmt(item.price * item.qty)}</span>
                                                <button
                                                    className="cart-item-remove"
                                                    onClick={() => removeItem(item.key)}
                                                    aria-label="Remove"
                                                >
                                                    <FiTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="cart-footer">
                                <div className="cart-total-row">
                                    <span className="cart-total-label">Total</span>
                                    <span className="cart-total-price">{fmt(totalPrice)}</span>
                                </div>

                                {/* Primary: Checkout */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        closeCart()
                                        if (isLoggedIn) {
                                            navigate('/checkout?cart=true')
                                        } else {
                                            navigate('/login?redirect=' + encodeURIComponent('/checkout?cart=true'))
                                        }
                                    }}
                                    className="cart-checkout-btn"
                                    style={{ background: 'hsl(38,65%,55%)', color: '#0a0a0a', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '14px', borderRadius: 12, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, marginBottom: 8 }}
                                >
                                    <FiLock size={16} />
                                    {isLoggedIn ? 'Checkout Securely' : 'Sign In & Checkout'}
                                </motion.button>

                                {/* Secondary: WhatsApp */}
                                <a
                                    href={`https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppMsg(items, totalPrice)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 10, background: 'rgba(37,211,102,0.1)', color: '#25D366', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13 }}
                                >
                                    <FaWhatsapp size={16} /> Order via WhatsApp
                                </a>
                                <p className="cart-secure-note">Stock reserved for 10 mins after you message us.</p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
