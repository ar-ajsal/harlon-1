import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiShoppingBag, FiSearch, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext'
import { WHATSAPP_NUMBER } from '../config/constants'

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()
    const { theme, toggleTheme } = useTheme()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`)
            setMobileMenuOpen(false)
            setSearchTerm('')
        }
    }

    return (
        <motion.header
            className="header"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="container header-container">
                <Link to="/" className="logo">
                    <motion.img
                        src="/images/logo.png"
                        alt="Harlon"
                        style={{ height: '40px' }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    />
                </Link>

                {/* Desktop Search */}
                <form onSubmit={handleSearch} className="header-search desktop-only">
                    <div className="search-wrapper">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </form>

                <nav className="nav-links desktop-only-flex">
                    <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        {({ isActive }) => (
                            <motion.span whileHover={{ y: -2 }} style={{ display: 'inline-block' }}>
                                Home
                                {isActive && (
                                    <motion.div
                                        layoutId="underline"
                                        style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'var(--noir-100)'
                                        }}
                                    />
                                )}
                            </motion.span>
                        )}
                    </NavLink>
                    <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        {({ isActive }) => (
                            <motion.span whileHover={{ y: -2 }} style={{ display: 'inline-block' }}>
                                Shop
                                {isActive && (
                                    <motion.div
                                        layoutId="underline"
                                        style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'var(--noir-100)'
                                        }}
                                    />
                                )}
                            </motion.span>
                        )}
                    </NavLink>
                    <motion.a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-link"
                        whileHover={{ y: -2 }}
                    >
                        Contact
                    </motion.a>
                    <NavLink to="/track-order" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        {({ isActive }) => (
                            <motion.span whileHover={{ y: -2 }} style={{ display: 'inline-block' }}>
                                Track Order
                                {isActive && (
                                    <motion.div
                                        layoutId="underline"
                                        style={{
                                            position: 'absolute',
                                            bottom: '-2px',
                                            left: 0,
                                            right: 0,
                                            height: '2px',
                                            background: 'var(--noir-100)'
                                        }}
                                    />
                                )}
                            </motion.span>
                        )}
                    </NavLink>
                    <button
                        type="button"
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
                    </button>
                </nav>

                {/* Mobile Theme Toggle — always visible */}
                <button
                    type="button"
                    className="theme-toggle-btn mobile-theme-btn"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.nav
                            className="mobile-menu-overlay"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Mobile Search */}
                            <form onSubmit={handleSearch} className="header-search mobile-only-block" style={{ marginBottom: '20px' }}>
                                <div className="search-wrapper">
                                    <FiSearch className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                            </form>

                            <NavLink
                                to="/"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/shop"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Shop
                            </NavLink>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nav-link"
                            >
                                Contact
                            </a>
                            <NavLink
                                to="/track-order"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Track Order
                            </NavLink>
                            <button
                                type="button"
                                className="nav-link"
                                onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
                                aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                            >
                                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />} {theme === 'dark' ? 'Light' : 'Dark'}
                            </button>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    )
}

export default Header
