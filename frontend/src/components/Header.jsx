import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiMenu, FiX, FiShoppingBag, FiSearch } from 'react-icons/fi'
import { WHATSAPP_NUMBER } from '../config/constants'

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const navigate = useNavigate()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchTerm.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`)
            setMobileMenuOpen(false)
            setSearchTerm('')
        }
    }

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo">
                    <img src="/images/logo.png" alt="Harlon" style={{ height: '40px' }} />
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

                <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="header-search mobile-only">
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
                </nav>

                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>
        </header>
    )
}

export default Header
