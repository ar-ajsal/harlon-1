import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiShoppingBag, FiPackage } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../config/constants'

const LINKS = [
    { to: '/', label: 'Home', icon: FiHome, exact: true },
    { to: '/shop', label: 'Shop', icon: FiShoppingBag },
    { to: '/track-order', label: 'Track', icon: FiPackage },
]

function MobileNav() {
    return (
        <nav className="mobile-nav" aria-label="Mobile navigation">
            <ul className="mobile-nav-links" role="list">
                {LINKS.map(({ to, label, icon: Icon, exact }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                `mobile-nav-link${isActive ? ' active' : ''}`
                            }
                            aria-label={label}
                        >
                            {({ isActive }) => (
                                <>
                                    <motion.span
                                        animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    >
                                        <Icon size={22} aria-hidden="true" />
                                    </motion.span>
                                    <span>{label}</span>
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}

                {/* WhatsApp — prominent order button */}
                <li>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mobile-nav-link"
                        aria-label="Order on WhatsApp"
                        style={{ color: 'var(--whatsapp, #25D366)' }}
                    >
                        <motion.span
                            whileTap={{ scale: 0.85 }}
                            transition={{ type: 'spring', stiffness: 400 }}
                        >
                            <FaWhatsapp size={22} aria-hidden="true" />
                        </motion.span>
                        <span>Order</span>
                    </a>
                </li>
            </ul>
        </nav>
    )
}

export default MobileNav
