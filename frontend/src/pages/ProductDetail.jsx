import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWhatsapp, FaArrowLeft, FaCheck, FaTags, FaCreditCard, FaEnvelope, FaShoppingBag, FaCog, FaMapMarkerAlt } from 'react-icons/fa'
import { useProducts } from '../context/ProductContext'
import { WHATSAPP_NUMBER } from '../config/constants'
import { couponsApi, couponSalesApi } from '../api/coupons.api'
import { toast } from 'react-toastify'
import InquiryModal from '../components/InquiryModal'
import ProductGallery from '../components/product/ProductGallery'
import ProductSummary from '../components/product/ProductSummary'

// ─── Delivery helpers ────────────────────────────────────────────────────────
function getDeliveryDates() {
    const now = new Date()

    // Cutoff: if ordered today before midnight, production starts today
    const purchasedDate = new Date(now)

    // Processing: 2 days after purchase
    const processingStart = new Date(purchasedDate)
    processingStart.setDate(processingStart.getDate() + 2)
    const processingEnd = new Date(processingStart)
    processingEnd.setDate(processingEnd.getDate() + 1)

    // Delivery window: 4–12 days from purchase
    const deliveryStart = new Date(purchasedDate)
    deliveryStart.setDate(deliveryStart.getDate() + 4)
    const deliveryEnd = new Date(purchasedDate)
    deliveryEnd.setDate(deliveryEnd.getDate() + 12)

    const fmt = (d) =>
        d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '/')

    const fmtShort = (d) =>
        d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })

    return {
        purchasedLabel: fmtShort(purchasedDate),
        processingLabel: `${fmtShort(processingStart)} - ${fmtShort(processingEnd)}`,
        deliveredLabel: `${fmtShort(deliveryStart)} - ${fmtShort(deliveryEnd)}`,
        rangeLabel: `${fmt(deliveryStart)}–${fmt(deliveryEnd)}`,
    }
}

// Midnight countdown target
function getMidnightTarget() {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    return midnight
}

function useCountdown() {
    const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' })

    useEffect(() => {
        const tick = () => {
            const now = new Date()
            const diff = getMidnightTarget() - now
            const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
            const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
            const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
            setTimeLeft({ h, m, s })
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [])

    return timeLeft
}

// ─── Size chart data ─────────────────────────────────────────────────────────
const SIZE_CHART = [
    { size: 'S', chest: 18, length: 24 },
    { size: 'M', chest: 19, length: 26 },
    { size: 'L', chest: 20, length: 28 },
    { size: 'XL', chest: 21, length: 30 },
    { size: 'XXL', chest: 22, length: 32 },
]

// ─── Component ───────────────────────────────────────────────────────────────
function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { products, loading } = useProducts()
    const [product, setProduct] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedSize, setSelectedSize] = useState(null)
    const [couponCode, setCouponCode] = useState('')
    const [validatedCoupon, setValidatedCoupon] = useState(null)
    const [couponLoading, setCouponLoading] = useState(false)
    const [showInquiry, setShowInquiry] = useState(false)
    const [activeTab, setActiveTab] = useState('description') // 'description' | 'sizeChart'

    const { h, m, s } = useCountdown()
    const dates = getDeliveryDates()

    useEffect(() => {
        if (products.length > 0) {
            const foundProduct = products.find(p => p._id === id)
            setProduct(foundProduct)
            if (foundProduct?.sizes?.length > 0) {
                setSelectedSize(foundProduct.sizes[0])
            }
        }
    }, [id, products])

    // Related products: same category, exclude current, limit 12
    const relatedProducts = useMemo(() => {
        if (!product || !products.length) return []
        return products.filter(
            p => p._id !== product._id && p.category === product.category && p.isVisible !== false
        ).slice(0, 12)
    }, [product, products])

    // Auto-slider: advance related products every 4s
    const relatedSliderRef = useRef(null)
    useEffect(() => {
        if (relatedProducts.length <= 1) return
        const el = relatedSliderRef.current
        if (!el) return
        const step = () => {
            const { scrollLeft, clientWidth, scrollWidth } = el
            const next = scrollLeft + clientWidth
            if (next >= scrollWidth - 2) el.scrollTo({ left: 0, behavior: 'smooth' })
            else el.scrollBy({ left: clientWidth, behavior: 'smooth' })
        }
        const id = setInterval(step, 4000)
        return () => clearInterval(id)
    }, [relatedProducts.length])

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) { toast.error('Please enter a coupon code'); return }
        try {
            setCouponLoading(true)
            const response = await couponsApi.validate(couponCode.toUpperCase())
            setValidatedCoupon(response.data)
            toast.success(`✓ Coupon ${response.data.code} applied!`)
        } catch (error) {
            console.error('Coupon validation error:', error)
            setValidatedCoupon(null)
            toast.error(error.message || 'Invalid or expired coupon code')
        } finally {
            setCouponLoading(false)
        }
    }

    const handleWhatsAppOrder = async () => {
        if (!product || !selectedSize) return
        const pageUrl = `${window.location.origin}/product/${product._id}`
        let message = `*Jersy_store Order Request*\n\n` +
            `*Product:* ${product.name}\n` +
            `*Size:* ${selectedSize}\n` +
            `*Price:* ₹${product.price}\n`
        if (validatedCoupon) message += `*🎫 Coupon Code:* ${validatedCoupon.code}\n`
        message += `\n*Page Link:* ${pageUrl}\n\nI would like to place an order. Is this available?`

        if (validatedCoupon) {
            try {
                await couponSalesApi.create({
                    couponCode: validatedCoupon.code,
                    customerName: 'Customer',
                    customerPhone: 'From WhatsApp',
                    productName: product.name,
                    productId: product._id,
                    amount: product.price,
                    size: selectedSize,
                    whatsappMessage: message
                })
            } catch (error) {
                console.error('Error recording sale:', error)
            }
        }
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    }

    if (loading) return <div className="loading"><div className="spinner"></div></div>

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

                <div className="product-detail-grid grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }}
                    >
                        <ProductGallery
                            images={product.images}
                            selected={selectedImage}
                            onSelect={setSelectedImage}
                            alt={product.name}
                        />
                    </motion.div>

                    {/* Sticky Product Summary + extras */}
                    <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
                        <ProductSummary
                            product={product}
                            selectedSize={selectedSize}
                            onSizeSelect={setSelectedSize}
                            onBuy={() => {
                                if (!selectedSize) { toast.error('Please select a size first'); return }
                                navigate(`/checkout?productId=${product._id}&size=${selectedSize}&method=razorpay`)
                            }}
                            onWhatsApp={handleWhatsAppOrder}
                            soldOut={product.soldOut}
                            deliveryEstimate={dates.rangeLabel ? `By ${dates.rangeLabel}` : '4–9 business days'}
                        />

                        {/* Delivery countdown */}
                        <div className="rounded-card border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm">
                            <span className="text-muted">Order within </span>
                            <span className="font-mono font-semibold text-charcoal dark:text-off-white">{h}:{m}:{s}</span>
                            <span className="text-muted"> for delivery between </span>
                            <span className="font-medium text-charcoal dark:text-off-white">{dates.rangeLabel}</span>
                        </div>

                        {/* Delivery timeline (compact) */}
                        <div className="flex items-center gap-2 text-sm text-muted">
                            <FaShoppingBag className="w-4 h-4 flex-shrink-0" />
                            <span>{dates.purchasedLabel}</span>
                            <span className="mx-1">→</span>
                            <FaCog className="w-4 h-4 flex-shrink-0" />
                            <span>{dates.processingLabel}</span>
                            <span className="mx-1">→</span>
                            <FaMapMarkerAlt className="w-4 h-4 flex-shrink-0" />
                            <span>{dates.deliveredLabel}</span>
                        </div>

                        {/* Coupon */}
                        <div className="coupon-section">
                            <label className="coupon-label block text-sm font-semibold text-charcoal dark:text-off-white mb-2">
                                <FaTags className="inline mr-1" /> Have a Coupon Code?
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="form-input flex-1 rounded-card border border-slate-200 dark:border-white/20 px-3 py-2"
                                    placeholder="e.g. FRIEND123"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                    disabled={couponLoading}
                                />
                                <motion.button
                                    type="button"
                                    className="btn btn-secondary rounded-card px-4"
                                    onClick={handleApplyCoupon}
                                    disabled={couponLoading || !couponCode.trim()}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {couponLoading ? 'Checking...' : 'Apply'}
                                </motion.button>
                            </div>
                            {validatedCoupon && (
                                <motion.p
                                    initial={{ opacity: 0, y: -4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-2 text-sm text-success font-medium"
                                >
                                    ✓ {validatedCoupon.code} applied
                                    {validatedCoupon.discountValue > 0 && (
                                        validatedCoupon.discountType === 'percentage'
                                            ? ` — ${validatedCoupon.discountValue}% OFF`
                                            : ` — ₹${validatedCoupon.discountValue} OFF`
                                    )}
                                </motion.p>
                            )}
                        </div>

                        <motion.button
                            type="button"
                            className="w-full btn btn-outline min-h-[48px]"
                            onClick={() => setShowInquiry(true)}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaEnvelope /> Inquiry
                        </motion.button>

                        {showInquiry && (
                            <InquiryModal product={product} onClose={() => setShowInquiry(false)} />
                        )}
                    </div>
                </div>

                {/* ── Description / Size Chart Tabs ── */}
                <div className="pd-tabs">
                    <div className="pd-tabs__nav">
                        <button
                            className={`pd-tabs__btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`pd-tabs__btn ${activeTab === 'sizeChart' ? 'active' : ''}`}
                            onClick={() => setActiveTab('sizeChart')}
                        >
                            Size Chart
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'description' && (
                            <motion.div
                                key="description"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="pd-tabs__content"
                            >
                                <p className="pd-description">
                                    {product.description || 'No description available for this product.'}
                                </p>
                            </motion.div>
                        )}

                        {activeTab === 'sizeChart' && (
                            <motion.div
                                key="sizeChart"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="pd-tabs__content"
                            >
                                {/* T-shirt diagram */}
                                <div className="size-chart-diagram">
                                    <svg viewBox="0 0 240 200" className="size-chart-tshirt" xmlns="http://www.w3.org/2000/svg">
                                        {/* T-shirt body */}
                                        <path
                                            d="M60 30 L20 70 L50 80 L50 175 L190 175 L190 80 L220 70 L180 30 Q160 45 120 45 Q80 45 60 30Z"
                                            fill="#1a1a1a" stroke="#333" strokeWidth="1.5"
                                        />
                                        {/* Neckline */}
                                        <path d="M100 30 Q120 50 140 30" fill="none" stroke="#333" strokeWidth="1.5" />
                                        {/* Chest width arrow */}
                                        <line x1="58" y1="95" x2="182" y2="95" stroke="#7c3f5e" strokeWidth="1.5" markerEnd="url(#arrow)" markerStart="url(#arrowR)" />
                                        {/* Height arrow */}
                                        <line x1="205" y1="30" x2="205" y2="175" stroke="#555" strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrowD)" markerStart="url(#arrowU)" />

                                        <defs>
                                            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                                                <path d="M0,0 L6,3 L0,6Z" fill="#7c3f5e" />
                                            </marker>
                                            <marker id="arrowR" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                                                <path d="M0,0 L6,3 L0,6Z" fill="#7c3f5e" />
                                            </marker>
                                            <marker id="arrowD" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                                                <path d="M0,0 L6,3 L0,6Z" fill="#555" />
                                            </marker>
                                            <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse">
                                                <path d="M0,0 L6,3 L0,6Z" fill="#555" />
                                            </marker>
                                        </defs>

                                        {/* Harlon text */}
                                        <text x="120" y="130" textAnchor="middle" fontSize="18" fontFamily="cursive" fill="#7c3f5e" opacity="0.7">harlon</text>
                                    </svg>
                                </div>

                                {/* Size table */}
                                <div className="size-chart-table-wrap">
                                    <table className="size-chart-table">
                                        <thead>
                                            <tr>
                                                <th>Size</th>
                                                <th>Chest (inches)</th>
                                                <th>Length (inches)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {SIZE_CHART.map(row => (
                                                <tr key={row.size}>
                                                    <td>{row.size}</td>
                                                    <td>{row.chest}</td>
                                                    <td>{row.length}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <p className="size-chart-note">
                                    For an oversized fit, the length stays the same while the chest measurement increases by 2 inches.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Related products auto-slider */}
                {relatedProducts.length > 0 && (
                    <motion.section
                        className="related-products"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <h2 className="related-products__title">You might also like</h2>
                        <div
                            ref={relatedSliderRef}
                            className="related-products-slider"
                            aria-label="Related products carousel"
                        >
                            <div className="related-products-track">
                                {relatedProducts.map((p) => (
                                    <div key={p._id} className="related-products-slide">
                                        <ProductCard product={p} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.section>
                )}
            </div>
        </div>
    )
}

export default ProductDetail
