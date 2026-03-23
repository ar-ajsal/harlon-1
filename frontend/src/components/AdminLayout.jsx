import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
    FiHome, FiPackage, FiLayers, FiLogOut, FiShoppingBag,
    FiFileText, FiTrendingUp, FiMenu, FiGift, FiBriefcase,
    FiBarChart2, FiX, FiExternalLink, FiTag,
    FiZap, FiTarget, FiBookOpen
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import AdminBottomNav from './AdminBottomNav'
import ThemeToggle from './ThemeToggle'
import '../styles/admin-responsive.css'

const NAV_ITEMS = [
    { to: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { to: '/admin/categories', icon: <FiLayers />, label: 'Categories' },
    { to: '/admin/stock', icon: <FiBarChart2 />, label: 'Stock' },
    { to: '/admin/drops', icon: <FiZap />, label: 'Drops' },
    { to: '/admin/predictions', icon: <FiTarget />, label: 'Predictions' },
    { to: '/admin/story', icon: <FiBookOpen />, label: 'Stories' },
    { to: '/admin/coupons', icon: <FiGift />, label: 'Coupons' },
    { to: '/admin/offers', icon: <FiTag />, label: 'Offers' },
    { to: '/admin/orders', icon: <FiFileText />, label: 'Invoices' },
    { to: '/admin/guest-orders', icon: <FiShoppingBag />, label: 'Guest Orders' },
    { to: '/admin/guest-inquiries', icon: <FiBriefcase />, label: 'Inquiries' },
    { to: '/admin/reports', icon: <FiTrendingUp />, label: 'Reports' },
]

/**
 * AdminLayout — wrap every admin page with this.
 * Usage:
 *   <AdminLayout title="Dashboard" subtitle="Welcome back">
 *     {children}
 *   </AdminLayout>
 */
function AdminLayout({ title, subtitle, headerRight, children }) {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    const close = () => setSidebarOpen(false)

    return (
        <div className="admin-layout">
            {/* ─── Hamburger (desktop only, hidden on mobile via CSS) ─── */}
            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Sidebar"
            >
                {sidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {/* ─── Overlay ──────────────────────────────────────────────── */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={close}
            />

            {/* ─── Sidebar ──────────────────────────────────────────────── */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">
                    <span className="admin-logo-text">harlon</span>
                    <span className="admin-logo-badge">ADMIN</span>
                </div>

                <div className="sidebar-scroll">
                    <nav className="admin-nav" aria-label="Admin Navigation">
                        <div className="nav-section-label">Menu</div>

                        {NAV_ITEMS.map(({ to, icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                                onClick={close}
                            >
                                <span className="nav-icon">{icon}</span>
                                <span className="nav-label">{label}</span>
                            </NavLink>
                        ))}

                        <div className="nav-divider" />

                        <Link to="/" className="admin-nav-link" target="_blank" rel="noreferrer" onClick={close}>
                            <span className="nav-icon"><FiExternalLink /></span>
                            <span className="nav-label">View Store</span>
                        </Link>

                        <button onClick={handleLogout} className="admin-nav-link logout-btn">
                            <span className="nav-icon"><FiLogOut /></span>
                            <span className="nav-label">Logout</span>
                        </button>
                    </nav>
                </div>

                {/* Sidebar footer brand */}
                <div className="sidebar-footer">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <ThemeToggle />
                    </div>
                    <div className="sidebar-footer-brand">Harlon © {new Date().getFullYear()}</div>
                </div>
            </aside>

            {/* ─── Main Content ─────────────────────────────────────────── */}
            <main className="admin-content" id="admin-main">
                {(title || headerRight) && (
                    <header className="admin-page-header">
                        <div className="admin-page-header-left">
                            {title && <h1 className="admin-title">{title}</h1>}
                            {subtitle && <p className="admin-subtitle">{subtitle}</p>}
                        </div>
                        {headerRight && (
                            <div className="admin-page-header-right">
                                {headerRight}
                            </div>
                        )}
                    </header>
                )}

                {children}
            </main>

            <AdminBottomNav />
        </div>
    )
}

export default AdminLayout
