import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiLayers, FiLogOut, FiShoppingBag, FiFileText, FiSearch, FiPlus, FiEye, FiDownload, FiMenu, FiEdit2, FiTrash2, FiBriefcase, FiTrendingUp } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { ordersAPI } from '../../api/orders.api'
import Pagination from '../../components/Pagination'

function OrdersManager() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 })

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    useEffect(() => {
        fetchOrders()
    }, [search, currentPage])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await ordersAPI.getAll(search, currentPage, 20)
            setOrders(response.data || [])
            if (response.pagination) {
                setPagination(response.pagination)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus)
            toast.success('Order status updated successfully')
            fetchOrders()
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error('Failed to update order status')
        }
    }

    const handleDelete = async (orderId, invoiceNumber) => {
        if (!window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`)) {
            return
        }

        try {
            await ordersAPI.delete(orderId)
            toast.success(`Invoice ${invoiceNumber} deleted successfully`)
            fetchOrders()
        } catch (error) {
            console.error('Error deleting order:', error)
            toast.error('Failed to delete invoice. Please try again.')
        }
    }

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter)

    const getStatusClass = (status) => {
        switch (status) {
            case 'Paid': return 'status-paid'
            case 'Pending': return 'status-pending'
            case 'Cancelled': return 'status-cancelled'
            default: return ''
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
                        <NavLink to="/admin/investments" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiBriefcase /> Investments
                        </NavLink>
                        <NavLink to="/admin/reports" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiTrendingUp /> Reports
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
                        <h1 className="admin-title">Invoices</h1>
                        <p className="admin-subtitle">Manage orders and invoices</p>
                    </div>
                    <Link to="/admin/orders/new" className="btn btn-primary">
                        <FiPlus /> Create Order
                    </Link>
                </header>

                {/* Filters */}
                <div className="orders-filters">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by invoice number or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="status-filters">
                        {['all', 'Pending', 'Paid', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status === 'all' ? 'All' : status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Content */}
                <div className="orders-content">
                    {loading ? (
                        <div className="loading-state">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="empty-state">
                            <FiFileText className="empty-icon" />
                            <h3>No orders found</h3>
                            <p>Create your first order to generate an invoice</p>
                            <Link to="/admin/orders/new" className="btn btn-primary">
                                <FiPlus /> Create Order
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card List */}
                            <div className="mobile-card-list">
                                {filteredOrders.map(order => (
                                    <div key={order._id} className="mobile-card" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                                        <div className="mobile-card-content">
                                            <div className="mobile-card-title">{order.invoiceNumber}</div>
                                            <div className="mobile-card-subtitle">{order.customer?.name}</div>
                                            <div className="mobile-card-subtitle">{formatDate(order.date)}</div>
                                            <div className="mobile-card-price">{formatCurrency(order.finalTotal)}</div>
                                            <div className={`mobile-card-status ${order.status === 'Paid' ? 'visible' : 'hidden'}`} style={{
                                                background: order.status === 'Paid' ? '#d1fae5' : order.status === 'Cancelled' ? '#fee2e2' : '#fef3c7',
                                                color: order.status === 'Paid' ? '#065f46' : order.status === 'Cancelled' ? '#991b1b' : '#92400e'
                                            }}>
                                                {order.status}
                                            </div>
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
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Payment</th>
                                            <th>Status</th>
                                            <th style={{ minWidth: '140px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map(order => (
                                            <tr key={order._id}>
                                                <td className="invoice-number">{order.invoiceNumber}</td>
                                                <td>
                                                    <div className="customer-info">
                                                        <span className="customer-name">{order.customer?.name}</span>
                                                        <span className="customer-phone">{order.customer?.phone}</span>
                                                    </div>
                                                </td>
                                                <td>{formatDate(order.date)}</td>
                                                <td className="amount">{formatCurrency(order.finalTotal)}</td>
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
                                                        <Link to={`/admin/orders/${order._id}`} className="action-btn" title="View">
                                                            <FiEye />
                                                        </Link>
                                                        <Link to={`/admin/orders/${order._id}/edit`} className="action-btn" title="Edit">
                                                            <FiEdit2 />
                                                        </Link>
                                                        <a
                                                            href={ordersAPI.getPdfUrl(order._id)}
                                                            className="action-btn"
                                                            title="Download PDF"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <FiDownload />
                                                        </a>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDelete(order._id, order.invoiceNumber)
                                                            }}
                                                            className="action-btn delete-btn"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}

export default OrdersManager
