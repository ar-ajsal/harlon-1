import { Link } from 'react-router-dom'

function ProductCard({ product }) {
    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0

    return (
        <Link
            to={`/product/${product._id}`}
            className={`product-card${product.soldOut ? ' sold-out' : ''}`}
        >
            <div className="product-image-wrapper">
                <img
                    src={product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    style={product.soldOut ? { opacity: 0.55, filter: 'grayscale(40%)' } : undefined}
                />
                {product.soldOut ? (
                    <span className="product-badge sold-out-badge">⛔ Sold Out</span>
                ) : product.bestSeller ? (
                    <span className="product-badge bestseller">Best Seller</span>
                ) : discount > 0 ? (
                    <span className="product-badge">{discount}% OFF</span>
                ) : null}
            </div>
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                    <span className="price-current">₹{product.price}</span>
                    {product.originalPrice && (
                        <span className="price-original">₹{product.originalPrice}</span>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard
