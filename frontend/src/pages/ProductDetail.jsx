import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FaArrowLeft, FaTags, FaShoppingBag, FaCog, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'
import { useProducts } from '../context/ProductContext'
import { WHATSAPP_NUMBER } from '../config/constants'
import { couponsApi, couponSalesApi } from '../api/coupons.api'
import { toast } from 'react-toastify'
import InquiryModal from '../components/InquiryModal'
import ProductGallery from '../components/product/ProductGallery'
import ProductSummary from '../components/product/ProductSummary'
import ProductCard from '../components/ProductCard'
import '../styles/product-detail.css'

// ─── Delivery helpers ────────────────────────────────────────────────────────
function getDeliveryDates() {
    const now = new Date()
    const purchasedDate = new Date(now)

    const processingStart = new Date(purchasedDate)
    processingStart.setDate(processingStart.getDate() + 2)
    const processingEnd = new Date(processingStart)
    processingEnd.setDate(processingEnd.getDate() + 1)

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
        processingLabel: `${fmtShort(processingStart)}–${fmtShort(processingEnd)}`,
        deliveredLabel: `${fmtShort(deliveryStart)}–${fmtShort(deliveryEnd)}`,
        rangeLabel: `${fmt(deliveryStart)}–${fmt(deliveryEnd)}`,
    }
}

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
    const prefersReduced = useReducedMotion()

    const [product, setProduct] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedSize, setSelectedSize] = useState(null)
    const [couponCode, setCouponCode] = useState('')
    const [validatedCoupon, setValidatedCoupon] = useState(null)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponOpen, setCouponOpen] = useState(false)
    const [showInquiry, setShowInquiry] = useState(false)
    const [activeTab, setActiveTab] = useState('description')
    const [stickyVisible, setStickyVisible] = useState(false)

    const { h, m, s } = useCountdown()
    const dates = getDeliveryDates()

    // Ref to the in-page CTA block — observe it for sticky bar
    const ctaRef = useRef(null)

    useEffect(() => {
        if (products.length > 0) {
            const found = products.find(p => p._id === id)
            setProduct(found)
            if (found?.sizes?.length > 0) setSelectedSize(found.sizes[0])
        }
    }, [id, products])

    // Reset state & scroll on product change
    useEffect(() => {
        setSelectedImage(0)
        setCouponCode('')
        setValidatedCoupon(null)
        setShowInquiry(false)
        setActiveTab('description')
        setCouponOpen(false)
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'instant' : 'smooth' })
    }, [id])

    // Sticky bar observer on CTA block
    useEffect(() => {
        const el = ctaRef.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([entry]) => setStickyVisible(!entry.isIntersecting),
            { threshold: 0.2 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [product])

    // Related products
    const relatedProducts = useMemo(() => {
        if (!product || !products.length) return []
        return products
            .filter(p => p._id !== product._id && p.category === product.category && p.isVisible !== false)
            .slice(0, 12)
    }, [product, products])

    // Auto-slider
    const relatedSliderRef = useRef(null)
    useEffect(() => {
        if (relatedProducts.length <= 1 || prefersReduced) return
        const el = relatedSliderRef.current
        if (!el) return
        const step = () => {
            const { scrollLeft, clientWidth, scrollWidth } = el
            const next = scrollLeft + clientWidth
            if (next >= scrollWidth - 2) el.scrollTo({ left: 0, behavior: 'smooth' })
            else el.scrollBy({ left: 280, behavior: 'smooth' })
        }
        const timerId = setInterval(step, 4000)
        return () => clearInterval(timerId)
    }, [relatedProducts.length, prefersReduced])

    // ── Coupon ──────────────────────────────────────────────────────────────
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) { toast.error('Please enter a coupon code'); return }
        try {
            setCouponLoading(true)
            const response = await couponsApi.validate(couponCode.toUpperCase())
            setValidatedCoupon(response.data)
            toast.success(`✓ ${response.data.code} applied!`)
        } catch (error) {
            setValidatedCoupon(null)
            toast.error(error.message || 'Invalid or expired coupon code')
        } finally {
            setCouponLoading(false)
        }
    }

    // ── WhatsApp ─────────────────────────────────────────────────────────────
    const handleWhatsAppOrder = useCallback(async () => {
        if (!product || !selectedSize) return
        const pageUrl = `${window.location.origin}/product/${product._id}`
        let message = `*Harlon Order Request*\n\n` +
            `*Product:* ${product.name}\n` +
            `*Size:* ${selectedSize}\n` +
            `*Price:* ₹${product.discountedPrice || product.price}\n`
        if (validatedCoupon) message += `*🎫 Coupon:* ${validatedCoupon.code}\n`
        message += `\n*Page:* ${pageUrl}\n\nI would like to place an order. Is this available?`

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
                    whatsappMessage: message,
                })
            } catch (e) { console.error('Error recording sale:', e) }
        }
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    }, [product, selectedSize, validatedCoupon])

    // ── Buy now ──────────────────────────────────────────────────────────────
    const handleBuy = useCallback(() => {
        if (!selectedSize) { toast.error('Please select a size first'); return }
        navigate(`/checkout?productId=${product._id}&size=${selectedSize}&method=razorpay`)
    }, [product, selectedSize, navigate])

    // ─── Loading ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="pd-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
            </div>
        )
    }

    if (!product || product.isVisible === false) {
        return (
            <div className="pd-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 12 }}>Product not found</h2>
                    <button onClick={() => navigate('/shop')} className="pd-btn-buy" style={{ width: 'auto', padding: '14px 32px', display: 'inline-flex' }}>
                        ← Back to Shop
                    </button>
                </div>
            </div>
        )
    }

    const discountedPrice = product.discountedPrice || product.price
    const fmt = (n) => new Intl.NumberFormat('en-IN').format(n)

    return (
        <div className="pd-page">
            <div className="pd-container">
                {/* Back */}
                <motion.button
                    className="pd-back"
                    onClick={() => navigate(-1)}
                    initial={prefersReduced ? {} : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FaArrowLeft style={{ fontSize: 12 }} /> Back
                </motion.button>

                {/* ── Main grid ── */}
                <div className="pd-grid">
                    {/* Gallery */}
                    <motion.div
                        initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: [0.2, 0.9, 0.2, 1] }}
                    >
                        <ProductGallery
                            images={product.images}
                            selected={selectedImage}
                            onSelect={setSelectedImage}
                            alt={product.name}
                        />
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        className="pd-sidebar"
                        initial={prefersReduced ? {} : { opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1, ease: [0.2, 0.9, 0.2, 1] }}
                    >
                        {/* Countdown pill (above CTAs) */}
                        {!product.soldOut && (
                            <div className="pd-countdown-pill">
                                <span>⚡ Order within</span>
                                <span className="pd-countdown-timer">{h}:{m}:{s}</span>
                                <span>to ship today</span>
                            </div>
                        )}

                        {/* Product summary (name, price, size selector, CTAs, trust) */}
                        <div ref={ctaRef}>
                            <ProductSummary
                                product={product}
                                selectedSize={selectedSize}
                                onSizeSelect={setSelectedSize}
                                onBuy={handleBuy}
                                onWhatsApp={handleWhatsAppOrder}
                                soldOut={product.soldOut}
                                deliveryEstimate={`Estimated by ${dates.rangeLabel}`}
                                onSizeGuideClick={() => setActiveTab('sizeChart')}
                            />
                        </div>

                        {/* Delivery timeline row */}
                        <div className="pd-timeline-row" style={{ marginTop: 4 }}>
                            <FaShoppingBag className="tl-icon" />
                            <span>{dates.purchasedLabel}</span>
                            <span>→</span>
                            <FaCog className="tl-icon" />
                            <span>{dates.processingLabel}</span>
                            <span>→</span>
                            <FaMapMarkerAlt className="tl-icon" />
                            <span>{dates.deliveredLabel}</span>
                        </div>

                        {/* Coupon — collapsed by default */}
                        <div style={{ marginBottom: 12 }}>
                            <button
                                className="pd-coupon-toggle"
                                type="button"
                                onClick={() => setCouponOpen(o => !o)}
                                aria-expanded={couponOpen}
                            >
                                <FaTags style={{ fontSize: 12 }} />
                                Have a coupon code? {couponOpen ? '▲' : '›'}
                            </button>

                            <AnimatePresence>
                                {couponOpen && (
                                    <motion.div
                                        className="pd-coupon-body"
                                        initial={prefersReduced ? {} : { height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={prefersReduced ? {} : { height: 0, opacity: 0 }}
                                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                                    >
                                        <div className="pd-coupon-row">
                                            <input
                                                type="text"
                                                className="pd-coupon-input"
                                                placeholder="e.g. FRIEND123"
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                                                disabled={couponLoading}
                                                autoComplete="off"
                                            />
                                            <button
                                                type="button"
                                                className="pd-coupon-btn"
                                                onClick={handleApplyCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                            >
                                                {couponLoading ? '…' : 'Apply'}
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {validatedCoupon && (
                                                <motion.div
                                                    className="pd-coupon-success"
                                                    initial={prefersReduced ? {} : { opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0 }}
                                                >
                                                    ✓ {validatedCoupon.code} applied
                                                    {validatedCoupon.discountValue > 0 && (
                                                        validatedCoupon.discountType === 'percentage'
                                                            ? ` — ${validatedCoupon.discountValue}% OFF`
                                                            : ` — ₹${validatedCoupon.discountValue} OFF`
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Inquiry link */}
                        <button
                            type="button"
                            className="pd-inquiry-link"
                            onClick={() => setShowInquiry(true)}
                        >
                            <FaEnvelope style={{ fontSize: 12 }} />
                            Have a question? Send an inquiry
                        </button>
                    </motion.div>
                </div>

                {/* ── Description / Size Chart Tabs ── */}
                <div className="pd-tabs-wrap">
                    <div className="pd-tabs-nav">
                        {['description', 'sizeChart'].map(tab => (
                            <button
                                key={tab}
                                className={`pd-tab-btn${activeTab === tab ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'description' ? 'Description' : 'Size Chart'}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'description' && (
                            <motion.div
                                key="description"
                                className="pd-tab-content"
                                initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={prefersReduced ? {} : { opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <p>{product.description || 'No description available for this product.'}</p>
                            </motion.div>
                        )}

                        {activeTab === 'sizeChart' && (
                            <motion.div
                                key="sizeChart"
                                className="pd-tab-content"
                                initial={prefersReduced ? {} : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={prefersReduced ? {} : { opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* T-shirt SVG diagram */}
                                <div style={{ maxWidth: 220, margin: '0 auto 20px' }}>
                                    <svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
                                        <path
                                            d="M60 30 L20 70 L50 80 L50 175 L190 175 L190 80 L220 70 L180 30 Q160 45 120 45 Q80 45 60 30Z"
                                            fill="#1a1a1a" stroke="#333" strokeWidth="1.5"
                                        />
                                        <path d="M100 30 Q120 50 140 30" fill="none" stroke="#333" strokeWidth="1.5" />
                                        <line x1="58" y1="95" x2="182" y2="95" stroke="hsl(38,65%,55%)" strokeWidth="1.5" />
                                        <line x1="205" y1="30" x2="205" y2="175" stroke="#555" strokeWidth="1.5" strokeDasharray="4 3" />
                                        <text x="120" y="135" textAnchor="middle" fontSize="16" fontFamily="cursive" fill="hsl(38,65%,55%)" opacity="0.8">harlon</text>
                                    </svg>
                                </div>

                                <table className="pd-size-table">
                                    <thead>
                                        <tr>
                                            <th>Size</th>
                                            <th>Chest (inches)</th>
                                            <th>Length (inches)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {SIZE_CHART.map(row => (
                                            <tr key={row.size} style={selectedSize === row.size ? { background: 'hsl(38,65%,55%, 0.08)' } : {}}>
                                                <td style={{ fontWeight: selectedSize === row.size ? 700 : 400 }}>{row.size}</td>
                                                <td>{row.chest}</td>
                                                <td>{row.length}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="pd-size-note">
                                    For an oversized fit the length stays the same while chest increases by 2 inches.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Related products ── */}
                {relatedProducts.length > 0 && (
                    <motion.section
                        className="pd-related"
                        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="pd-related-header">
                            <h2 className="pd-related-title">You Might Also Like</h2>
                        </div>
                        <div ref={relatedSliderRef} className="pd-related-track" aria-label="Related products">
                            {relatedProducts.map(p => (
                                <div key={p._id} className="pd-related-slide">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </div>

            {/* ── Sticky mobile CTA bar ── */}
            <AnimatePresence>
                {stickyVisible && (
                    <motion.div
                        className="pd-sticky-bar"
                        initial={prefersReduced ? {} : { y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={prefersReduced ? {} : { y: 80, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                    >
                        <div className="pd-sticky-info">
                            <span className="pd-sticky-name">{product.name}</span>
                            <span className="pd-sticky-price">₹{fmt(discountedPrice)}</span>
                        </div>
                        <button
                            type="button"
                            className="pd-sticky-buy"
                            onClick={handleBuy}
                            disabled={product.soldOut}
                        >
                            {product.soldOut ? 'Sold Out' : 'Buy Now'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Inquiry modal ── */}
            {showInquiry && (
                <InquiryModal product={product} onClose={() => setShowInquiry(false)} />
            )}
        </div>
    )
}

export default ProductDetail
