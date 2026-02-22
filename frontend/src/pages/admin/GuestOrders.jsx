import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiLayers, FiLogOut, FiShoppingBag, FiFileText, FiTrendingUp, FiMenu, FiGift, FiBriefcase, FiEye, FiX, FiSearch } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import AdminBottomNav from '../../components/AdminBottomNav'
import '../../styles/admin-responsive.css'

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

const adminApi = {
    getOrders: (params) => api.get('/guest-admin/orders', {
        params,
        headers: { 'X-Admin-Secret': ADMIN_SECRET }
    }),
    getOrderById: (orderId) => api.get(`/guest-admin/orders/${orderId}`, {
        headers: { 'X-Admin-Secret': ADMIN_SECRET }
    }),
    updateDelivery: (orderId, body) => api.patch(
        `/guest-admin/orders/${orderId}/delivery`, body,
        { headers: { 'X-Admin-Secret': ADMIN_SECRET } }
    ),
    updatePayment: (orderId, payment_status) => api.patch(
        `/guest-admin/orders/${orderId}/payment`,
        { payment_status },
        { headers: { 'X-Admin-Secret': ADMIN_SECRET } }
    ),
    whatsappNotify: (orderId) => api.post(
        `/guest-admin/orders/${orderId}/whatsapp-notify`, {},
        { headers: { 'X-Admin-Secret': ADMIN_SECRET } }
    )
}

const DELIVERY_STATUSES = ['processing', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled']

const PAYMENT_COLORS = {
    pending: '#f59e0b',
    paid: '#10b981',
    cod_pending: '#f59e0b',
    cod_confirmed: '#10b981',
    failed: '#ef4444'
}
const DELIVERY_COLORS = {
    processing: '#6366f1',
    confirmed: '#8b5cf6',
    packed: '#f59e0b',
    shipped: '#3b82f6',
    'out-for-delivery': '#f97316',
    delivered: '#10b981',
    cancelled: '#ef4444'
}

function Badge({ value, colors }) {
    const color = colors[value] || '#6b7280'
    return (
        <span style={{
            display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
            fontSize: '12px', fontWeight: 600,
            background: color + '22', color, border: `1px solid ${color}44`
        }}>
            {value?.replace(/_/g, ' ')?.replace(/-/g, ' ')}
        </span>
    )
}

function customerName(c) {
    if (!c) return '—'
    if (c.firstName) return `${c.firstName} ${c.lastName || ''}`.trim()
    return c.name || '—'
}

// ── Order Timeline (in modal) ─────────────────────────────────────────────────
function OrderTimeline({ events }) {
    if (!events || events.length === 0) return (
        <p style={{ color: '#9ca3af', fontSize: '13px' }}>No tracking events yet.</p>
    )
    const evts = [...events].reverse()
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {evts.map((evt, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '28px' }}>
                        <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: i === 0 ? '#111827' : '#e5e7eb',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', color: i === 0 ? '#fff' : '#6b7280', flexShrink: 0
                        }}>
                            {i === 0 ? '●' : '○'}
                        </div>
                        {i < evts.length - 1 && (
                            <div style={{ width: '1px', flex: 1, background: '#e5e7eb', marginTop: '4px', minHeight: '16px' }} />
                        )}
                    </div>
                    <div style={{ paddingBottom: i < evts.length - 1 ? '12px' : '0' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', textTransform: 'capitalize' }}>
                            {evt.status?.replace(/_/g, ' ')?.replace(/-/g, ' ')}
                        </div>
                        {evt.note && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{evt.note}</div>}
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                            {new Date(evt.timestamp).toLocaleString('en-IN')} · by {evt.actor}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// ── Detail Modal ─────────────────────────────────────────────────────────────
function OrderDetailModal({ order, onClose, onDeliveryUpdate, onWhatsApp, updating }) {
    const [newStatus, setNewStatus] = useState(order.deliveryStatus)
    const [note, setNote] = useState('')
    const [courierName, setCourierName] = useState(order.courier?.name || '')
    const [courierNum, setCourierNum] = useState(order.courier?.trackingNumber || '')
    const [courierUrl, setCourierUrl] = useState(order.courier?.url || '')

    if (!order) return null
    const c = order.customer || {}
    const p = order.product || {}
    const pay = order.payment || {}

    const handleUpdate = () => {
        onDeliveryUpdate(order.orderId, {
            deliveryStatus: newStatus,
            note,
            courier: { name: courierName, trackingNumber: courierNum, url: courierUrl }
        })
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '680px',
                        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '20px 24px', borderBottom: '1px solid #e5e7eb',
                        position: 'sticky', top: 0, background: '#fff', zIndex: 1
                    }}>
                        <div>
                            <h2 style={{ fontWeight: 700, fontSize: '18px', margin: 0 }}>Order Details</h2>
                            <code style={{ fontSize: '12px', color: '#6b7280' }}>{order.orderId}</code>
                        </div>
                        <button onClick={onClose} style={{
                            background: '#f3f4f6', border: 'none', borderRadius: '8px',
                            width: '36px', height: '36px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', color: '#374151'
                        }}>
                            <FiX size={18} />
                        </button>
                    </div>

                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Status Badges */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <Badge value={pay.payment_status} colors={PAYMENT_COLORS} />
                            <Badge value={order.deliveryStatus} colors={DELIVERY_COLORS} />
                            <span style={{ fontSize: '12px', color: '#9ca3af', alignSelf: 'center' }}>via {pay.method}</span>
                        </div>

                        {/* Product */}
                        <section>
                            <SectionTitle>Product</SectionTitle>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f9fafb', padding: '12px', borderRadius: '10px' }}>
                                {p.image && <img src={p.image} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />}
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{p.name || '—'}</div>
                                    <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Size: <strong>{p.size}</strong></div>
                                    <div style={{ color: '#111827', fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>₹{order.amount || p.price}</div>
                                </div>
                            </div>
                        </section>

                        {/* Customer */}
                        <section>
                            <SectionTitle>Customer</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <InfoRow label="Full Name" value={customerName(c)} />
                                {c.company && <InfoRow label="Company" value={c.company} />}
                                <InfoRow label="Email" value={c.email} />
                                <InfoRow label="Phone" value={c.phone} />
                            </div>
                        </section>

                        {/* Address */}
                        <section>
                            <SectionTitle>Delivery Address</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {c.streetAddress ? (<>
                                    <InfoRow label="Street" value={c.streetAddress} />
                                    {c.apartment && <InfoRow label="Apartment" value={c.apartment} />}
                                    <InfoRow label="City" value={c.city} />
                                    <InfoRow label="State" value={c.state} />
                                    <InfoRow label="PIN Code" value={c.pinCode} />
                                    <InfoRow label="Country" value={c.country} />
                                </>) : (
                                    <div style={{ gridColumn: '1/-1', color: '#374151' }}>{c.address || '—'}</div>
                                )}
                            </div>
                        </section>

                        {/* Payment */}
                        <section>
                            <SectionTitle>Payment</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <InfoRow label="Method" value={pay.method} />
                                <InfoRow label="Status" value={pay.payment_status?.replace(/_/g, ' ')} />
                                {pay.razorpay_order_id && <InfoRow label="Razorpay Order ID" value={pay.razorpay_order_id} mono />}
                                {pay.razorpay_payment_id && <InfoRow label="Razorpay Payment ID" value={pay.razorpay_payment_id} mono />}
                            </div>
                        </section>

                        {/* Courier */}
                        <section>
                            <SectionTitle>Courier Info</SectionTitle>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input className="form-input" placeholder="Carrier name (e.g. Delhivery, Blue Dart)"
                                    value={courierName} onChange={e => setCourierName(e.target.value)} />
                                <input className="form-input" placeholder="Tracking number"
                                    value={courierNum} onChange={e => setCourierNum(e.target.value)} />
                                <input className="form-input" placeholder="Tracking URL (https://...)"
                                    value={courierUrl} onChange={e => setCourierUrl(e.target.value)} />
                            </div>
                        </section>

                        {/* Update Status */}
                        <section>
                            <SectionTitle>Update Delivery Status</SectionTitle>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <select className="form-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                                    {DELIVERY_STATUSES.map(s => (
                                        <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>
                                    ))}
                                </select>
                                <input className="form-input" placeholder="Note (optional, visible in tracking)"
                                    value={note} onChange={e => setNote(e.target.value)} />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <motion.button
                                        className="btn btn-primary"
                                        style={{ flex: 1 }}
                                        disabled={updating}
                                        onClick={handleUpdate}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    >
                                        {updating ? 'Updating…' : '✅ Save Status'}
                                    </motion.button>
                                    <motion.button
                                        className="btn btn-secondary"
                                        style={{ flex: 1, background: '#25D366', color: '#fff', borderColor: '#25D366' }}
                                        onClick={() => onWhatsApp(order.orderId)}
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                                    >
                                        💬 WhatsApp Notify
                                    </motion.button>
                                </div>
                            </div>
                        </section>

                        {/* Order Notes */}
                        {c.orderNotes && (
                            <section>
                                <SectionTitle>Order Notes</SectionTitle>
                                <p style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', margin: 0, fontSize: '14px', color: '#92400e' }}>
                                    {c.orderNotes}
                                </p>
                            </section>
                        )}

                        {/* Tracking Timeline */}
                        <section>
                            <SectionTitle>Tracking History</SectionTitle>
                            <OrderTimeline events={order.trackingEvents} />
                        </section>

                        {/* Timestamps */}
                        <section style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                                <span>Placed: {new Date(order.createdAt).toLocaleString('en-IN')}</span>
                                {order.updatedAt !== order.createdAt && (
                                    <span>Updated: {new Date(order.updatedAt).toLocaleString('en-IN')}</span>
                                )}
                            </div>
                        </section>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

function SectionTitle({ children }) {
    return (
        <h3 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '12px', marginTop: 0 }}>
            {children}
        </h3>
    )
}

function InfoRow({ label, value, mono }) {
    return (
        <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            <div style={{ fontSize: '14px', color: '#111827', fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{value || '—'}</div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function GuestOrders() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({})
    const [filter, setFilter] = useState({ status: '', paymentStatus: '', q: '' })
    const [searchInput, setSearchInput] = useState('')
    const [updating, setUpdating] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [detailOrder, setDetailOrder] = useState(null)

    const handleLogout = () => { logout(); navigate('/admin') }

    const fetchOrders = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page }
            if (filter.status) params.status = filter.status
            if (filter.paymentStatus) params.paymentStatus = filter.paymentStatus
            if (filter.q) params.q = filter.q
            const res = await adminApi.getOrders(params)
            setOrders(res.orders)
            setPagination(res.pagination)
        } catch (err) {
            toast.error(err.message || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }, [page, filter])

    useEffect(() => { fetchOrders() }, [fetchOrders])

    const EMAIL_TRIGGER_STATUSES = ['shipped', 'out-for-delivery', 'delivered']

    const handleDeliveryUpdate = async (orderId, body) => {
        setUpdating(true)
        try {
            const res = await adminApi.updateDelivery(orderId, body)
            toast.success(`Status updated to "${body.deliveryStatus}"`)

            // Show email toast if the status triggers a customer email
            if (EMAIL_TRIGGER_STATUSES.includes(body.deliveryStatus) || res?.emailSent) {
                setTimeout(() => toast.info('📧 Email sent to customer'), 600)
            }

            // Refresh order in the modal so the new tracking event appears immediately
            try {
                const refreshed = await adminApi.getOrderById(orderId)
                if (refreshed?.order) {
                    setDetailOrder(refreshed.order)
                } else {
                    setDetailOrder(null)
                }
            } catch {
                setDetailOrder(null)
            }

            fetchOrders()
        } catch (err) {
            toast.error(err.message || 'Update failed')
        } finally {
            setUpdating(false)
        }
    }

    const handleWhatsAppNotify = async (orderId) => {
        try {
            const res = await adminApi.whatsappNotify(orderId)
            if (res.whatsappUrl) {
                window.open(res.whatsappUrl, '_blank', 'noopener,noreferrer')
                toast.success('WhatsApp opened with prefilled message')
            }
        } catch (err) {
            toast.error(err.message || 'WhatsApp notify failed')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setFilter(f => ({ ...f, q: searchInput }))
        setPage(1)
    }

    return (
        <div className="admin-layout">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Sidebar">
                <FiMenu size={24} />
            </button>

            <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">harlon</div>
                <div className="sidebar-scroll">
                    <nav className="admin-nav">
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiHome /> Dashboard</NavLink>
                        <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiPackage /> Products</NavLink>
                        <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiLayers /> Categories</NavLink>
                        <NavLink to="/admin/coupons" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiGift /> Coupons</NavLink>
                        <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiFileText /> Invoices</NavLink>
                        <NavLink to="/admin/reports" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiTrendingUp /> Reports</NavLink>
                        <NavLink to="/admin/stock" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiPackage /> Stock</NavLink>
                        <NavLink to="/admin/guest-orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiShoppingBag /> Guest Orders</NavLink>
                        <NavLink to="/admin/guest-inquiries" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}><FiBriefcase /> Inquiries</NavLink>
                        <div className="nav-divider" />
                        <Link to="/" className="admin-nav-link" target="_blank"><FiShoppingBag /> View Store</Link>
                        <button onClick={handleLogout} className="admin-nav-link logout-btn"><FiLogOut /> Logout</button>
                    </nav>
                </div>
            </aside>

            <main className="admin-content">
                <header className="dashboard-header">
                    <div>
                        <h1 className="admin-title">Guest Orders</h1>
                        <p className="admin-subtitle">Manage online guest orders</p>
                    </div>
                    <span className="date-badge">{pagination.total || 0} total</span>
                </header>

                {/* Filters + Search */}
                <div className="orders-filters" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Search */}
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', flex: '1', minWidth: '200px' }}>
                            <input
                                className="form-input"
                                placeholder="Search by Order ID, email, name…"
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-secondary" style={{ padding: '0 12px' }}>
                                <FiSearch size={16} />
                            </button>
                            {filter.q && (
                                <button type="button" className="btn btn-secondary" style={{ padding: '0 10px' }}
                                    onClick={() => { setSearchInput(''); setFilter(f => ({ ...f, q: '' })); setPage(1) }}>
                                    <FiX size={14} />
                                </button>
                            )}
                        </form>

                        <select className="form-input" style={{ width: 'auto' }} value={filter.status}
                            onChange={e => { setFilter(f => ({ ...f, status: e.target.value })); setPage(1) }}>
                            <option value="">All Delivery</option>
                            {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/-/g, ' ')}</option>)}
                        </select>

                        <select className="form-input" style={{ width: 'auto' }} value={filter.paymentStatus}
                            onChange={e => { setFilter(f => ({ ...f, paymentStatus: e.target.value })); setPage(1) }}>
                            <option value="">All Payment</option>
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="cod_pending">COD Pending</option>
                            <option value="cod_confirmed">COD Confirmed</option>
                            <option value="failed">Failed</option>
                        </select>

                        <button className="btn btn-secondary" onClick={fetchOrders} style={{ padding: '8px 16px' }}>
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <FiShoppingBag className="empty-icon" />
                        <h3>No orders found</h3>
                        <p>Guest orders will appear here once customers place them.</p>
                    </div>
                ) : (
                    <div className="orders-table-container table-responsive">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Product</th>
                                    <th>Size</th>
                                    <th>Customer</th>
                                    <th>Payment</th>
                                    <th>Delivery</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order._id}>
                                        <td>
                                            <code style={{ fontSize: '12px', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                                {order.orderId}
                                            </code>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {order.product?.image && (
                                                    <img src={order.product.image} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px' }} />
                                                )}
                                                <span style={{ fontSize: '13px' }}>{order.product?.name}</span>
                                            </div>
                                        </td>
                                        <td><strong>{order.product?.size}</strong></td>
                                        <td>
                                            <div style={{ fontSize: '13px' }}>
                                                <div><strong>{customerName(order.customer)}</strong></div>
                                                <div style={{ color: '#6b7280' }}>{order.customer?.email}</div>
                                                <div style={{ color: '#6b7280' }}>{order.customer?.phone}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <Badge value={order.payment?.payment_status} colors={PAYMENT_COLORS} />
                                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{order.payment?.method}</span>
                                            </div>
                                        </td>
                                        <td><Badge value={order.deliveryStatus} colors={DELIVERY_COLORS} /></td>
                                        <td style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <motion.button
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    onClick={() => setDetailOrder(order)}
                                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                >
                                                    <FiEye size={13} /> Manage
                                                </motion.button>
                                                <motion.button
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '12px', padding: '4px 10px', background: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' }}
                                                    onClick={() => handleWhatsAppNotify(order.orderId)}
                                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                >
                                                    💬 WA
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
                        <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                        <span style={{ lineHeight: '38px', color: '#6b7280' }}>Page {page} of {pagination.pages}</span>
                        <button className="btn btn-secondary" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                    </div>
                )}
            </main>

            <AdminBottomNav />

            {/* Detail Modal */}
            {detailOrder && (
                <OrderDetailModal
                    order={detailOrder}
                    onClose={() => setDetailOrder(null)}
                    onDeliveryUpdate={handleDeliveryUpdate}
                    onWhatsApp={handleWhatsAppNotify}
                    updating={updating}
                />
            )}
        </div>
    )
}

export default GuestOrders
