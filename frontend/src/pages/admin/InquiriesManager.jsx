import { useState, useEffect, useCallback } from 'react'
import { FiBriefcase } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import api from '../../api/axios'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || ''

const adminApi = {
    getInquiries: (params) => api.get('/guest-admin/inquiries', {
        params,
        headers: { 'X-Admin-Secret': ADMIN_SECRET }
    }),
    updateStatus: (id, status) => api.patch(
        `/guest-admin/inquiries/${id}/status`,
        { status },
        { headers: { 'X-Admin-Secret': ADMIN_SECRET } }
    )
}

const STATUS_COLORS = { new: '#6366f1', contacted: '#f59e0b', closed: '#10b981' }
const STATUS_NEXT = { new: 'contacted', contacted: 'closed' }

function InquiriesManager() {
    const [inquiries, setInquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({})
    const [filter, setFilter] = useState('')
    const [updating, setUpdating] = useState(null)
    const [expanded, setExpanded] = useState(null)


    const fetchInquiries = useCallback(async () => {
        setLoading(true)
        try {
            const params = { page }
            if (filter) params.status = filter
            const res = await adminApi.getInquiries(params)
            setInquiries(res.inquiries)
            setPagination(res.pagination)
        } catch (err) {
            toast.error(err.message || 'Failed to load inquiries')
        } finally {
            setLoading(false)
        }
    }, [page, filter])

    useEffect(() => { fetchInquiries() }, [fetchInquiries])

    const handleStatusUpdate = async (id, status) => {
        setUpdating(id)
        try {
            await adminApi.updateStatus(id, status)
            toast.success(`Status updated to "${status}"`)
            fetchInquiries()
        } catch (err) {
            toast.error(err.message || 'Update failed')
        } finally {
            setUpdating(null)
        }
    }

    const headerRight = (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="date-badge">{pagination.total || 0} total</span>
            <select
                className="form-input" style={{ width: 'auto', height: '40px' }}
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1) }}
            >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="closed">Closed</option>
            </select>
            <button className="btn btn-secondary" onClick={fetchInquiries}>
                🔄 Refresh
            </button>
        </div>
    )

    return (
        <AdminLayout
            title="Product Inquiries"
            subtitle="Manage customer inquiries"
            headerRight={headerRight}
        >

            {loading ? (
                <div className="loading-state">Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
                <div className="empty-state">
                    <FiBriefcase className="empty-icon" />
                    <h3>No inquiries found</h3>
                    <p>Inquiries will appear here once customers submit them.</p>
                </div>
            ) : (
                <>
                    {/* Mobile Card List */}
                    <div className="mobile-card-list">
                        {inquiries.map(inq => (
                            <div key={inq._id} className="mobile-card" style={{ flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="mobile-card-title">{inq.productName}</div>
                                        <div className="mobile-card-subtitle" style={{ fontWeight: 600 }}>{inq.customer?.name}</div>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                                            <a href={`tel:${inq.customer?.phone}`} style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
                                                📞 {inq.customer?.phone}
                                            </a>
                                            {inq.customer?.email && (
                                                <span style={{ fontSize: 12, color: '#9ca3af' }}>{inq.customer.email}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span style={{
                                        display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                        fontSize: '11px', fontWeight: 600, flexShrink: 0,
                                        background: (STATUS_COLORS[inq.status] || '#6b7280') + '22',
                                        color: STATUS_COLORS[inq.status] || '#6b7280',
                                        border: `1px solid ${(STATUS_COLORS[inq.status] || '#6b7280')}44`
                                    }}>
                                        {inq.status}
                                    </span>
                                </div>

                                {/* Message */}
                                <div
                                    style={{
                                        fontSize: 13, color: '#374151', lineHeight: 1.5,
                                        background: '#f9fafb', borderRadius: 8, padding: '10px 12px',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        maxHeight: expanded === inq._id ? 'none' : '60px',
                                        WebkitLineClamp: expanded === inq._id ? 'none' : 3,
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                    onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}
                                >
                                    {inq.message}
                                </div>
                                {inq.message?.length > 80 && (
                                    <button
                                        style={{ fontSize: '11px', color: '#6366f1', border: 'none', background: 'none', cursor: 'pointer', padding: 0, alignSelf: 'flex-start' }}
                                        onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}
                                    >
                                        {expanded === inq._id ? 'Show less ▲' : 'Show more ▼'}
                                    </button>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                        {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                                    </span>
                                    {STATUS_NEXT[inq.status] && (
                                        <motion.button
                                            className="btn btn-secondary btn-sm"
                                            disabled={updating === inq._id}
                                            onClick={() => handleStatusUpdate(inq._id, STATUS_NEXT[inq.status])}
                                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                        >
                                            → Mark as {STATUS_NEXT[inq.status]}
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table */}
                    <div className="orders-table-container table-responsive">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inquiries.map(inq => (
                                    <tr key={inq._id}>
                                        <td style={{ fontWeight: 600, fontSize: '13px' }}>{inq.productName}</td>
                                        <td>{inq.customer?.name}</td>
                                        <td>
                                            <a href={`tel:${inq.customer?.phone}`} style={{ color: '#6366f1' }}>
                                                {inq.customer?.phone}
                                            </a>
                                        </td>
                                        <td style={{ fontSize: '13px', color: '#6b7280' }}>{inq.customer?.email || '—'}</td>
                                        <td style={{ maxWidth: '220px' }}>
                                            <div
                                                style={{
                                                    cursor: 'pointer', fontSize: '13px',
                                                    overflow: 'hidden',
                                                    maxHeight: expanded === inq._id ? 'none' : '44px',
                                                    WebkitLineClamp: expanded === inq._id ? 'none' : 2,
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                                onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}
                                            >
                                                {inq.message}
                                            </div>
                                            {inq.message?.length > 80 && (
                                                <button
                                                    style={{ fontSize: '11px', color: '#6366f1', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                                                    onClick={() => setExpanded(expanded === inq._id ? null : inq._id)}
                                                >
                                                    {expanded === inq._id ? 'Show less' : 'Show more'}
                                                </button>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '3px 10px', borderRadius: '999px',
                                                fontSize: '12px', fontWeight: 600,
                                                background: (STATUS_COLORS[inq.status] || '#6b7280') + '22',
                                                color: STATUS_COLORS[inq.status] || '#6b7280',
                                                border: `1px solid ${(STATUS_COLORS[inq.status] || '#6b7280')}44`
                                            }}>
                                                {inq.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {new Date(inq.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td>
                                            {STATUS_NEXT[inq.status] && (
                                                <motion.button
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: '12px', padding: '4px 10px' }}
                                                    disabled={updating === inq._id}
                                                    onClick={() => handleStatusUpdate(inq._id, STATUS_NEXT[inq.status])}
                                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                >
                                                    → {STATUS_NEXT[inq.status]}
                                                </motion.button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {pagination.pages > 1 && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span style={{ lineHeight: '38px', color: '#6b7280' }}>Page {page} of {pagination.pages}</span>
                    <button className="btn btn-secondary" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}
        </AdminLayout>
    )
}

export default InquiriesManager
