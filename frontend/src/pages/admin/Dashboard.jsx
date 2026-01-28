import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiGrid, FiLogOut, FiShoppingBag, FiLayers, FiTrendingUp, FiDollarSign, FiFileText, FiPlus, FiClipboard, FiMenu, FiFilter } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import { ordersAPI } from '../../api/orders.api'
import AdminBottomNav from '../../components/AdminBottomNav'
import '../../styles/admin-responsive.css'

function Dashboard() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { products, categories } = useProducts()

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    const [dashboardStats, setDashboardStats] = useState({
        todayRevenue: 0,
        monthRevenue: 0,
        pendingOrders: 0,
        monthProfit: 0
    })
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [graphData, setGraphData] = useState([])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats
                const res = await ordersAPI.getTodayStats()
                setDashboardStats(res.data)

                // Fetch Graph Data
                const date = new Date()
                const currentYear = date.getFullYear()
                const currentMonth = date.getMonth() + 1
                const reportRes = await ordersAPI.getMonthlyReport(currentYear, currentMonth)

                if (reportRes.data.success) {
                    const dailyData = reportRes.data.data.daily.map(day => ({
                        date: day._id.split('-').pop(), // Just show day number
                        sales: day.sales
                    }))
                    setGraphData(dailyData)
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err)
            }
        }
        fetchStats()
    }, [])

    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`

    const stats = [
        {
            icon: <FiDollarSign />,
            value: formatCurrency(dashboardStats.todayRevenue),
            label: "Today's Sales",
            color: 'var(--gold)'
        },
        {
            icon: <FiTrendingUp />,
            value: formatCurrency(dashboardStats.monthRevenue),
            label: "Month Sales",
            color: 'var(--success)'
        },
        {
            icon: <FiPackage />,
            value: dashboardStats.pendingOrders,
            label: 'Pending Orders',
            color: 'var(--warning)'
        },
        {
            icon: <FiDollarSign />,
            value: formatCurrency(dashboardStats.monthProfit),
            label: 'Month Profit',
            color: 'var(--noir-100)'
        }
    ]

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
                <header className="dashboard-header">
                    <div>
                        <h1 className="admin-title">Overview</h1>
                        <p className="admin-subtitle">Welcome back, Admin</p>
                    </div>
                    <div className="date-badge">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon-wrapper" style={{ color: stat.color, background: `${stat.color}15` }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sales Graph */}
                <div className="content-card" style={{ marginBottom: '24px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: 'var(--noir-100)' }}>Sales Overview (This Month)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(val) => [`₹${val}`, 'Sales']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dashboard-grid-2">
                    {/* Quick Actions */}
                    <div className="dashboard-card">
                        <h3>Quick Actions</h3>
                        <div className="quick-actions">
                            <Link to="/admin/orders/new" className="action-tile">
                                <span className="icon"><FiPlus /></span>
                                <span>Create Order</span>
                            </Link>
                            <Link to="/admin/orders" className="action-tile">
                                <span className="icon"><FiClipboard /></span>
                                <span>View Invoices</span>
                            </Link>
                            <Link to="/admin/products" className="action-tile">
                                <span className="icon"><FiPackage /></span>
                                <span>Add Product</span>
                            </Link>
                            <Link to="/admin/categories" className="action-tile">
                                <span className="icon"><FiLayers /></span>
                                <span>Categories</span>
                            </Link>
                        </div>
                    </div>

                    {/* Recent Products */}
                    <div className="dashboard-card">
                        <div className="card-header-flex">
                            <h3>Recent Products</h3>
                            <Link to="/admin/products" className="view-all">View All</Link>
                        </div>
                        <div className="recent-list">
                            {products.slice(0, 4).map(product => (
                                <div key={product._id} className="recent-item">
                                    <img
                                        src={product.images?.[0] || '/images/placeholder.jpg'}
                                        alt={product.name}
                                    />
                                    <div className="recent-info">
                                        <h4>{product.name}</h4>
                                        <span>{product.category}</span>
                                    </div>
                                    <span className="recent-price">₹{product.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <AdminBottomNav />
        </div>
    )
}

export default Dashboard
