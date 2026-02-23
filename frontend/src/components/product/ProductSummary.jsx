import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { FiShoppingCart } from 'react-icons/fi'

function ProductSummary({
    product,
    selectedSize,
    onSizeSelect,
    onBuy,
    onWhatsApp,
    soldOut = false,
    deliveryEstimate = '',
}) {
    if (!product) return null

    const discountedPrice = product.discountedPrice || product.price
    const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

    return (
        <div className="product-summary">
            {/* Title */}
            <h1 className="product-name" style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.25, marginBottom: 8 }}>
                {product.name}
            </h1>

            {/* Price row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e' }}>
                    ₹{discountedPrice}
                </span>
                {hasDiscount && (
                    <>
                        <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: '#9ca3af' }}>
                            ₹{product.price}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#16a34a', background: '#dcfce7', borderRadius: 4, padding: '1px 8px' }}>
                            {Math.round(((product.price - discountedPrice) / product.price) * 100)}% OFF
                        </span>
                    </>
                )}
            </div>

            {/* Sold Out badge */}
            {soldOut && (
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca',
                    borderRadius: 6, padding: '6px 14px', fontWeight: 600, fontSize: 14, marginBottom: 16
                }}>
                    ❌ Sold Out
                </div>
            )}

            {/* Size selector */}
            {product.sizes?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Size
                        {selectedSize && <span style={{ marginLeft: 8, color: '#1a1a2e', textTransform: 'none', fontWeight: 700 }}>{selectedSize}</span>}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {product.sizes.map(size => (
                            <motion.button
                                key={size}
                                type="button"
                                onClick={() => onSizeSelect?.(size)}
                                disabled={soldOut}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    width: 48, height: 48, borderRadius: 8,
                                    border: selectedSize === size ? '2px solid #1a1a2e' : '2px solid #e5e7eb',
                                    background: selectedSize === size ? '#1a1a2e' : '#fff',
                                    color: selectedSize === size ? '#fff' : '#374151',
                                    fontWeight: 600, fontSize: 14, cursor: soldOut ? 'not-allowed' : 'pointer',
                                    opacity: soldOut ? 0.5 : 1, transition: 'all 0.15s'
                                }}
                                aria-pressed={selectedSize === size}
                                aria-label={`Size ${size}`}
                            >
                                {size}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <motion.button
                    type="button"
                    className="btn btn-primary"
                    onClick={onBuy}
                    disabled={soldOut}
                    whileHover={soldOut ? {} : { scale: 1.02 }}
                    whileTap={soldOut ? {} : { scale: 0.98 }}
                    style={{ minHeight: 52, fontSize: 16, fontWeight: 700, opacity: soldOut ? 0.5 : 1, cursor: soldOut ? 'not-allowed' : 'pointer' }}
                    aria-label="Buy now"
                >
                    <FiShoppingCart style={{ marginRight: 8 }} />
                    {soldOut ? 'Sold Out' : 'Buy Now'}
                </motion.button>

                <motion.button
                    type="button"
                    className="btn btn-whatsapp"
                    onClick={onWhatsApp}
                    disabled={soldOut}
                    whileHover={soldOut ? {} : { scale: 1.02 }}
                    whileTap={soldOut ? {} : { scale: 0.98 }}
                    style={{ minHeight: 52, fontSize: 15, fontWeight: 600, opacity: soldOut ? 0.5 : 1, cursor: soldOut ? 'not-allowed' : 'pointer' }}
                    aria-label="Order on WhatsApp"
                >
                    <FaWhatsapp style={{ marginRight: 8, fontSize: 18 }} />
                    {soldOut ? 'Sold Out' : 'WhatsApp Order'}
                </motion.button>
            </div>

            {/* Delivery estimate */}
            {deliveryEstimate && (
                <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
                    🚚 Estimated delivery: <strong style={{ color: '#374151' }}>{deliveryEstimate}</strong>
                </p>
            )}
        </div>
    )
}

export default ProductSummary
