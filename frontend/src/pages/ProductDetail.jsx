import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp, FaArrowLeft, FaCheck } from 'react-icons/fa'
import { useProducts } from '../context/ProductContext'
import { WHATSAPP_NUMBER } from '../config/constants'

function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { products, loading } = useProducts()
    const [product, setProduct] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedSize, setSelectedSize] = useState(null)

    useEffect(() => {
        if (products.length > 0) {
            const foundProduct = products.find(p => p._id === id)
            setProduct(foundProduct)
            if (foundProduct?.sizes?.length > 0) {
                setSelectedSize(foundProduct.sizes[0])
            }
        }
    }, [id, products])

    const handleWhatsAppOrder = () => {
        if (!product || !selectedSize) return

        const currentImage = product.images[selectedImage] || product.images[0] || ''
        const pageUrl = `${window.location.origin}/product/${product._id}`

        const message = `*Jersy_store Order Request*\n\n` +
            `*Product:* ${product.name}\n` +
            `*Size:* ${selectedSize}\n` +
            `*Price:* ₹${product.price}\n\n` +
            `*Product Image:* ${currentImage}\n` +
            `*Page Link:* ${pageUrl}\n\n` +
            `I would like to place an order. Is this available?`

        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!product || product.isVisible === false) {
        return (
            <div className="product-not-found">
                <div className="container">
                    <h2>Product not found</h2>
                    <button onClick={() => navigate('/shop')} className="btn btn-primary">
                        <FaArrowLeft /> Back to Shop
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="product-detail">
            <div className="container">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft /> Back
                </motion.button>

                <div className="product-detail-grid">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="product-gallery"
                    >
                        {/* Main Image */}
                        <div className="gallery-main">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={selectedImage}
                                    src={product.images[selectedImage] || '/images/placeholder.jpg'}
                                    alt={product.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                />
                            </AnimatePresence>
                        </div>

                        {/* Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="gallery-thumbnails">
                                {product.images.map((image, index) => (
                                    <motion.button
                                        key={index}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <img src={image} alt={`${product.name} ${index + 1}`} />
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="product-info-panel"
                    >
                        {/* Category & Bestseller Badge */}
                        <div className="product-meta">
                            <span className="category-badge">{product.category}</span>
                            {product.bestSeller && (
                                <span className="bestseller-badge">
                                    <FaCheck /> Best Seller
                                </span>
                            )}
                        </div>

                        {/* Product Name */}
                        <h1 className="product-detail-title">{product.name}</h1>

                        {/* Price */}
                        <div className="product-detail-price">
                            <span className="price-current">₹{product.price}</span>
                            {product.originalPrice && (
                                <span className="price-original">₹{product.originalPrice}</span>
                            )}
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div className="product-description">
                                <p>{product.description}</p>
                            </div>
                        )}

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="size-selection">
                                <label className="size-label">Select Size</label>
                                <div className="size-options">
                                    {product.sizes.map((size) => (
                                        <motion.button
                                            key={size}
                                            className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {size}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* WhatsApp CTA */}
                        <motion.button
                            className="btn btn-whatsapp whatsapp-cta"
                            onClick={handleWhatsAppOrder}
                            disabled={!selectedSize}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaWhatsapp />
                            Buy via WhatsApp
                        </motion.button>

                        {/* Additional Info */}
                        <div className="product-additional-info">
                            <div className="info-item">
                                <span className="info-icon">✓</span>
                                <span>Authentic Quality</span>
                            </div>
                            <div className="info-item">
                                <span className="info-icon">✓</span>
                                <span>Premium Materials</span>
                            </div>
                            <div className="info-item">
                                <span className="info-icon">✓</span>
                                <span>Fast Delivery</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail
