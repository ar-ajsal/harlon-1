/**
 * WishlistPage — "Jersey Wall" — Pinterest-style saved jerseys collection
 * Route: /wishlist
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHeart, FiTrash2, FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import { useWishlist } from '../context/WishlistContext'

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

const cardV = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.88, transition: { duration: 0.22 } }
}

export default function WishlistPage() {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()
    const [confirmClear, setConfirmClear] = useState(false)

    return (
        <div className="wl-page">
            <section className="wl-header">
                <div className="wl-header-inner">
                    <p className="wl-eyebrow">My Collection</p>
                    <h1 className="wl-title">
                        Jersey Wall
                        {wishlist.length > 0 && (
                            <span className="wl-count">{wishlist.length}</span>
                        )}
                    </h1>
                    <p className="wl-sub">Your saved jerseys — all in one place.</p>
                </div>
            </section>

            <div className="wl-body">
                {wishlist.length === 0 ? (
                    <motion.div
                        className="wl-empty"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="wl-empty-icon">
                            <FiHeart size={48} />
                        </div>
                        <h2>No jerseys saved yet</h2>
                        <p>Tap the heart ♥ on any jersey to add it to your wall</p>
                        <Link to="/shop" className="wl-shop-btn">
                            <FiShoppingBag /> Browse Collection
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <div className="wl-actions-bar">
                            <span className="wl-actions-count">{wishlist.length} jersey{wishlist.length !== 1 ? 's' : ''} saved</span>
                            {!confirmClear ? (
                                <button className="wl-clear-btn" onClick={() => setConfirmClear(true)}>
                                    <FiTrash2 size={13} /> Clear All
                                </button>
                            ) : (
                                <div className="wl-confirm-row">
                                    <span>Are you sure?</span>
                                    <button className="wl-confirm-yes" onClick={() => { clearWishlist(); setConfirmClear(false) }}>Yes, clear</button>
                                    <button className="wl-confirm-no" onClick={() => setConfirmClear(false)}>Cancel</button>
                                </div>
                            )}
                        </div>

                        <motion.div
                            className="wl-grid"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                        >
                            <AnimatePresence>
                                {wishlist.map(product => {
                                    const disc = product.originalPrice && product.price < product.originalPrice
                                        ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

                                    return (
                                        <motion.div
                                            key={product._id}
                                            className="wl-card"
                                            variants={cardV}
                                            layout
                                            exit="exit"
                                        >
                                            <Link to={`/product/${product._id}`} className="wl-card-img-wrap">
                                                <img
                                                    src={product.images?.[0] || '/images/placeholder.jpg'}
                                                    alt={product.name}
                                                    loading="lazy"
                                                />
                                                {product.soldOut && (
                                                    <div className="wl-sold-overlay">Sold Out</div>
                                                )}
                                                {disc >= 8 && !product.soldOut && (
                                                    <span className="wl-disc-badge">{disc}% OFF</span>
                                                )}
                                            </Link>
                                            <div className="wl-card-body">
                                                <p className="wl-card-cat">{product.category}</p>
                                                <h3 className="wl-card-name">{product.name}</h3>
                                                <div className="wl-card-price-row">
                                                    <span className="wl-card-price">{fmt(product.price)}</span>
                                                    {product.originalPrice > product.price && (
                                                        <span className="wl-card-orig">{fmt(product.originalPrice)}</span>
                                                    )}
                                                </div>
                                                <div className="wl-card-footer">
                                                    <Link to={`/product/${product._id}`} className="wl-view-btn">
                                                        View <FiArrowRight size={12} />
                                                    </Link>
                                                    <button
                                                        className="wl-remove-btn"
                                                        onClick={() => removeFromWishlist(product._id)}
                                                        aria-label={`Remove ${product.name} from wishlist`}
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </motion.div>

                        <div className="wl-browse-more">
                            <Link to="/shop" className="wl-browse-btn">
                                <FiShoppingBag /> Keep Browsing
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
