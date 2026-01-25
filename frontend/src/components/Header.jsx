import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiMenu, FiX, FiShoppingBag } from 'react-icons/fi'
import { WHATSAPP_NUMBER } from '../config/constants'

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className="header">
            <div className="container header-container">
                <Link to="/" className="logo">
                    <img src="/images/logo.png" alt="Harlon" style={{ height: '40px' }} />
                </Link>

                <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
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
