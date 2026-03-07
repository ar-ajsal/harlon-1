import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiSearch, FiPlus, FiEye, FiTrash2, FiEdit2, FiDownload, FiFileText, FiX } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { ordersAPI } from '../../api/orders.api'
import Pagination from '../../components/Pagination'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

const EMPTY_STATS = {
    totalOrders: 0, totalRevenue: 0, totalDiscount: 0,
    totalCost: 0, totalProfit: 0, avgOrderValue: 0,
    paidCount: 0, pendingCount: 0, cancelledCount: 0
}

function OrdersManager() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(EMPTY_STATS)
    const [statsLoading, setStatsLoading] = useState(false)

    // Filters
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [paymentFilter, setPaymentFilter] = useState('')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 })

    const getActiveFilters = useCallback(() => ({
        search: search || undefined,
        status: statusFilter || undefined,
        paymentMethod: paymentFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: currentPage,
        limit: 20,
    }), [search, statusFilter, paymentFilter, dateFrom, dateTo, currentPage])

    useEffect(() => {
        fetchOrders()
    }, [search, statusFilter, paymentFilter, dateFrom, dateTo, currentPage])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setStatsLoading(true)
            const filters = getActiveFilters()

            const [ordersRes, statsRes] = await Promise.all([
                ordersAPI.getAll(filters),
                ordersAPI.getFilteredStats(filters)
            ])

            const data = ordersRes.data?.data || ordersRes.data || []
            setOrders(Array.isArray(data) ? data : [])
            if (ordersRes.data?.pagination) setPagination(ordersRes.data.pagination)

            setStats(statsRes.data?.data || EMPTY_STATS)
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
            setStatsLoading(false)
        }
    }

    const clearFilters = () => {
        setSearch('')
        setStatusFilter('')
        setPaymentFilter('')
        setDateFrom('')
        setDateTo('')
        setCurrentPage(1)
    }

    const hasActiveFilters = search || statusFilter || paymentFilter || dateFrom || dateTo

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus)
            toast.success('Order status updated')
            fetchOrders()
        } catch {
            toast.error('Failed to update order status')
        }
    }

    const handleDelete = async (orderId, invoiceNumber) => {
        if (!window.confirm(`Delete invoice ${invoiceNumber}? This cannot be undone.`)) return
        try {
            await ordersAPI.delete(orderId)
            toast.success(`Invoice ${invoiceNumber} deleted`)
            fetchOrders()
        } catch {
            toast.error('Failed to delete invoice')
        }
    }

    const getStatusClass = (status) => {
        if (status === 'Paid') return 'status-paid'
        if (status === 'Cancelled') return 'status-cancelled'
        return 'status-pending'
    }

    const fmt = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`
    const fmtDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

    const statCards = [
        { label: 'Revenue', value: fmt(stats.totalRevenue), color: 'var(--gold)', bg: 'hsla(38,45%,52%,0.1)' },
        { label: 'Profit', value: fmt(stats.totalProfit), color: '#22c55e', bg: 'hsla(142,76%,36%,0.1)' },
        { label: 'Cost', value: fmt(stats.totalCost), color: '#f59e0b', bg: 'hsla(38,92%,50%,0.1)' },
        { label: 'Discount', value: fmt(stats.totalDiscount), color: '#ef4444', bg: 'hsla(0,84%,60%,0.1)' },
        { label: 'Avg Order', value: fmt(stats.avgOrderValue), color: '#8b5cf6', bg: 'hsla(262,83%,58%,0.1)' },
        { label: `Orders (${stats.totalOrders})`, value: `✅${stats.paidCount} ⏳${stats.pendingCount} ❌${stats.cancelledCount}`, color: 'var(--noir-80)', bg: 'var(--noir-5)' },
    ]

    return (
        <AdminLayout
            title="Invoices"
            subtitle="Manage orders and invoices"
            headerRight={
                <Link to="/admin/orders/new" className="btn btn-primary">
                    <FiPlus /> Create Order
                </Link>
            }
        >
            {/* ── Filter Bar ───────────────────────────────────────── */}
            <div style={{
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--noir-10)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                alignItems: 'center'
            }}>
                {/* Search */}
                <div className="search-box" style={{ flex: '1 1 200px', minWidth: '180px' }}>
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Invoice # / name / phone…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                        className="search-input"
                    />
                </div>

                {/* Status */}
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                    className="form-input"
                    style={{ height: '40px', minWidth: '130px' }}
                >
                    <option value="">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                {/* Payment Method */}
                <select
                    value={paymentFilter}
                    onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1) }}
                    className="form-input"
                    style={{ height: '40px', minWidth: '140px' }}
                >
                    <option value="">All Payments</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                </select>

                {/* Date Range */}
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1) }}
                    className="form-input"
                    style={{ height: '40px' }}
                    title="From date"
                />
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1) }}
                    className="form-input"
                    style={{ height: '40px' }}
                    title="To date"
                />

                {/* Clear */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="btn btn-secondary"
                        style={{ height: '40px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Clear all filters"
                    >
                        <FiX /> Clear
                    </button>
                )}
            </div>

            {/* ── Calculation Summary Panel ────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
                marginBottom: '20px'
            }}>
                {statCards.map(card => (
                    <div key={card.label} style={{
                        background: card.bg,
                        border: `1px solid ${card.color}33`,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        opacity: statsLoading ? 0.5 : 1,
                        transition: 'opacity 0.2s'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--noir-60)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {card.label}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: card.color }}>
                            {card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Orders List ──────────────────────────────────────── */}
            <div className="orders-content">
                {loading ? (
                    <div className="loading-state">Loading orders…</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <FiFileText className="empty-icon" />
                        <h3>No orders found</h3>
                        <p>{hasActiveFilters ? 'Try adjusting your filters' : 'Create your first order to generate an invoice'}</p>
                        {!hasActiveFilters && (
                            <Link to="/admin/orders/new" className="btn btn-primary">
                                <FiPlus /> Create Order
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile Card List */}
                        <div className="mobile-card-list">
                            {orders.map(order => (
                                <div key={order._id} className="mobile-card" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                                    <div className="mobile-card-content">
                                        <div className="mobile-card-title">{order.invoiceNumber}</div>
                                        <div className="mobile-card-subtitle">{order.customer?.name}</div>
                                        <div className="mobile-card-subtitle">{fmtDate(order.date)}</div>
                                        {order.items?.length > 0 && Array.from(new Set(order.items.map(it => it.dropOn).filter(Boolean))).length > 0 && (
                                            <div style={{ marginTop: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {Array.from(new Set(order.items.map(it => it.dropOn).filter(Boolean))).map(drop => (
                                                    <span key={drop} className="dropon-badge" data-drop={drop}>{drop}</span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="mobile-card-price">{fmt(order.finalTotal)}</div>
                                        <div className="mobile-card-status" style={{
                                            background: order.status === 'Paid' ? '#d1fae5' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                                            color: order.status === 'Paid' ? '#065f46' : order.status === 'Cancelled' ? '#991b1b' : '#92400e'
                                        }}>{order.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="orders-table-container table-responsive desktop-only">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Invoice</th>
                                        <th>Customer</th>
                                        <th>Drop</th>
                                        <th>Date</th>
                                        <th>Subtotal</th>
                                        <th>Discount</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Status</th>
                                        <th style={{ minWidth: '140px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order._id}>
                                            <td className="invoice-number">{order.invoiceNumber}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <span className="customer-name">{order.customer?.name}</span>
                                                    <span className="customer-phone">{order.customer?.phone}</span>
                                                </div>
                                            </td>
                                            <td>
                                                {order.items?.length > 0 && Array.from(new Set(order.items.map(it => it.dropOn).filter(Boolean))).length > 0 ? (
                                                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                        {Array.from(new Set(order.items.map(it => it.dropOn).filter(Boolean))).map(drop => (
                                                            <span key={drop} className="dropon-badge" data-drop={drop}>{drop}</span>
                                                        ))}
                                                    </div>
                                                ) : '—'}
                                            </td>
                                            <td>{fmtDate(order.date)}</td>
                                            <td>{fmt(order.subtotal)}</td>
                                            <td style={{ color: order.discount > 0 ? '#ef4444' : 'inherit' }}>
                                                {order.discount > 0 ? `-${fmt(order.discount)}` : '—'}
                                            </td>
                                            <td className="amount" style={{ fontWeight: 700 }}>{fmt(order.finalTotal)}</td>
                                            <td>{order.paymentMethod}</td>
                                            <td>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`status-select ${getStatusClass(order.status)}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Paid</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Link to={`/admin/orders/${order._id}`} className="action-btn" title="View"><FiEye /></Link>
                                                    <Link to={`/admin/orders/${order._id}/edit`} className="action-btn" title="Edit"><FiEdit2 /></Link>
                                                    <a href={ordersAPI.getPdfUrl(order._id)} className="action-btn" title="Download PDF" target="_blank" rel="noopener noreferrer"><FiDownload /></a>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(order._id, order.invoiceNumber) }}
                                                        className="action-btn delete-btn"
                                                        title="Delete"
                                                    ><FiTrash2 /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination.pages > 1 && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </AdminLayout>
    )
}

export default OrdersManager
