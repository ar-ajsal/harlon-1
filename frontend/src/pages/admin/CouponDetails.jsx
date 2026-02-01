import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { FiHome, FiPackage, FiLogOut, FiArrowLeft, FiCheck, FiX, FiShoppingBag, FiLayers, FiMenu, FiTrendingUp, FiFileText, FiGift, FiClock } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { couponsApi, couponSalesApi } from '../../api/coupons.api'
import AdminBottomNav from '../../components/AdminBottomNav'
import '../../styles/admin-responsive.css'

function CouponDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { logout } = useAuth()

    const [coupon, setCoupon] = useState(null)
    const [sales, setSales] = useState([])
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    useEffect(() => {
        fetchCouponDetails()
    }, [id])

    const fetchCouponDetails = async () => {
        try {
            setLoading(true)
            const response = await couponsApi.getById(id)
            // Backend returns: { success: true, data: { ...coupon, sales: [...], stats: {...} } }
            const couponData = response.data || response
            setCoupon(couponData)
            setSales(couponData.sales || [])
        } catch (error) {
            console.error('Error fetching coupon:', error)
            toast.error('Failed to load coupon details')
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmSale = async (saleId) => {
        try {
            await couponSalesApi.confirmSale(saleId)
            toast.success('Sale confirmed! Counter updated.')
            fetchCouponDetails()
        } catch (error) {
            console.error('Error confirming sale:', error)
            toast.error(error.message || 'Failed to confirm sale')
        }
    }

    const handleRejectSale = async (saleId) => {
        const notes = window.prompt('Reason for rejection (optional):')

        try {
            await couponSalesApi.rejectSale(saleId, notes)
            toast.success('Sale rejected')
            fetchCouponDetails()
        } catch (error) {
            console.error('Error rejecting sale:', error)
            toast.error(error.message || 'Failed to reject sale')
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            Pending: { bg: 'var(--warning)15', color: 'var(--warning)', icon: <FiClock /> },
            Confirmed: { bg: 'var(--success)15', color: 'var(--success)', icon: <FiCheck /> },
            Rejected: { bg: 'var(--error)15', color: 'var(--error)', icon: <FiX /> }
        }

        const style = styles[status] || styles.Pending

        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                background: style.bg,
                color: style.color
            }}>
                {style.icon}
                {status}
            </span>
        )
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Loading...</div>
    }

    if (!coupon) {
        return <div style={{ textAlign: 'center', padding: '60px' }}>Coupon not found</div>
    }

    const progress = Math.min(100, Math.round((coupon.currentSales / coupon.targetSales) * 100))
    const pendingSales = sales.filter(s => s.status === 'Pending')
    const confirmedSales = sales.filter(s => s.status === 'Confirmed')
    const totalRevenue = confirmedSales.reduce((sum, s) => sum + s.amount, 0)

    return (
        <div className="admin-layout">
            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Sidebar"
            >
                <FiMenu size={24} />
            </button>

            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">harlon</div>
                <div className="sidebar-scroll">
                    <nav className="admin-nav">
                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiHome /> Dashboard
                        </NavLink>
                        <NavLink
                            to="/admin/products"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiPackage /> Products
                        </NavLink>
                        <NavLink
                            to="/admin/categories"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiLayers /> Categories
                        </NavLink>
                        <NavLink
                            to="/admin/coupons"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiGift /> Coupons
                        </NavLink>
                        <NavLink
                            to="/admin/orders"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiFileText /> Invoices
                        </NavLink>
                        <NavLink
                            to="/admin/reports"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
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
                <div className="page-header">
                    <div>
                        <Link to="/admin/coupons" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--primary-color)',
                            textDecoration: 'none',
                            marginBottom: '12px',
                            fontSize: '14px'
                        }}>
                            <FiArrowLeft /> Back to Coupons
                        </Link>
                        <h1 className="admin-title">{coupon.code}</h1>
                        <p className="admin-subtitle">{coupon.name}</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '24px'
                }}>
                    <div className="stat-card">
                        <div className="stat-info">
                            <div className="stat-label">Progress</div>
                            <div className="stat-value">{coupon.currentSales}/{coupon.targetSales}</div>
                        </div>
                        <div style={{
                            height: '8px',
                            background: 'var(--surface-light)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginTop: '12px'
                        }}>
                            <div style={{
                                width: `${progress}%`,
                                height: '100%',
                                background: progress >= 100 ? 'var(--success)' : 'var(--primary-color)',
                                transition: 'width 0.3s ease'
                            }} />
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <div className="stat-label">Pending</div>
                            <div className="stat-value">{pendingSales.length}</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <div className="stat-label">Reward</div>
                            <div className="stat-value" style={{ fontSize: '16px' }}>{coupon.rewardDescription}</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-info">
                            <div className="stat-label">Revenue</div>
                            <div className="stat-value">₹{totalRevenue}</div>
                        </div>
                    </div>
                </div>

                {/* Sales Table */}
                <div className="content-card">
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
                        Sales History ({sales.length})
                    </h3>

                    {sales.length > 0 ? (
                        <div className="table-responsive">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Phone</th>
                                        <th>Product</th>
                                        <th>Size</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.map(sale => (
                                        <tr key={sale._id}>
                                            <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                                            <td>{sale.customerName}</td>
                                            <td>{sale.customerPhone}</td>
                                            <td>{sale.productName}</td>
                                            <td>{sale.size}</td>
                                            <td style={{ fontWeight: '600' }}>₹{sale.amount}</td>
                                            <td>{getStatusBadge(sale.status)}</td>
                                            <td>
                                                {sale.status === 'Pending' && (
                                                    <div className="actions-cell">
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => handleConfirmSale(sale._id)}
                                                            title="Confirm Sale"
                                                            style={{ background: 'var(--success)15', color: 'var(--success)' }}
                                                        >
                                                            <FiCheck />
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleRejectSale(sale._id)}
                                                            title="Reject Sale"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                )}
                                                {sale.status === 'Confirmed' && (
                                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        {new Date(sale.confirmedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {sale.status === 'Rejected' && sale.notes && (
                                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        {sale.notes}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                            No sales recorded yet for this coupon.
                        </div>
                    )}
                </div>
            </main>

            <AdminBottomNav />
        </div>
    )
}

export default CouponDetails
