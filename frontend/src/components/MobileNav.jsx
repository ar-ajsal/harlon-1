import { NavLink } from 'react-router-dom'
import { FiHome, FiShoppingBag } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../config/constants'

function MobileNav() {
    return (
        <nav className="mobile-bottom-nav">
            <NavLink
                to="/"
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            >
                <FiHome className="mobile-nav-icon" />
                <span>Home</span>
            </NavLink>

            <NavLink
                to="/shop"
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
            >
                <FiShoppingBag className="mobile-nav-icon" />
                <span>Shop</span>
            </NavLink>

            <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mobile-nav-item whatsapp"
            >
                <div className="whatsapp-btn-circle">
                    <FaWhatsapp className="mobile-nav-icon" />
                </div>
                <span>Order</span>
            </a>
        </nav>
    )
}

export default MobileNav
