import { motion } from 'framer-motion'

const DELIVERY_BADGE = {
    processing: { label: 'Processing', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
    confirmed: { label: 'Confirmed', bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
    packed: { label: 'Packed', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    shipped: { label: 'Shipped', bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
    'out-for-delivery': { label: 'Out for Delivery', bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    delivered: { label: 'Delivered ✓', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    cancelled: { label: 'Cancelled', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

const PAY_BADGE = {
    pending: { label: 'Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    paid: { label: 'Paid ✓', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    cod_pending: { label: 'COD Pending', bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
    cod_confirmed: { label: 'COD Confirmed', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    failed: { label: 'Failed', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
}

function StatusPill({ badge }) {
    if (!badge) return null
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
            borderRadius: 999, fontSize: 13, fontWeight: 600,
            background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
        }}>
            {badge.label}
        </span>
    )
}

/**
 * TrackHero / HeroCard — shows product image + order summary header
 */
function HeroCard({ orderSummary }) {
    if (!orderSummary) return null

    const {
        orderId,
        product,
        amount,
        paymentStatus,
        deliveryStatus,
        createdAt,
    } = orderSummary

    const delBadge = DELIVERY_BADGE[deliveryStatus] || { label: deliveryStatus, bg: '#f9fafb', color: '#374151', border: '#d1d5db' }
    const payBadge = PAY_BADGE[paymentStatus] || { label: paymentStatus, bg: '#f9fafb', color: '#374151', border: '#d1d5db' }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16,
                overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
            }}
        >
            {/* Product image banner */}
            {product?.image && (
                <div style={{ width: '100%', height: 180, overflow: 'hidden', background: '#f3f4f6' }}>
                    <img
                        src={product.image}
                        alt={product.name || 'Product'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none' }}
                    />
                </div>
            )}

            <div style={{ padding: '20px 20px 16px' }}>
                {/* Order ID row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                    <div>
                        <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 2 }}>Order ID</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: '#111827', letterSpacing: '0.03em' }}>{orderId}</p>
                    </div>
                    {createdAt && (
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 2 }}>Placed on</p>
                            <p style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>
                                {new Date(createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Product info */}
                {product && (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, padding: '10px 12px', background: '#f9fafb', borderRadius: 10 }}>
                        {product.image && (
                            <img src={product.image} alt={product.name || 'Product'}
                                style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                                onError={e => { e.target.style.display = 'none' }}
                            />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {product.name}
                            </p>
                            <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                                {product.size && <span style={{ fontSize: 12, color: '#6b7280' }}>Size: <strong>{product.size}</strong></span>}
                                {amount > 0 && <span style={{ fontSize: 12, color: '#6b7280' }}>₹{amount}</span>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Status badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <StatusPill badge={delBadge} />
                    <StatusPill badge={payBadge} />
                </div>
            </div>
        </motion.div>
    )
}

export default HeroCard
