import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiLayers, FiLogOut, FiShoppingBag, FiFileText, FiTrendingUp, FiDollarSign, FiActivity, FiMenu, FiBriefcase } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { ordersAPI } from '../../api/orders.api'

function Reports() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState(null)

    const today = new Date()
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(today.getFullYear())
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    useEffect(() => {
        fetchReport()
    }, [selectedMonth, selectedYear])

    const fetchReport = async () => {
        try {
            setLoading(true)
            const response = await ordersAPI.getMonthlyReport(selectedYear, selectedMonth)
            setReportData(response.data)
        } catch (error) {
            console.error('Error fetching report:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`
    }

    const { summary, daily } = reportData || {}

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
                        <h1 className="admin-title">Monthly Report</h1>
                        <p className="admin-subtitle">Sales and profit analysis</p>
                    </div>

                    {/* Date Selector */}
                    <div className="report-controls">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="form-select"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="form-select"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                        </select>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-state">Loading report...</div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper" style={{ color: 'var(--gold)', background: 'hsla(38, 45%, 52%, 0.1)' }}>
                                    <FiDollarSign />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">{formatCurrency(summary?.totalRevenue)}</div>
                                    <div className="stat-label">Total Revenue</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon-wrapper" style={{ color: 'var(--success)', background: 'hsla(142, 76%, 36%, 0.1)' }}>
                                    <FiTrendingUp />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">{formatCurrency(summary?.totalProfit)}</div>
                                    <div className="stat-label">Total Profit</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon-wrapper" style={{ color: 'var(--noir-60)', background: 'var(--noir-10)' }}>
                                    <FiActivity />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">{formatCurrency(summary?.totalCost)}</div>
                                    <div className="stat-label">Total Cost</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon-wrapper" style={{ color: 'var(--noir-100)', background: 'var(--noir-10)' }}>
                                    <FiFileText />
                                </div>
                                <div className="stat-info">
                                    <div className="stat-value">{summary?.totalOrders}</div>
                                    <div className="stat-label">Total Orders</div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="dashboard-grid-2" style={{ marginTop: '2rem' }}>
                            <div className="dashboard-card">
                                <h3>Order Status</h3>
                                <div className="quick-stats-row">
                                    <div className="quick-stat">
                                        <span className="label">Paid Orders</span>
                                        <span className="value success">{summary?.paidCount}</span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="label">Pending</span>
                                        <span className="value warning">{summary?.pendingCount}</span>
                                    </div>
                                    <div className="quick-stat">
                                        <span className="label">Cancelled</span>
                                        <span className="value error">{summary?.cancelledCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Daily Sales Table */}
                        <div className="orders-table-container" style={{ marginTop: '2rem', overflowX: 'auto' }}>
                            <div className="table-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--noir-10)' }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Daily Sales Breakdown</h3>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Orders Count</th>
                                        <th style={{ textAlign: 'right' }}>Sales Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {daily && daily.length > 0 ? (
                                        daily.map((day) => (
                                            <tr key={day._id}>
                                                <td>{new Date(day._id).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                                <td>{day.orders}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(day.sales)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No sales data for this month</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    )
}

export default Reports
