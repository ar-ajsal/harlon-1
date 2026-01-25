import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiGrid, FiLogOut, FiShoppingBag, FiLayers } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'

function Dashboard() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { products, categories } = useProducts()

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    const stats = [
        {
            icon: <FiPackage />,
            value: products.length,
            label: 'Total Products',
            color: 'var(--primary-color)'
        },
        {
            icon: <FiLayers />,
            value: categories.length,
            label: 'Categories',
            color: 'var(--success-color)'
        },
        {
            icon: <FiShoppingBag />,
            value: products.filter(p => p.inStock).length,
            label: 'In Stock',
            color: 'var(--warning-color)'
        },
        {
            icon: <FiGrid />,
            value: products.filter(p => p.featured).length,
            label: 'Featured',
            color: 'var(--accent-color)'
        }
    ]

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">harlon</div>
                <nav className="admin-nav">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiHome />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiPackage />
                        Products
                    </NavLink>
                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiLayers />
                        Categories
                    </NavLink>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />
                    <Link to="/" className="admin-nav-link" target="_blank">
                        <FiShoppingBag />
                        View Store
                    </Link>
                    <button onClick={handleLogout} className="admin-nav-link" style={{ width: '100%', textAlign: 'left' }}>
                        <FiLogOut />
                        Logout
                    </button>
                </nav>
            </aside>

            <main className="admin-content">
                <div className="admin-header">
                    <h1 className="admin-title">Dashboard</h1>
                </div>

                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon" style={{ color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: 'var(--surface-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '30px',
                    border: '1px solid var(--border-color)'
                }}>
                    <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <Link to="/admin/products" className="btn btn-primary">
                            <FiPackage />
                            Manage Products
                        </Link>
                        <Link to="/admin/categories" className="btn btn-secondary">
                            <FiLayers />
                            Manage Categories
                        </Link>
                    </div>
                </div>

                <div style={{
                    marginTop: '30px',
                    background: 'var(--surface-color)',
                    borderRadius: 'var(--border-radius-md)',
                    padding: '30px',
                    border: '1px solid var(--border-color)'
                }}>
                    <h3 style={{ marginBottom: '20px' }}>Recent Products</h3>
                    {products.slice(0, 5).map(product => (
                        <div
                            key={product._id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '15px 0',
                                borderBottom: '1px solid var(--border-color)'
                            }}
                        >
                            <img
                                src={product.images?.[0] || '/images/placeholder.jpg'}
                                alt={product.name}
                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500' }}>{product.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{product.category}</div>
                            </div>
                            <div style={{ color: 'var(--success-color)', fontWeight: '600' }}>
                                ₹{product.price}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default Dashboard
