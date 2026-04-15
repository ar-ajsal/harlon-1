import { useRef, useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { FiShoppingBag, FiZap } from 'react-icons/fi'

const TRUST_ITEMS = [
    { icon: '🔒', label: 'Secure Payment' },
    { icon: '🚚', label: 'Ships in 24h' },
    { icon: '↩️', label: '7-Day Returns' },
    { icon: '✅', label: '100% Authentic' },
]

function ProductSummary({
    product,
    selectedSize,
    onSizeSelect,
    onBuy,
    onWhatsApp,
    soldOut = false,
    deliveryEstimate = '',
    onSizeGuideClick,
    orderSettings = { whatsappOrderEnabled: true, onlinePaymentEnabled: true },
}) {
    if (!product) return null

    const prefersReduced = useReducedMotion()
    const sizesRef = useRef(null)

    const currentPrice = product.price
    const hasDiscount = product.originalPrice && product.price < product.originalPrice
    const discountPct = hasDiscount
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0

    const handleBuyClick = useCallback(() => {
        if (!selectedSize && product.sizes?.length > 0) {
            // Shake the size selector
            const el = sizesRef.current
            if (el) {
                el.classList.remove('shake')
                void el.offsetWidth // reflow to restart animation
                el.classList.add('shake')
                setTimeout(() => el.classList.remove('shake'), 400)
            }
            return
        }
        onBuy?.()
    }, [selectedSize, product.sizes, onBuy])

    const tap = prefersReduced ? {} : { scale: 0.97 }
    const hover = prefersReduced ? {} : { scale: 1.02 }

    // Indian number format
    const fmt = (n) => new Intl.NumberFormat('en-IN').format(n)

    return (
        <div className="pd-sidebar-inner">
            {/* Category label */}
            <span className="pd-category">{product.category}</span>

            {/* Product name */}
            <h1 className="pd-name">{product.name}</h1>

            {/* Price row */}
            <div className="pd-price-row">
                <span className="pd-price">₹{fmt(currentPrice)}</span>
                {hasDiscount && (
                    <>
                        <span className="pd-price-orig">₹{fmt(product.originalPrice)}</span>
                        <span className="pd-price-off">{discountPct}% OFF</span>
                    </>
                )}
            </div>

            {/* Sold-out badge */}
            {soldOut && (
                <div className="pd-sold-badge">
                    <span>❌</span> Sold Out — Check back soon
                </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <p className="pd-size-label">
                        Size
                        {selectedSize && (
                            <span className="pd-size-selected" style={{ marginLeft: 8 }}>
                                — {selectedSize}
                            </span>
                        )}
                        <button
                            type="button"
                            className="pd-size-guide-link"
                            onClick={onSizeGuideClick}
                            tabIndex={0}
                        >
                            Size Guide →
                        </button>
                    </p>
                    <div className="pd-sizes" ref={sizesRef}>
                        {product.sizes.map(size => (
                            <motion.button
                                key={size}
                                type="button"
                                className={`pd-size-btn${selectedSize === size ? ' active' : ''}`}
                                onClick={() => !soldOut && onSizeSelect?.(size)}
                                disabled={soldOut}
                                whileTap={soldOut ? {} : tap}
                                aria-pressed={selectedSize === size}
                                aria-label={`Size ${size}`}
                            >
                                {size}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA block */}
            <div className="pd-cta-block">
                {!orderSettings.onlinePaymentEnabled && !orderSettings.whatsappOrderEnabled ? (
                    <div style={{ textAlign: 'center', padding: '16px', background: '#ffe4e6', color: '#be123c', borderRadius: 12, fontWeight: 600, fontSize: 13, border: '1px solid #fda4af' }}>
                        🚫 Orders are currently disabled. Check back soon.
                    </div>
                ) : (
                    <>
                        {orderSettings.onlinePaymentEnabled && (
                            <motion.button
                                type="button"
                                className="pd-btn-buy"
                                onClick={handleBuyClick}
                                disabled={soldOut}
                                whileHover={soldOut ? {} : hover}
                                whileTap={soldOut ? {} : tap}
                                aria-label="Buy now"
                            >
                                <FiShoppingBag style={{ fontSize: 18 }} />
                                {soldOut ? 'Sold Out' : `Buy Now — ₹${fmt(currentPrice)}`}
                            </motion.button>
                        )}

                        {orderSettings.whatsappOrderEnabled && (
                            <motion.button
                                type="button"
                                className="pd-btn-wa"
                                onClick={onWhatsApp}
                                disabled={soldOut}
                                whileHover={soldOut ? {} : hover}
                                whileTap={soldOut ? {} : tap}
                                aria-label="Order on WhatsApp"
                            >
                                <FaWhatsapp style={{ fontSize: 20 }} />
                                {soldOut ? 'Sold Out' : 'Order via WhatsApp'}
                            </motion.button>
                        )}
                    </>
                )}

                {soldOut && (
                    <button type="button" className="pd-btn-waitlist">
                        <FiZap style={{ fontSize: 14 }} />
                        Notify me when back
                    </button>
                )}
            </div>

            {/* Trust grid */}
            <div className="pd-trust-grid">
                {TRUST_ITEMS.map(({ icon, label }) => (
                    <div key={label} className="pd-trust-item">
                        <span className="pd-trust-icon" aria-hidden>{icon}</span>
                        <span>{label}</span>
                    </div>
                ))}
            </div>

            {/* Delivery estimate */}
            {deliveryEstimate && (
                <p style={{ fontSize: 12, color: '#888', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>
                    🚚 {deliveryEstimate}
                </p>
            )}
        </div>
    )
}

export default ProductSummary
