import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { FiHome, FiPackage, FiLayers, FiLogOut, FiShoppingBag, FiFileText, FiArrowLeft, FiDownload, FiShare2, FiMenu, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { ordersAPI } from '../../api/orders.api'
import AdminBottomNav from '../../components/AdminBottomNav'

function OrderDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            setLoading(true)
            const response = await ordersAPI.getById(id)
            setOrder(response.data)
        } catch (err) {
            setError('Failed to load order')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus) => {
        try {
            await ordersAPI.updateStatus(id, newStatus)
            toast.success('Order status updated successfully')
            fetchOrder()
        } catch (err) {
            console.error('Failed to update status:', err)
            toast.error('Failed to update order status')
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`
    }

    const shareOnWhatsApp = () => {
        if (!order) return

        const itemsList = order.items.map(item =>
            `• ${item.name} x${item.quantity} - ${formatCurrency(item.total)}`
        ).join('\n')

        const message = `
📄 *Invoice: ${order.invoiceNumber}*
📅 Date: ${formatDate(order.date)}

*Bill To:*
${order.customer.name}
📞 ${order.customer.phone}

*Items:*
${itemsList}

━━━━━━━━━━━━━━
Subtotal: ${formatCurrency(order.subtotal)}
${order.discount > 0 ? `Discount: -${formatCurrency(order.discount)}\n` : ''}*Total: ${formatCurrency(order.finalTotal)}*
━━━━━━━━━━━━━━

💳 Payment: ${order.paymentMethod}
${order.notes ? `📝 Notes: ${order.notes}` : ''}

Thank you for your order! 🙏
        `.trim()

        // Open WhatsApp with pre-filled message
        const phoneNumber = order.customer.phone.replace(/\D/g, '')
        const whatsappUrl = `https://wa.me/${phoneNumber.startsWith('91') ? phoneNumber : '91' + phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'Paid': return 'status-paid'
            case 'Pending': return 'status-pending'
            case 'Cancelled': return 'status-cancelled'
            default: return ''
        }
    }

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete invoice ${order.invoiceNumber}? This action cannot be undone.`)) {
            return
        }

        try {
            await ordersAPI.delete(id)
            toast.success('Invoice deleted successfully')
            navigate('/admin/orders')
        } catch (err) {
            console.error('Failed to delete order:', err)
            toast.error('Failed to delete invoice. Please try again.')
        }
    }

    if (loading) {
        return (
            <div className="admin-layout">
                <div className="loading-state">Loading order...</div>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="admin-layout">
                <div className="error-state">{error || 'Order not found'}</div>
            </div>
        )
    }

    return (
        <div className="admin-layout">
            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Sidebar"
            >
                <FiMenu size={24} />
            </button>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">harlon</div>
                <div className="sidebar-scroll">
                    <nav className="admin-nav">
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiHome /> Dashboard
                        </NavLink>
                        <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiPackage /> Products
                        </NavLink>
                        <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiLayers /> Categories
                        </NavLink>
                        <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiFileText /> Invoices
                        </NavLink>

                        <div className="nav-divider" />

                        <Link to="/" className="admin-nav-link" target="_blank">
                            <FiShoppingBag /> View Store
                        </Link>
                        <button onClick={handleLogout} className="admin-nav-link logout-btn">
                            <FiLogOut /> Logout
                        </button>
                    </nav>
                </div>
            </aside>

            <main className="admin-content">
                <header className="dashboard-header">
                    <div>
                        <Link to="/admin/orders" className="back-link">
                            <FiArrowLeft /> Back to Orders
                        </Link>
                        <h1 className="admin-title">Invoice {order.invoiceNumber}</h1>
                        <p className="admin-subtitle">Created on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="header-actions">
                        <Link
                            to={`/admin/orders/${id}/edit`}
                            className="btn btn-secondary"
                        >
                            <FiEdit2 /> Edit Invoice
                        </Link>
                        <a
                            href={ordersAPI.getPdfUrl(id)}
                            className="btn btn-secondary"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FiDownload /> Download PDF
                        </a>
                        <button onClick={shareOnWhatsApp} className="btn btn-whatsapp">
                            <FaWhatsapp /> Share on WhatsApp
                        </button>
                        <button onClick={handleDelete} className="btn btn-danger">
                            <FiTrash2 /> Delete
                        </button>
                    </div>
                </header>

                {/* Invoice Preview */}
                <div className="invoice-preview">
                    <div className="invoice-header">
                        <div className="invoice-business">
                            <h2>JSC</h2>
                            <p>Your Business Address</p>
                            <p>Phone: +91 XXXXXXXXXX</p>
                        </div>
                        <div className="invoice-meta">
                            <h3>INVOICE</h3>
                            <p><strong>Invoice No:</strong> {order.invoiceNumber}</p>
                            <p><strong>Date:</strong> {formatDate(order.date)}</p>
                            <p>
                                <strong>Status:</strong>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className={`status-select-inline ${getStatusClass(order.status)}`}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </p>
                        </div>
                    </div>

                    <div className="invoice-customer">
                        <h4>Bill To:</h4>
                        <p className="customer-name">{order.customer.name}</p>
                        <p>Phone: {order.customer.phone}</p>
                        {order.customer.address && <p>{order.customer.address}</p>}
                    </div>

                    <table className="invoice-items-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Item</th>
                                <th>Drop</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        {item.dropOn ? (
                                            <span className="dropon-badge" data-drop={item.dropOn}>{item.dropOn}</span>
                                        ) : '—'}
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.price)}</td>
                                    <td>{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="invoice-totals">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="total-row discount">
                                <span>Discount</span>
                                <span>-{formatCurrency(order.discount)}</span>
                            </div>
                        )}
                        <div className="total-row final">
                            <span>Total</span>
                            <span>{formatCurrency(order.finalTotal)}</span>
                        </div>
                    </div>

                    <div className="invoice-footer">
                        <div className="payment-info">
                            <strong>Payment Method:</strong> {order.paymentMethod}
                        </div>
                        {order.notes && (
                            <div className="notes-info">
                                <strong>Notes:</strong> {order.notes}
                            </div>
                        )}
                        <p className="thank-you">Thank you for your business!</p>
                    </div>
                </div>
            </main>

            <AdminBottomNav />
        </div>
    )
}

export default OrderDetail
