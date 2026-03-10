import { Link } from 'react-router-dom'
import { SoldOutRibbon } from './ui/Badge'
import { productThumb, productThumb2x } from '../utils/cloudinary'

// Aspect ratio for product images: 3:4 (400 × 533px)
const IMG_W = 400
const IMG_H = 533

function ProductCard({ product, priority = false }) {
    const discount = product.originalPrice && product.price < product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0

    const formatPrice = (n) => `₹${Number(n).toLocaleString('en-IN')}`

    const src1x = productThumb(product.images?.[0])         // 400×533
    const src2x = productThumb2x(product.images?.[0])       // 800×1067

    // Fallback if no Cloudinary URL
    const rawSrc = product.images?.[0] || '/images/placeholder.jpg'
    const imgSrc = src1x || rawSrc

    // Drop status
    const now = new Date()
    const isDropLive = product.dropEnabled &&
        product.dropStartTime && product.dropEndTime &&
        new Date(product.dropStartTime) <= now && new Date(product.dropEndTime) >= now
    const isDropUpcoming = product.dropEnabled &&
        product.dropStartTime && new Date(product.dropStartTime) > now
    const dropRemaining = isDropLive ? (product.dropQuantity || 0) - (product.dropSold || 0) : 0

    return (
        <Link
            to={`/product/${product._id}`}
            className={`product-card${product.soldOut ? ' sold-out' : ''}${isDropLive ? ' drop-active' : ''}`}
            aria-label={`${product.name}${product.soldOut ? ' — Sold Out' : ''}`}
        >
            {/* Image */}
            <div className="product-image-wrapper">
                <img
                    src={imgSrc}
                    srcSet={src2x ? `${imgSrc} 1x, ${src2x} 2x` : undefined}
                    sizes="(max-width: 430px) calc(50vw - 20px), 200px"
                    alt={product.name}
                    className="product-image"
                    width={IMG_W}
                    height={IMG_H}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    fetchpriority={priority ? 'high' : undefined}
                    style={product.soldOut ? { opacity: 0.5, filter: 'grayscale(50%)' } : undefined}
                />

                {/* Sold-out diagonal ribbon */}
                {product.soldOut && <SoldOutRibbon />}

                {/* Drop badge */}
                {isDropLive && !product.soldOut && (
                    <span className="product-badge drop-badge">⚡ DROP LIVE</span>
                )}
                {isDropUpcoming && !product.soldOut && (
                    <span className="product-badge drop-badge upcoming">⏳ DROP SOON</span>
                )}

                {/* Pre-order badge */}
                {product.isPreOrder && !product.soldOut && (
                    <span className="product-badge preorder-badge">📦 PRE-ORDER</span>
                )}

                {/* Badges (only when not sold out and no special badges) */}
                {!product.soldOut && !isDropLive && !isDropUpcoming && !product.isPreOrder && (
                    <>
                        {product.bestSeller && (
                            <span className="product-badge bestseller">⭐ Best Seller</span>
                        )}
                        {!product.bestSeller && discount >= 5 && (
                            <span className="product-badge">{discount}% OFF</span>
                        )}
                    </>
                )}

                {/* Low stock indicator for live drops */}
                {isDropLive && dropRemaining > 0 && dropRemaining <= 10 && (
                    <span className="product-badge low-stock-badge">🔥 {dropRemaining} left!</span>
                )}
            </div>

            {/* Info */}
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                {product.isPreOrder && product.expectedShipDate && (
                    <p style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 600, margin: '2px 0 4px', letterSpacing: '0.5px' }}>
                        Ships {new Date(product.expectedShipDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </p>
                )}
                <div className="product-price">
                    <span className="price-current">{formatPrice(product.price)}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="price-original">{formatPrice(product.originalPrice)}</span>
                    )}
                    {discount >= 5 && (
                        <span style={{
                            marginLeft: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--success, #16a34a)',
                            background: 'var(--success-bg, #f0fdf4)',
                            padding: '2px 7px',
                            borderRadius: 99,
                        }}>
                            {discount}% off
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
