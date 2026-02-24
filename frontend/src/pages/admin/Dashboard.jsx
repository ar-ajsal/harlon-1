import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiDollarSign, FiTrendingUp, FiPackage, FiPlus, FiClipboard, FiShoppingBag } from 'react-icons/fi'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useProducts } from '../../context/ProductContext'
import { ordersAPI } from '../../api/orders.api'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

function Dashboard() {
    const { products } = useProducts()
    const [dashboardStats, setDashboardStats] = useState({
        todayRevenue: 0, monthRevenue: 0, pendingOrders: 0, monthProfit: 0
    })
    const [graphData, setGraphData] = useState([])

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await ordersAPI.getTodayStats()
                setDashboardStats(res.data)

                const date = new Date()
                const currentYear = date.getFullYear()
                const currentMonth = date.getMonth() + 1
                const reportRes = await ordersAPI.getMonthlyReport(currentYear, currentMonth)

                if (reportRes.data.success) {
                    const dailyData = reportRes.data.data.daily || []
                    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()
                    const fullMonthData = []

                    for (let i = 1; i <= daysInMonth; i++) {
                        const found = dailyData.find(d => d._id === i)
                        fullMonthData.push({ date: i, sales: found ? found.sales : 0 })
                    }
                    setGraphData(fullMonthData)
                }
            } catch (err) {
                console.error('Error fetching dashboard stats:', err)
            }
        }
        fetchStats()
    }, [])

    const totalProductCost = products.reduce((sum, p) => sum + (p.costPrice || 0), 0)
    const fmt = (val) => `₹${(val || 0).toLocaleString('en-IN')}`
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

    const stats = [
        { icon: <FiDollarSign />, value: fmt(dashboardStats.todayRevenue), label: "Today's Sales", color: 'var(--gold)' },
        { icon: <FiTrendingUp />, value: fmt(dashboardStats.monthRevenue), label: 'Month Sales', color: '#10b981' },
        { icon: <FiPackage />, value: dashboardStats.pendingOrders, label: 'Pending Orders', color: '#f59e0b' },
        { icon: <FiDollarSign />, value: fmt(dashboardStats.monthProfit), label: 'Month Profit', color: '#6366f1' },
        { icon: <FiPackage />, value: fmt(totalProductCost), label: 'Inventory Cost', color: '#f97316' },
    ]

    return (
        <AdminLayout
            title="Overview"
            subtitle={`Welcome back, Admin · ${today}`}
        >
            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-icon-wrapper" style={{ color: stat.color, background: `${stat.color}18` }}>
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
            <div className="content-card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#0f0f11' }}>
                    Sales Overview — This Month
                </h3>
                <div className="chart-container">
                    {graphData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4A843" stopOpacity={0.9} />
                                        <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                                    formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Sales']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#D4A843" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '32px' }}>📊</span>
                            <span style={{ fontSize: '14px' }}>No sales data this month</span>
                        </div>
                    )}
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
                            <span>Invoices</span>
                        </Link>
                        <Link to="/admin/products" className="action-tile">
                            <span className="icon"><FiPackage /></span>
                            <span>Add Product</span>
                        </Link>
                        <Link to="/admin/stock" className="action-tile">
                            <span className="icon">📦</span>
                            <span>Stock</span>
                        </Link>
                        <Link to="/admin/guest-orders" className="action-tile">
                            <span className="icon"><FiShoppingBag /></span>
                            <span>Guest Orders</span>
                        </Link>
                        <Link to="/admin/guest-inquiries" className="action-tile">
                            <span className="icon">💬</span>
                            <span>Inquiries</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Products */}
                <div className="dashboard-card">
                    <div className="card-header-flex">
                        <h3>Recent Products</h3>
                        <Link to="/admin/products" className="view-all">View All →</Link>
                    </div>
                    <div className="recent-list">
                        {products.slice(0, 5).map(product => (
                            <div key={product._id} className="recent-item">
                                <img
                                    src={product.images?.[0] || '/images/placeholder.jpg'}
                                    alt={product.name}
                                />
                                <div className="recent-info">
                                    <h4>{product.name}</h4>
                                    <span>{product.category}</span>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div className="recent-price">₹{product.price}</div>
                                    {product.costPrice > 0 && (
                                        <div style={{ fontSize: '11px', marginTop: '2px', color: product.price - product.costPrice > 0 ? '#16a34a' : '#dc2626' }}>
                                            +₹{product.price - product.costPrice}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '14px' }}>
                                No products yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default Dashboard
