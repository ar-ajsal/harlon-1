import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { trackOrder as trackByEmailId, trackByToken } from '../api/guestOrder.api'

// ── Step definitions (canonical order) ───────────────────────────────────────
const STEPS = [
    { key: 'order_placed', label: 'Order Placed', icon: '📋', short: 'Placed' },
    { key: 'payment_confirmed', label: 'Payment Confirmed', icon: '💳', short: 'Paid' },
    { key: 'processing', label: 'Processing', icon: '⚙️', short: 'Processing' },
    { key: 'packed', label: 'Packed', icon: '📦', short: 'Packed' },
    { key: 'shipped', label: 'Shipped', icon: '🚚', short: 'Shipped' },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🛵', short: 'On the Way' },
    { key: 'delivered', label: 'Delivered', icon: '🎉', short: 'Delivered' },
]

// For the simplified 4-step progress bar at the top
const PROGRESS_STEPS = [
    { key: 'order_placed', label: 'Ordered', icon: '📋' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'out-for-delivery', label: 'On the Way', icon: '🛵' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
]

// deliveryStatus → numeric rank (so progress bar knows where we are)
const DELIVERY_RANK = {
    processing: 1, confirmed: 1, packed: 1,
    shipped: 2,
    'out-for-delivery': 3,
    delivered: 4,
}

const PAY_BADGE = {
    pending: { label: 'Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    paid: { label: 'Paid ✓', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    cod_pending: { label: 'COD Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    cod_confirmed: { label: 'COD Confirmed', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    failed: { label: 'Failed', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

const DELIVERY_BADGE = {
    processing: { label: 'Processing', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    confirmed: { label: 'Confirmed', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    packed: { label: 'Packed', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    shipped: { label: 'Shipped', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
    'out-for-delivery': { label: 'Out for Delivery', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    delivered: { label: 'Delivered ✓', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function relativeTime(date) {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

function etaDate(createdAt) {
    const base = new Date(createdAt)
    const lo = new Date(base); lo.setDate(lo.getDate() + 4)
    const hi = new Date(base); hi.setDate(hi.getDate() + 9)
    const opts = { day: 'numeric', month: 'short' }
    return `${lo.toLocaleDateString('en-IN', opts)} – ${hi.toLocaleDateString('en-IN', { ...opts, year: 'numeric' })}`
}

function Pill({ label, bg, color, border }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: bg, color, border: `1px solid ${border}`
        }}>
            {label}
        </span>
    )
}

// ── Amazon/Flipkart-style horizontal progress bar ─────────────────────────────
function ProgressBar({ deliveryStatus }) {
    const cancelled = deliveryStatus === 'cancelled'
    const rank = DELIVERY_RANK[deliveryStatus] || 0

    if (cancelled) {
        return (
            <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                padding: '16px 20px', textAlign: 'center', color: '#991b1b',
                fontWeight: 600, fontSize: 15
            }}>
                ❌ This order has been cancelled.
            </div>
        )
    }

    return (
        <div className="track-progress-stepper">
            {PROGRESS_STEPS.map((step, i) => {
                const stepRank = i + 1
                const done = rank >= stepRank
                const current = rank === stepRank
                const isLast = i === PROGRESS_STEPS.length - 1

                return (
                    <div key={step.key} className="track-ps-item">
                        {/* Connecting line before (all except first) */}
                        {i > 0 && (
                            <div className={`track-ps-line ${rank >= stepRank ? 'done' : ''}`} />
                        )}

                        <div className={`track-ps-node ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                            <motion.div
                                className="track-ps-circle"
                                initial={false}
                                animate={{
                                    background: done ? (isLast && done ? '#10b981' : '#111827') : '#e5e7eb',
                                    borderColor: done ? (isLast && done ? '#10b981' : '#111827') : '#d1d5db',
                                    scale: current ? 1.15 : 1,
                                }}
                                transition={{ duration: 0.35 }}
                            >
                                {done ? (isLast ? '✓' : '✓') : step.icon}
                            </motion.div>
                            <div className={`track-ps-label ${done ? 'done' : ''} ${current ? 'current' : ''}`}>
                                {step.label}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// ── Vertical timeline events ──────────────────────────────────────────────────
function Timeline({ trackingEvents }) {
    if (!trackingEvents || trackingEvents.length === 0) return (
        <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
            No tracking events recorded yet.
        </p>
    )

    const evts = [...trackingEvents].reverse()

    return (
        <div className="track-timeline-v2">
            {evts.map((evt, i) => {
                const step = STEPS.find(s => s.key === evt.status) || { icon: '📌', label: evt.status?.replace(/_/g, ' ').replace(/-/g, ' ') }
                const isLatest = i === 0

                return (
                    <motion.div
                        key={i}
                        className={`track-tl-row ${isLatest ? 'latest' : ''}`}
                        initial={{ opacity: 0, x: -18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07, duration: 0.3 }}
                    >
                        {/* Left column: dot + line */}
                        <div className="track-tl-left">
                            <div className={`track-tl-dot ${isLatest ? 'dot-latest' : 'dot-past'}`}>
                                <span style={{ fontSize: 14 }}>{step.icon}</span>
                            </div>
                            {i < evts.length - 1 && <div className="track-tl-line" />}
                        </div>

                        {/* Right column: content */}
                        <div className="track-tl-content">
                            <div className="track-tl-title" style={{ color: isLatest ? '#111827' : '#374151' }}>
                                {step.label}
                                {isLatest && (
                                    <span style={{
                                        marginLeft: 8, fontSize: 11, background: '#111827', color: '#fff',
                                        padding: '2px 8px', borderRadius: 999, fontWeight: 600, verticalAlign: 'middle'
                                    }}>
                                        LATEST
                                    </span>
                                )}
                            </div>
                            {evt.note && <div className="track-tl-note">{evt.note}</div>}
                            {evt.location && (
                                <div className="track-tl-location">📍 {evt.location}</div>
                            )}
                            <div
                                className="track-tl-time"
                                title={new Date(evt.timestamp).toLocaleString('en-IN')}
                            >
                                {relativeTime(evt.timestamp)}
                                <span style={{ margin: '0 6px', opacity: 0.5 }}>·</span>
                                {new Date(evt.timestamp).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                                {evt.actor && evt.actor !== 'system' && (
                                    <span style={{ marginLeft: 6, opacity: 0.6 }}>by {evt.actor}</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}

// ── Main component ─────────────────────────────────────────────────────────────
function TrackOrder() {
    const [searchParams] = useSearchParams()
    const [form, setForm] = useState({
        email: searchParams.get('email') || '',
        orderId: searchParams.get('orderId') || ''
    })
    const [loading, setLoading] = useState(false)
    const [order, setOrder] = useState(null)
    const trackLinkRef = useRef(null)

    // Auto-load on mount via token or query params
    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            loadByToken(token)
        } else if (form.email && form.orderId) {
            handleTrack()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const loadByToken = async (token) => {
        setLoading(true)
        setOrder(null)
        try {
            const res = await trackByToken(token)
            setOrder(res.order)
        } catch (err) {
            toast.error(err.message || 'Tracking link is invalid or expired.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleTrack = async (e) => {
        if (e) e.preventDefault()
        if (!form.email.trim() || !form.orderId.trim()) {
            toast.error('Please enter your email and Order ID')
            return
        }
        setLoading(true)
        setOrder(null)
        try {
            const res = await trackByEmailId(form.email.trim(), form.orderId.trim())
            setOrder(res.order)
        } catch (err) {
            toast.error(err.message || 'Order not found. Check your email and Order ID.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopyTrackLink = () => {
        if (!order?.trackLink) return
        navigator.clipboard.writeText(order.trackLink)
            .then(() => toast.success('Tracking link copied!'))
            .catch(() => toast.error('Copy failed — please copy manually'))
    }

    const payBadge = order ? (PAY_BADGE[order.paymentStatus] || { label: order.paymentStatus, bg: '#f9fafb', color: '#374151', border: '#d1d5db' }) : {}
    const delBadge = order ? (DELIVERY_BADGE[order.deliveryStatus] || { label: order.deliveryStatus, bg: '#f9fafb', color: '#374151', border: '#d1d5db' }) : {}

    return (
        <div className="track-order-page">
            <div className="container" style={{ maxWidth: 720, padding: '0 16px' }}>

                {/* ── Search Card ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="track-order-card"
                >
                    <h1 className="track-title">📦 Track Your Order</h1>
                    <p className="track-subtitle">Enter your email and Order ID, or use the link from your confirmation email.</p>

                    <form className="track-form" onSubmit={handleTrack}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="track-email">Email Address</label>
                                <input
                                    id="track-email"
                                    type="email" name="email" value={form.email}
                                    onChange={handleChange} placeholder="you@example.com"
                                    required className="form-input"
                                    aria-label="Your email address"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="track-orderid">Order ID</label>
                                <input
                                    id="track-orderid"
                                    type="text" name="orderId" value={form.orderId}
                                    onChange={handleChange} placeholder="HRL-1708500000000-XXXX"
                                    required className="form-input"
                                    aria-label="Your Order ID"
                                />
                            </div>
                        </div>
                        <motion.button
                            type="submit" className="btn btn-primary track-submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            aria-label="Track my order"
                        >
                            {loading ? 'Searching…' : '🔍 Track Order'}
                        </motion.button>
                    </form>
                </motion.div>

                {/* ── Order Result ─────────────────────────────────────────── */}
                <AnimatePresence>
                    {order && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="track-result"
                        >
                            {/* Product + Summary Card */}
                            <div className="track-summary-card">
                                <div className="track-product-card">
                                    {order.product?.image && (
                                        <img
                                            src={order.product.image}
                                            alt={order.product.name}
                                            className="track-product-img"
                                        />
                                    )}
                                    <div className="track-product-info">
                                        <div className="track-product-name">{order.product?.name}</div>
                                        <div className="track-product-meta">
                                            <span>Size: <strong>{order.product?.size}</strong></span>
                                            <span style={{ color: '#d1d5db' }}>·</span>
                                            <span style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>
                                                ₹{order.amount || order.product?.price}
                                            </span>
                                        </div>
                                        <div className="track-order-meta">
                                            <code className="track-orderid-badge">{order.orderId}</code>
                                            <span style={{ color: '#9ca3af', fontSize: 12 }}>
                                                Placed {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Status badges + ETA row */}
                                <div className="track-status-row">
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                                        <Pill {...payBadge} />
                                        <Pill {...delBadge} />
                                    </div>
                                    <div className="track-eta">
                                        {order.deliveryStatus === 'delivered' ? (
                                            <span style={{ color: '#166534', fontWeight: 700, fontSize: 14 }}>✅ Delivered</span>
                                        ) : order.deliveryStatus === 'cancelled' ? (
                                            <span style={{ color: '#991b1b', fontWeight: 600, fontSize: 14 }}>❌ Cancelled</span>
                                        ) : (
                                            <>
                                                <span className="track-label-sm">Estimated Delivery</span>
                                                <div style={{ fontWeight: 600, color: '#111827', fontSize: 14, marginTop: 4 }}>
                                                    {etaDate(order.createdAt)}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Copy tracking link */}
                                {order.trackLink && (
                                    <button
                                        className="track-copy-link-btn"
                                        onClick={handleCopyTrackLink}
                                        aria-label="Copy tracking link"
                                    >
                                        🔗 Copy Tracking Link
                                    </button>
                                )}
                            </div>

                            {/* Amazon/Flipkart-style progress bar */}
                            <div className="track-section">
                                <div className="track-section-title">📍 Shipment Progress</div>
                                <ProgressBar deliveryStatus={order.deliveryStatus} />
                            </div>

                            {/* Courier Details */}
                            {(order.courier?.name || order.courier?.trackingNumber) && (
                                <div className="track-courier-card">
                                    <div className="track-courier-header">🚚 Courier Details</div>
                                    <div className="track-courier-grid">
                                        {order.courier.name && (
                                            <div className="track-courier-row">
                                                <span className="track-label-sm">Carrier</span>
                                                <strong>{order.courier.name}</strong>
                                            </div>
                                        )}
                                        {order.courier.trackingNumber && (
                                            <div className="track-courier-row">
                                                <span className="track-label-sm">Tracking No.</span>
                                                <code className="track-courier-code">{order.courier.trackingNumber}</code>
                                            </div>
                                        )}
                                    </div>
                                    {order.courier.url && (
                                        <a
                                            href={order.courier.url}
                                            target="_blank" rel="noreferrer"
                                            className="track-courier-link"
                                        >
                                            Track on carrier website →
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Full Event Timeline */}
                            <div className="track-section">
                                <div className="track-section-title">🗂️ Shipment History</div>
                                <Timeline trackingEvents={order.trackingEvents} />
                            </div>

                            {/* Support */}
                            <div className="track-support">
                                <div className="track-section-title">💬 Need Help?</div>
                                <div className="track-support-links">
                                    <a
                                        href={`https://wa.me/919998887776?text=${encodeURIComponent(`Hi! I need help with my order ${order.orderId}`)}`}
                                        target="_blank" rel="noreferrer"
                                        className="track-support-btn whatsapp"
                                        aria-label="Contact us on WhatsApp"
                                    >
                                        💬 WhatsApp Support
                                    </a>
                                    <a
                                        href={`mailto:support@harlon.shop?subject=Order ${order.orderId}&body=Hi, I need help with my order.`}
                                        className="track-support-btn email"
                                        aria-label="Email us for support"
                                    >
                                        ✉️ Email Support
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default TrackOrder
