import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FaWhatsapp, FaCopy, FaBoxOpen } from 'react-icons/fa'
import { FiExternalLink } from 'react-icons/fi'

/* ── CSS confetti pieces (pure CSS, no canvas) ── */
const CONFETTI_COLORS = [
    'hsl(38,80%,60%)',  // gold
    'hsl(145,60%,55%)', // green
    'hsl(220,80%,65%)', // blue
    'hsl(0,70%,65%)',   // red
    '#fff',
]

function Confetti() {
    const prefersReduced = useReducedMotion()
    if (prefersReduced) return null

    const pieces = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: `${(i * 2.8 + Math.random() * 4)}%`,
        delay: `${(Math.random() * 1.2).toFixed(2)}s`,
        duration: `${(1.4 + Math.random() * 1.4).toFixed(2)}s`,
        size: `${6 + Math.floor(Math.random() * 7)}px`,
        rotate: `${Math.floor(Math.random() * 360)}deg`,
    }))

    return (
        <div className="co-confetti" aria-hidden>
            {pieces.map(p => (
                <div
                    key={p.id}
                    className="co-confetti-piece"
                    style={{
                        left: p.left,
                        top: '-10px',
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        transform: `rotate(${p.rotate})`,
                        animationName: 'co-fall',
                        animationDuration: p.duration,
                        animationDelay: p.delay,
                        animationFillMode: 'forwards',
                        animationTimingFunction: 'linear',
                    }}
                />
            ))}
        </div>
    )
}

function OrderSuccess({ order, trackLink, onCopyLink, whatsappNumber }) {
    const prefersReduced = useReducedMotion()

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    const isWhatsapp = order?.isWhatsapp

    const container = prefersReduced
        ? {}
        : {
            hidden: {},
            show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } }
        }
    const item = prefersReduced
        ? {}
        : {
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 24 } }
        }

    const waShareText = encodeURIComponent(
        `🎉 I just ordered from Harlon!\n📦 Order: ${order?.orderId || ''}\n🔗 Track: ${trackLink}`
    )

    return (
        <div className="co-success">
            <Confetti />
            <motion.div
                className="co-success-inner"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* ── Icon ── */}
                <motion.span
                    className="co-success-icon"
                    variants={prefersReduced ? {} : {
                        hidden: { scale: 0, rotate: -30 },
                        show: { scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 400, damping: 18 } }
                    }}
                >
                    🎉
                </motion.span>

                {/* ── Headline ── */}
                <motion.h1 className="co-success-title" variants={item}>
                    Order <span>Placed!</span>
                </motion.h1>

                <motion.p className="co-success-sub" variants={item}>
                    {isWhatsapp
                        ? 'Our team will WhatsApp you to confirm availability and arrange payment.'
                        : `Thanks for your order${order?.productName ? ` for ${order.productName}` : ''}! We'll pack & ship it within 24 hours.`
                    }
                </motion.p>

                {/* ── Order info card ── */}
                {order?.orderId && (
                    <motion.div className="co-success-order" variants={item}>
                        <div className="co-success-order-row">
                            <span>Order ID</span>
                            <span className="co-success-order-id">#{order.orderId.slice(-8).toUpperCase()}</span>
                        </div>
                        {trackLink && (
                            <div className="co-success-order-row">
                                <span>Tracking link</span>
                                <button className="co-success-copy" onClick={onCopyLink}>
                                    <FaCopy style={{ marginRight: 3 }} /> Copy
                                </button>
                            </div>
                        )}
                        <div className="co-success-order-row">
                            <span>ETA</span>
                            <span style={{ fontWeight: 600, color: '#0A0A0A' }}>4–12 business days</span>
                        </div>
                    </motion.div>
                )}

                {/* ── Action buttons ── */}
                <motion.div className="co-success-btns" variants={item}>
                    {trackLink && (
                        <a
                            className="co-success-track"
                            href={trackLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FiExternalLink /> Track Your Order
                        </a>
                    )}

                    {whatsappNumber && (
                        <a
                            className="co-success-wa"
                            href={`https://wa.me/${whatsappNumber}?text=${waShareText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaWhatsapp style={{ fontSize: 18 }} />
                            Share on WhatsApp
                        </a>
                    )}

                    <a className="co-success-shop" href="/shop">
                        <FaBoxOpen style={{ marginRight: 6 }} />
                        Continue Shopping
                    </a>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default OrderSuccess
