import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiShoppingBag, FiHeart } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useWishlist } from '../context/WishlistContext'
import { WHATSAPP_NUMBER } from '../config/constants'

function MobileNav() {
    const { wishlist } = useWishlist()
    const wishCount = wishlist.length

    const LINKS = [
        { to: '/', label: 'Home', icon: FiHome, exact: true },
        { to: '/shop', label: 'Shop', icon: FiShoppingBag },
        { to: '/drops', label: '⚡', isEmoji: true, emojiLabel: 'Drops' },
        { to: '/predictions', label: '⚽', isEmoji: true, emojiLabel: 'Predict' },
        { to: '/fan', label: '🏆', isEmoji: true, emojiLabel: 'Fan' },
    ]

    return (
        <nav className="mobile-nav" aria-label="Mobile navigation">
            <ul className="mobile-nav-links" role="list">
                {LINKS.map(({ to, label, icon: Icon, exact, isEmoji, emojiLabel }) => (
                    <li key={to}>
                        <NavLink
                            to={to}
                            end={exact}
                            className={({ isActive }) =>
                                `mobile-nav-link${isActive ? ' active' : ''}`
                            }
                            aria-label={emojiLabel || label}
                        >
                            {({ isActive }) => (
                                <>
                                    <motion.span
                                        animate={isActive ? { scale: 1.18 } : { scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        style={{ fontSize: isEmoji ? 20 : undefined, lineHeight: 1 }}
                                    >
                                        {isEmoji ? label : <Icon size={22} aria-hidden="true" />}
                                    </motion.span>
                                    <span>{isEmoji ? emojiLabel : label}</span>
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}

                {/* Wishlist — Jersey Wall */}
                <li style={{ position: 'relative' }}>
                    <NavLink
                        to="/wishlist"
                        className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                        aria-label={`Jersey Wall — ${wishCount} saved`}
                    >
                        {({ isActive }) => (
                            <>
                                <motion.span
                                    style={{ position: 'relative' }}
                                    animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                >
                                    <FiHeart size={22} aria-hidden="true" />
                                    {wishCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -6, right: -6,
                                            background: '#ef4444', color: '#fff',
                                            fontSize: 9, fontWeight: 800,
                                            width: 16, height: 16, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            lineHeight: 1
                                        }}>
                                            {wishCount > 9 ? '9+' : wishCount}
                                        </span>
                                    )}
                                </motion.span>
                                <span>Wall</span>
                            </>
                        )}
                    </NavLink>
                </li>

                {/* WhatsApp */}
                <li>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mobile-nav-link"
                        aria-label="Order on WhatsApp"
                        style={{ color: 'var(--whatsapp, #25D366)' }}
                    >
                        <motion.span whileTap={{ scale: 0.85 }} transition={{ type: 'spring', stiffness: 400 }}>
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
