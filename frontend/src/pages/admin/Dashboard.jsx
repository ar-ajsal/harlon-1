import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiDollarSign, FiTrendingUp, FiPackage, FiPlus, FiClipboard, FiShoppingBag } from 'react-icons/fi'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, BarChart, Bar
} from 'recharts'
import { useProducts } from '../../context/ProductContext'
import { ordersAPI } from '../../api/orders.api'
import { settingsApi } from '../../api/settings.api'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

function Dashboard() {
    const { products } = useProducts()
    const [dashboardStats, setDashboardStats] = useState({
        todayRevenue: 0, monthRevenue: 0, pendingOrders: 0, monthProfit: 0
    })
    const [graphData, setGraphData] = useState([])

    // Flash Sale admin state
    const [flashSale, setFlashSale] = useState(() => {
        try { return JSON.parse(localStorage.getItem('harlon_flash_sale') || 'null') } catch { return null }
    })
    const [saleText, setSaleText] = useState(flashSale?.text || '')
    const [saleDiscount, setSaleDiscount] = useState(flashSale?.discount || '')
    const [saleEnd, setSaleEnd] = useState(flashSale?.endTime ? new Date(flashSale.endTime).toISOString().slice(0, 16) : '')

    // Jersey of the Day admin state
    const [jotdId, setJotdId] = useState(() => {
        try {
            const d = JSON.parse(localStorage.getItem('harlon_jotd') || 'null')
            return d?.setAt === new Date().toDateString() ? d.productId : ''
        } catch { return '' }
    })

    // Global Order Settings
    const [orderSettings, setOrderSettings] = useState({ whatsappOrderEnabled: true, onlinePaymentEnabled: true })
    const [loadingSettings, setLoadingSettings] = useState(true)

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

            try {
                const settingsRes = await settingsApi.getSettings()
                if (settingsRes.success) {
                    setOrderSettings({
                        whatsappOrderEnabled: settingsRes.data.whatsappOrderEnabled,
                        onlinePaymentEnabled: settingsRes.data.onlinePaymentEnabled
                    })
                }
            } catch (err) {
                console.error('Error fetching settings:', err)
            } finally {
                setLoadingSettings(false)
            }
        }
        fetchStats()
    }, [])

    const toggleSetting = async (key) => {
        const newVal = !orderSettings[key]
        setOrderSettings(prev => ({ ...prev, [key]: newVal }))
        try {
            await settingsApi.updateSettings({ [key]: newVal })
        } catch (err) {
            console.error('Error updating setting:', err)
            // revert on failure
            setOrderSettings(prev => ({ ...prev, [key]: !newVal }))
            alert('Failed to update settings')
        }
    }

    const totalProductCost = products.reduce((sum, p) => sum + (p.costPrice || 0), 0)
    const fmt = (val) => `₹${(val || 0).toLocaleString('en-IN')}`
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

    // Top 5 products by margin — computed from products list
    const topProducts = [...products]
        .filter(p => p.price > 0 && p.costPrice > 0)
        .map(p => ({ ...p, profit: p.price - p.costPrice, margin: Math.round(((p.price - p.costPrice) / p.price) * 100) }))
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 5)

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

            {/* Profit Analytics — Top Products Table */}
            <div className="content-card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: '#0f0f11' }}>
                    📊 Top Products by Profit Margin
                </h3>
                {topProducts.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                                    {['#', 'Product', 'Price', 'Cost', 'Profit', 'Margin'].map(h => (
                                        <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Product' || h === '#' ? 'left' : 'right', fontWeight: 700, color: '#6b7280', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((p, i) => (
                                    <tr key={p._id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                                        onMouseLeave={e => e.currentTarget.style.background = ''}
                                    >
                                        <td style={{ padding: '10px 12px', color: '#9ca3af', fontWeight: 700 }}>{i + 1}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <img src={p.images?.[0] || '/images/placeholder.jpg'} alt={p.name}
                                                    style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0f0f11', fontSize: 13 }}>{p.name}</div>
                                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#374151', fontWeight: 600 }}>₹{p.price.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#9ca3af' }}>₹{(p.costPrice || 0).toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#16a34a', fontWeight: 700 }}>₹{p.profit.toLocaleString('en-IN')}</td>
                                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                                                background: p.margin >= 40 ? '#dcfce7' : p.margin >= 20 ? '#fef9c3' : '#fee2e2',
                                                color: p.margin >= 40 ? '#15803d' : p.margin >= 20 ? '#a16207' : '#dc2626',
                                            }}>
                                                {p.margin}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: 14 }}>
                        Add cost prices to products to see profit analytics
                    </div>
                )}
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

            {/* Admin Controls: Flash Sale + JOTD */}
            <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
                {/* Flash Sale Control */}
                <div className="dashboard-card">
                    <h3 style={{ marginBottom: 16 }}>⚡ Flash Sale Banner</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Sale Label</label>
                            <input
                                type="text"
                                value={saleText}
                                onChange={e => setSaleText(e.target.value)}
                                placeholder="e.g. Weekend Flash Sale"
                                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Discount %</label>
                                <input
                                    type="number"
                                    value={saleDiscount}
                                    onChange={e => setSaleDiscount(e.target.value)}
                                    placeholder="20"
                                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Ends At</label>
                                <input
                                    type="datetime-local"
                                    value={saleEnd}
                                    onChange={e => setSaleEnd(e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => {
                                    if (!saleEnd) return
                                    const data = { text: saleText, discount: saleDiscount, endTime: new Date(saleEnd).toISOString() }
                                    localStorage.setItem('harlon_flash_sale', JSON.stringify(data))
                                    setFlashSale(data)
                                    window.dispatchEvent(new Event('storage'))
                                    alert('Flash sale activated!')
                                }}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
                            >
                                Activate 🚀
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('harlon_flash_sale')
                                    setFlashSale(null); setSaleText(''); setSaleDiscount(''); setSaleEnd('')
                                    window.dispatchEvent(new Event('storage'))
                                }}
                                className="btn btn-outline"
                                style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
                            >
                                Clear
                            </button>
                        </div>
                        {flashSale && <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✅ Active until {new Date(flashSale.endTime).toLocaleString()}</div>}
                    </div>
                </div>

                {/* Jersey of the Day Control */}
                <div className="dashboard-card">
                    <h3 style={{ marginBottom: 16 }}>⭐ Jersey of the Day</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                            <label style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, display: 'block', marginBottom: 4 }}>Pick a Product</label>
                            <select
                                value={jotdId}
                                onChange={e => setJotdId(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: '#fff' }}
                            >
                                <option value="">-- Auto-pick best seller --</option>
                                {products.filter(p => !p.soldOut).map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => {
                                const data = { productId: jotdId, setAt: new Date().toDateString() }
                                localStorage.setItem('harlon_jotd', JSON.stringify(data))
                                alert(jotdId ? 'Jersey of the Day set!' : 'Reset to auto-pick!')
                            }}
                            className="btn btn-primary"
                            style={{ padding: '9px 0', fontSize: 13 }}
                        >
                            {jotdId ? 'Set as Jersey of the Day ⭐' : 'Save (Auto-pick)'}
                        </button>
                        <p style={{ fontSize: 12, color: '#9ca3af' }}>Resets daily. Shows on homepage hero section.</p>
                    </div>
                </div>
            </div>

            {/* Global Order Settings */}
            <div className="dashboard-grid-2" style={{ marginTop: 24 }}>
                <div className="dashboard-card">
                    <h3 style={{ marginBottom: 16 }}>⚙️ Order Settings</h3>
                    {loadingSettings ? (
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>Loading settings...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#0f0f11', fontSize: 14 }}>WhatsApp Orders</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>Allow customers to place orders via WhatsApp manual confirmation</div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('whatsappOrderEnabled')}
                                    style={{
                                        background: orderSettings.whatsappOrderEnabled ? '#10b981' : '#e5e7eb',
                                        color: orderSettings.whatsappOrderEnabled ? '#fff' : '#6b7280',
                                        border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                >
                                    {orderSettings.whatsappOrderEnabled ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1.5px solid #e5e7eb', borderRadius: 8 }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: '#0f0f11', fontSize: 14 }}>Online Payment</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>Allow checkout via Razorpay (UPI, Cards, Netbanking)</div>
                                </div>
                                <button
                                    onClick={() => toggleSetting('onlinePaymentEnabled')}
                                    style={{
                                        background: orderSettings.onlinePaymentEnabled ? '#10b981' : '#e5e7eb',
                                        color: orderSettings.onlinePaymentEnabled ? '#fff' : '#6b7280',
                                        border: 'none', borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
                                    }}
                                >
                                    {orderSettings.onlinePaymentEnabled ? 'Enabled' : 'Disabled'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout >
    )
}

export default Dashboard
