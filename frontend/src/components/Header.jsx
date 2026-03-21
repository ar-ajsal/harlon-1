import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiSearch, FiSun, FiMoon, FiHeart } from 'react-icons/fi'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../context/ThemeContext'
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
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()

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

                    <ThemeToggle />
                </nav>

                {/* ── Mobile controls ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <ThemeToggle />

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
