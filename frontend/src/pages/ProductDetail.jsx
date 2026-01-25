import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import { productsApi } from '../services/api'
import { WHATSAPP_NUMBER } from '../config/constants'

function ProductDetail() {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedImage, setSelectedImage] = useState(0)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productsApi.getById(id)
                if (response) {
                    setProduct(response.data || response)
                } else {
                    setProduct(null)
                }
            } catch (err) {
                console.error('Error fetching product:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProduct()
    }, [id])

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="product-detail">
                <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>Product Not Found</h2>
                    <p style={{ color: 'var(--base-color)', margin: '20px 0' }}>
                        The product you're looking for doesn't exist.
                    </p>
                    <Link to="/shop" className="btn btn-primary">
                        Back to Shop
                    </Link>
                </div>
            </div>
        )
    }

    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0

    const generateWhatsAppLink = () => {
        const message = `Hi! I want to buy:

🛒 *${product.name}*
${selectedSize ? `📏 Size: ${selectedSize}` : ''}
💰 Price: ₹${product.price}

Please confirm availability and share payment details.`

        return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    }

    return (
        <div className="product-detail">
            <div className="container">
                <Link
                    to="/shop"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--base-color)',
                        marginBottom: '30px'
                    }}
                >
                    <FiArrowLeft />
                    Back to Shop
                </Link>

                <div className="product-detail-grid">
                    <div className="product-gallery">
                        <img
                            src={product.images?.[selectedImage] || '/images/placeholder.jpg'}
                            alt={product.name}
                            className="main-image"
                        />
                        {product.images?.length > 1 && (
                            <div className="thumbnail-grid">
                                {product.images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={image}
                                        alt={`${product.name} ${index + 1}`}
                                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="product-info-detail">
                        <span className="product-category">{product.category}</span>
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-price-detail">
                            <span className="price-current-detail">₹{product.price}</span>
                            {product.originalPrice && (
                                <>
                                    <span className="price-original-detail">₹{product.originalPrice}</span>
                                    <span className="discount-badge">{discount}% OFF</span>
                                </>
                            )}
                        </div>

                        <p className="product-description">{product.description}</p>

                        {product.sizes?.length > 0 && (
                            <div className="size-selector">
                                <label className="size-label">Select Size:</label>
                                <div className="size-options">
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            className={`size-option ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: product.inStock ? 'var(--color-green)' : 'var(--color-red)',
                            marginBottom: '20px'
                        }}>
                            <FiCheck />
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>

                        <div className="buy-section">
                            <a
                                href={generateWhatsAppLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    fontSize: '18px',
                                    padding: '18px'
                                }}
                            >
                                <FaWhatsapp size={24} />
                                Buy on WhatsApp
                            </a>
                            <p style={{
                                textAlign: 'center',
                                color: 'var(--primary-color)',
                                fontSize: '14px',
                                marginTop: '15px'
                            }}>
                                Fast delivery across India • Cash on Delivery Available
                            </p>
                        </div>

                        <div style={{
                            marginTop: '40px',
                            padding: '25px',
                            background: 'var(--color-cream)',
                            border: '1px solid var(--border-color)'
                        }}>
                            <h4 style={{ marginBottom: '15px', color: 'var(--heading-color)' }}>
                                Features
                            </h4>
                            <ul style={{
                                color: 'var(--base-color)',
                                lineHeight: '2'
                            }}>
                                <li>✓ Premium quality fabric</li>
                                <li>✓ Breathable & comfortable</li>
                                <li>✓ True to size fit</li>
                                <li>✓ Machine washable</li>
                                <li>✓ Fast shipping across India</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail
