import { NavLink } from 'react-router-dom'
import { FiHome, FiPackage, FiShoppingBag, FiTrendingUp, FiMoreHorizontal } from 'react-icons/fi'
import { useState } from 'react'
import '../styles/admin-bottom-nav.css'

const PRIMARY_ITEMS = [
    { to: '/admin/dashboard', icon: <FiHome />, label: 'Home' },
    { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
    { to: '/admin/guest-orders', icon: <FiShoppingBag />, label: 'Orders' },
    { to: '/admin/reports', icon: <FiTrendingUp />, label: 'Reports' },
]

const MORE_ITEMS = [
    { to: '/admin/categories', label: '📂 Categories' },
    { to: '/admin/stock', label: '📦 Stock' },
    { to: '/admin/drops', label: '⚡ Drops' },
    { to: '/admin/predictions', label: '⚽ Predictions' },
    { to: '/admin/story', label: '📖 Stories' },
    { to: '/admin/coupons', label: '🎁 Coupons' },
    { to: '/admin/orders', label: '🧾 Invoices' },
    { to: '/admin/guest-inquiries', label: '💬 Inquiries' },
]

function AdminBottomNav() {
    const [moreOpen, setMoreOpen] = useState(false)

    return (
        <>
            {/* More drawer overlay */}
            {moreOpen && (
                <div
                    className="admin-bn-overlay"
                    onClick={() => setMoreOpen(false)}
                />
            )}

            {/* More drawer */}
            {moreOpen && (
                <div className="admin-bn-more-drawer">
                    <div className="admin-bn-more-handle" />
                    <div className="admin-bn-more-grid">
                        {MORE_ITEMS.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `admin-bn-more-item ${isActive ? 'active' : ''}`
                                }
                                onClick={() => setMoreOpen(false)}
                            >
                                {label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}

            <nav className="admin-bottom-nav" aria-label="Mobile Admin Navigation">
                {PRIMARY_ITEMS.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        end={to === '/admin/dashboard'}
                    >
                        <span className="nav-item-icon">{icon}</span>
                        <span className="nav-item-label">{label}</span>
                    </NavLink>
                ))}

                <button
                    className={`nav-item ${moreOpen ? 'active' : ''}`}
                    onClick={() => setMoreOpen(!moreOpen)}
                    aria-label="More options"
                    aria-expanded={moreOpen}
                >
                    <span className="nav-item-icon"><FiMoreHorizontal /></span>
                    <span className="nav-item-label">More</span>
                </button>
            </nav>
        </>
    )
}

export default AdminBottomNav
