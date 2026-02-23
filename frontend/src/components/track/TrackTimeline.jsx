import { motion } from 'framer-motion'

// Step definitions for the timeline
const STEPS = [
    { key: 'order_placed', label: 'Order Placed', icon: '📋' },
    { key: 'payment_confirmed', label: 'Payment Confirmed', icon: '💳' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'packed', label: 'Packed', icon: '📦' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🛵' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌' },
]

function relativeTime(date) {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
}

// Progress steps used in the horizontal stepper
const PROGRESS_STEPS = [
    { key: 'order_placed', label: 'Ordered', icon: '📋' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'out-for-delivery', label: 'On the Way', icon: '🛵' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' },
]

const DELIVERY_RANK = {
    processing: 1, confirmed: 1, packed: 1,
    shipped: 2,
    'out-for-delivery': 3,
    delivered: 4,
}

function ProgressStepper({ currentStatus }) {
    const cancelled = currentStatus === 'cancelled'
    const rank = DELIVERY_RANK[currentStatus] || 0

    if (cancelled) {
        return (
            <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                padding: '16px 20px', textAlign: 'center', color: '#991b1b',
                fontWeight: 600, fontSize: 15, marginBottom: 16
            }}>
                ❌ This order has been cancelled.
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: '0 4px' }}>
            {PROGRESS_STEPS.map((step, i) => {
                const stepRank = i + 1
                const done = rank >= stepRank
                const isLast = i === PROGRESS_STEPS.length - 1

                return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < PROGRESS_STEPS.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                            <motion.div
                                initial={false}
                                animate={{
                                    background: done ? (isLast && rank >= 4 ? '#10b981' : '#111827') : '#e5e7eb',
                                    borderColor: done ? (isLast && rank >= 4 ? '#10b981' : '#111827') : '#d1d5db',
                                }}
                                transition={{ duration: 0.35 }}
                                style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    border: '2px solid', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: done ? 16 : 14,
                                    color: done ? '#fff' : '#9ca3af', fontWeight: 700, marginBottom: 6
                                }}
                            >
                                {done ? '✓' : step.icon}
                            </motion.div>
                            <span style={{ fontSize: 11, fontWeight: done ? 600 : 400, color: done ? '#111827' : '#9ca3af', textAlign: 'center' }}>
                                {step.label}
                            </span>
                        </div>
                        {i < PROGRESS_STEPS.length - 1 && (
                            <div style={{
                                flex: 1, height: 2, margin: '0 4px', marginBottom: 22,
                                background: rank > stepRank ? '#111827' : '#e5e7eb',
                                transition: 'background 0.35s'
                            }} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function EventsList({ events }) {
    if (!events || events.length === 0) {
        return (
            <p style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
                No tracking events recorded yet.
            </p>
        )
    }

    const evts = [...events].reverse()

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {evts.map((evt, i) => {
                const step = STEPS.find(s => s.key === evt.status) || {
                    icon: '📌',
                    label: (evt.status || '').replace(/_/g, ' ').replace(/-/g, ' ')
                }
                const isLatest = i === 0

                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.3 }}
                        style={{ display: 'flex', gap: 14, position: 'relative' }}
                    >
                        {/* Left: dot + line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                background: isLatest ? '#111827' : '#f3f4f6',
                                border: `2px solid ${isLatest ? '#111827' : '#e5e7eb'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                                zIndex: 1
                            }}>
                                <span>{step.icon}</span>
                            </div>
                            {i < evts.length - 1 && (
                                <div style={{ width: 2, flex: 1, background: '#e5e7eb', minHeight: 24, marginTop: 2 }} />
                            )}
                        </div>

                        {/* Right: content */}
                        <div style={{ paddingBottom: i < evts.length - 1 ? 20 : 0, paddingTop: 6, flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: isLatest ? '#111827' : '#374151', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                {step.label}
                                {isLatest && (
                                    <span style={{
                                        fontSize: 10, background: '#111827', color: '#fff',
                                        padding: '2px 7px', borderRadius: 999, fontWeight: 600
                                    }}>
                                        LATEST
                                    </span>
                                )}
                            </div>
                            {evt.note && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{evt.note}</div>}
                            {evt.location && <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>📍 {evt.location}</div>}
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                                {relativeTime(evt.timestamp)}
                                <span style={{ margin: '0 5px', opacity: 0.5 }}>·</span>
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

function TrackTimeline({ events = [], currentStatus = 'processing', eta, courier }) {
    return (
        <div className="track-timeline">
            {/* Horizontal progress stepper */}
            <ProgressStepper currentStatus={currentStatus} />

            {/* ETA */}
            {eta && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <div style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
                    padding: '10px 16px', marginBottom: 20, fontSize: 13
                }}>
                    <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Estimated delivery:</span>
                    <span style={{ color: '#1d4ed8', marginLeft: 6 }}>{eta}</span>
                </div>
            )}

            {/* Courier info */}
            {courier?.name && (
                <div style={{
                    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10,
                    padding: '10px 16px', marginBottom: 20, fontSize: 13
                }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>Courier: </span>
                    <span style={{ color: '#6b7280' }}>{courier.name}</span>
                    {courier.trackingNumber && (
                        <>
                            <span style={{ margin: '0 6px', opacity: 0.5 }}>·</span>
                            <span style={{ fontWeight: 600, color: '#374151' }}>Tracking#: </span>
                            {courier.url ? (
                                <a href={courier.url} target="_blank" rel="noreferrer"
                                    style={{ color: '#2563eb', fontWeight: 600 }}>
                                    {courier.trackingNumber}
                                </a>
                            ) : (
                                <span style={{ color: '#6b7280' }}>{courier.trackingNumber}</span>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Event list */}
            <EventsList events={events} />
        </div>
    )
}

export default TrackTimeline
