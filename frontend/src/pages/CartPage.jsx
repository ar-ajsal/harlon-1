import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMinus, FiPlus, FiTrash2, FiArrowRight, FiLock } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import '../styles/cart.css'

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function CartPage() {
    const { items, removeItem, updateQty, totalItems, totalPrice, clearCart } = useCart()
    const { isLoggedIn } = useAuth()
    const navigate = useNavigate()

    const handleCheckout = () => {
        if (items.length === 0) return
        if (!isLoggedIn) {
            navigate('/login?redirect=' + encodeURIComponent('/checkout?cart=true'))
            return
        }
        navigate('/checkout?cart=true')
    }

    const isEmpty = items.length === 0

    return (
        <div className="cart-page">
            <div className="cart-page-header">
                <h1 className="cart-page-title">Your Cart</h1>
                <p className="cart-page-subtitle">
                    {totalItems > 0
                        ? `${totalItems} item${totalItems !== 1 ? 's' : ''} ready for checkout`
                        : 'Your cart is empty'}
                </p>
            </div>

            <div className="cart-page-grid">
                {isEmpty ? (
                    <div className="cart-empty-state">
                        <div className="cart-empty-icon">🛒</div>
                        <h2 className="cart-empty-title">Nothing here yet</h2>
                        <p className="cart-empty-sub">Browse our drops and add jerseys to your cart</p>
                        <Link to="/shop" className="cart-shop-link">
                            Shop the Drop <FiArrowRight />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* ── Items list ── */}
                        <div>
                            <AnimatePresence>
                                {items.map(item => (
                                    <motion.div
                                        key={item.key}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.18 }}
                                        className="cart-item-row"
                                    >
                                        {/* Image */}
                                        {item.image
                                            ? <img src={item.image} alt={item.name} className="cart-item-img" />
                                            : <div className="cart-item-img-placeholder">👕</div>
                                        }

                                        {/* Info */}
                                        <div className="cart-item-info">
                                            <p className="cart-item-name">{item.name}</p>
                                            <p className="cart-item-meta">Size: {item.size}</p>
                                            {/* Qty controls */}
                                            <div className="cart-item-controls">
                                                <button className="cart-qty-btn" onClick={() => updateQty(item.key, item.qty - 1)}>
                                                    <FiMinus size={11} />
                                                </button>
                                                <span className="cart-qty-num">{item.qty}</span>
                                                <button className="cart-qty-btn" onClick={() => updateQty(item.key, item.qty + 1)}>
                                                    <FiPlus size={11} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price + remove */}
                                        <div className="cart-item-right">
                                            <p className="cart-item-price">{fmt(item.price * item.qty)}</p>
                                            <button className="cart-remove-btn" onClick={() => removeItem(item.key)} aria-label="Remove item">
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            <button className="cart-clear-btn" onClick={clearCart}>
                                Clear cart
                            </button>
                        </div>

                        {/* ── Order summary ── */}
                        <div className="cart-summary-card">
                            <p className="cart-summary-title">Order Summary</p>

                            <div className="cart-summary-row">
                                <span>Subtotal ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                                <span>{fmt(totalPrice)}</span>
                            </div>
                            <div className="cart-summary-row">
                                <span>Delivery</span>
                                <span className="cart-summary-free">FREE 🎉</span>
                            </div>

                            <hr className="cart-summary-divider" />

                            <div className="cart-summary-total">
                                <span className="cart-summary-total-label">Total</span>
                                <span className="cart-summary-total-price">{fmt(totalPrice)}</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleCheckout}
                                className="cart-checkout-btn-main"
                            >
                                <FiLock size={15} />
                                {isLoggedIn ? 'Proceed to Checkout' : 'Sign In & Checkout'}
                            </motion.button>

                            {!isLoggedIn && (
                                <p className="cart-login-note">
                                    You'll be asked to sign in before checkout
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
