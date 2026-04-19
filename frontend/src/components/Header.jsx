import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiSearch, FiShoppingBag, FiHeart, FiUser, FiLogOut } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { WHATSAPP_NUMBER } from '../config/constants'

const NAV_LINKS = [
    { to: '/', label: 'Home', exact: true },
    { to: '/shop', label: 'Shop' },
    { to: '/track-order', label: 'Track Order' },
]

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [scrolled, setScrolled] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()
    const { totalItems, openCart } = useCart()
    const { user, isLoggedIn, userLogout } = useAuth()

    /* Glassmorphism kicks in after 20px scroll */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    /* Close menu on resize to desktop */
    useEffect(() => {
        const onResize = () => { if (window.innerWidth > 768) setMobileMenuOpen(false) }
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    const handleSearch = useCallback((e) => {
        e.preventDefault()
        const q = searchTerm.trim()
        if (q) {
            navigate(`/shop?search=${encodeURIComponent(q)}`)
            setMobileMenuOpen(false)
            setSearchTerm('')
        }
    }, [searchTerm, navigate])

    const closeMenu = () => setMobileMenuOpen(false)

    return (
        <motion.header
            className={`header${scrolled ? ' scrolled' : ''}`}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.05 }}
        >
            <div className="container header-container">

                {/* ── Logo ── */}
                <Link to="/" className="logo" aria-label="Harlon — Home">
                    <motion.img
                        src="/images/logo.png"
                        alt="Harlon"
                        style={{ height: '40px', width: 'auto' }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                    />
                </Link>

                {/* ── Desktop Search ── */}
                <form
                    onSubmit={handleSearch}
                    className="header-search desktop-only"
                    role="search"
                    aria-label="Search products"
                >
                    <div className="search-wrapper">
                        <FiSearch className="search-icon" aria-hidden="true" />
                        <input
                            type="search"
                            placeholder="Search jerseys…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            aria-label="Search"
                        />
                    </div>
                </form>

                {/* ── Desktop Nav ── */}
                <nav className="nav-links desktop-only-flex" aria-label="Primary">
                    {NAV_LINKS.map(({ to, label, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}
                            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        >
                            {({ isActive }) => (
                                <motion.span
                                    whileHover={{ y: -2 }}
                                    style={{ display: 'inline-block', position: 'relative' }}
                                >
                                    {label}
                                    {isActive && (
                                        <motion.span
                                            layoutId="nav-underline"
                                            style={{
                                                position: 'absolute',
                                                bottom: -2,
                                                left: 0,
                                                right: 0,
                                                height: 2,
                                                borderRadius: 2,
                                                background: 'hsl(38, 65%, 55%)',    /* Gold */
                                            }}
                                        />
                                    )}
                                </motion.span>
                            )}
                        </NavLink>
                    ))}

                    {/* WhatsApp contact — no underline animation needed */}
                    <motion.a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link"
                        whileHover={{ y: -2 }}
                        aria-label="Contact us on WhatsApp"
                    >
                        Contact
                    </motion.a>

                    {/* Wishlist / Jersey Wall */}
                    <NavLink
                        to="/wishlist"
                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                        aria-label="Jersey Wall — my saved jerseys"
                        style={{ position: 'relative' }}
                    >
                        {({ isActive }) => (
                            <motion.span whileHover={{ y: -2 }} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <FiHeart size={16} />
                            </motion.span>
                        )}
                    </NavLink>

                    {/* Cart icon */}
                    <button
                        type="button"
                        onClick={openCart}
                        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: 8, marginLeft: 4 }}
                        aria-label="Open cart"
                    >
                        <FiShoppingBag size={18} />
                        {totalItems > 0 && (
                            <span style={{ position: 'absolute', top: 2, right: 2, background: 'hsl(38,65%,55%)', color: '#0A0A0A', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* User button */}
                    {isLoggedIn ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setUserMenuOpen(o => !o)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', borderRadius: 8, color: 'inherit' }}
                                aria-label="User menu"
                            >
                                {user?.avatar
                                    ? <img src={user.avatar} alt={user.name} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid hsl(38,65%,55%)' }} />
                                    : <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'hsl(38,65%,55%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0a0a0a' }}>{user?.name?.[0]?.toUpperCase()}</div>
                                }
                            </button>
                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        style={{
                                            position: 'absolute', right: 0, top: '110%', minWidth: 180,
                                            background: 'var(--color-surface, #0a0a0a)',
                                            border: '1px solid rgba(200,150,43,0.2)', borderRadius: 12,
                                            padding: '8px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                                            zIndex: 1000,
                                        }}
                                    >
                                        <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(128,128,128,0.1)', marginBottom: 6 }}>
                                            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, margin: 0, color: 'var(--color-text, #f5f0e8)' }}>{user?.name}</p>
                                            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#888', margin: '2px 0 0' }}>{user?.email}</p>
                                        </div>
                                        {[
                                            { to: '/profile', label: '👤 My Profile' },
                                            { to: '/profile', label: '📦 My Orders', state: { tab: 'orders' } },
                                            { to: '/cart', label: '🛒 My Cart' },
                                        ].map(({ to, label }) => (
                                            <Link key={label} to={to} onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', padding: '9px 12px', color: 'var(--color-text, #f5f0e8)', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 8, transition: 'background 0.15s' }}>
                                                {label}
                                            </Link>
                                        ))}
                                        <div style={{ borderTop: '1px solid rgba(128,128,128,0.1)', marginTop: 6, paddingTop: 6 }}>
                                            <button
                                                onClick={() => { userLogout(); setUserMenuOpen(false) }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 8 }}
                                            >
                                                <FiLogOut size={14} /> Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                                background: 'hsl(38,65%,55%)', color: '#0a0a0a', borderRadius: 8,
                                fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
                                textDecoration: 'none', marginLeft: 4,
                            }}
                        >
                            <FiUser size={14} /> Login
                        </Link>
                    )}

                    <ThemeToggle />
                </nav>

                {/* ── Mobile controls ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {/* Cart icon (mobile) */}
                    <button
                        type="button"
                        onClick={openCart}
                        style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: 8 }}
                        aria-label="Open cart"
                    >
                        <FiShoppingBag size={20} />
                        {totalItems > 0 && (
                            <span style={{ position: 'absolute', top: 2, right: 2, background: 'hsl(38,65%,55%)', color: '#0A0A0A', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {totalItems}
                            </span>
                        )}
                    </button>
                    <ThemeToggle className="mobile-theme-btn" />

                    {/* Hamburger */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(o => !o)}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {mobileMenuOpen
                                ? <motion.span key="x"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                ><FiX size={22} /></motion.span>
                                : <motion.span key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                ><FiMenu size={22} /></motion.span>
                            }
                        </AnimatePresence>
                    </button>
                </div>

                {/* ── Mobile Menu Overlay ── */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.nav
                            id="mobile-menu"
                            className="mobile-menu-overlay"
                            initial={{ opacity: 0, y: -12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            role="navigation"
                            aria-label="Mobile menu"
                        >
                            {/* Mobile Search */}
                            <form
                                onSubmit={handleSearch}
                                className="header-search"
                                style={{ margin: '0 0 12px', maxWidth: '100%' }}
                                role="search"
                            >
                                <div className="search-wrapper">
                                    <FiSearch className="search-icon" aria-hidden="true" />
                                    <input
                                        type="search"
                                        placeholder="Search jerseys…"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                        aria-label="Search"
                                        autoFocus
                                    />
                                </div>
                            </form>

                            {NAV_LINKS.map(({ to, label, exact }, i) => (
                                <motion.div
                                    key={to}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06, duration: 0.2 }}
                                >
                                    <NavLink
                                        to={to}
                                        end={exact}
                                        className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                        onClick={closeMenu}
                                    >
                                        {label}
                                    </NavLink>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: NAV_LINKS.length * 0.06, duration: 0.2 }}
                            >
                                <a
                                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="nav-link"
                                    onClick={closeMenu}
                                >
                                    Contact
                                </a>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (NAV_LINKS.length + 1) * 0.06, duration: 0.2 }}
                            >
                                <NavLink
                                    to="/wishlist"
                                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                                    onClick={closeMenu}
                                >
                                    ❤️ Jersey Wall
                                </NavLink>
                            </motion.div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    )
}

export default Header
