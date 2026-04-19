import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome, FiShoppingBag, FiHeart, FiShoppingCart, FiUser } from 'react-icons/fi'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function MobileNav() {
    const { wishlist } = useWishlist()
    const { totalItems } = useCart()
    const { isLoggedIn } = useAuth()
    const wishCount = wishlist.length

    return (
        <nav className="mobile-nav" aria-label="Mobile navigation">
            <ul className="mobile-nav-links" role="list" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: 0, padding: 0, listStyle: 'none' }}>

                {/* Home */}
                <li>
                    <NavLink to="/" end className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} aria-label="Home">
                        {({ isActive }) => (
                            <>
                                <motion.span animate={isActive ? { scale: 1.18 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                    <FiHome size={22} aria-hidden="true" />
                                </motion.span>
                                <span>Home</span>
                            </>
                        )}
                    </NavLink>
                </li>

                {/* Shop */}
                <li>
                    <NavLink to="/shop" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} aria-label="Shop">
                        {({ isActive }) => (
                            <>
                                <motion.span animate={isActive ? { scale: 1.18 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                    <FiShoppingBag size={22} aria-hidden="true" />
                                </motion.span>
                                <span>Shop</span>
                            </>
                        )}
                    </NavLink>
                </li>

                {/* Cart — centre, with badge */}
                <li style={{ position: 'relative' }}>
                    <NavLink to="/cart" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} aria-label={`Cart — ${totalItems} items`}>
                        {({ isActive }) => (
                            <>
                                <motion.span
                                    style={{ position: 'relative' }}
                                    animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                >
                                    <FiShoppingCart size={22} aria-hidden="true" />
                                    {totalItems > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -7, right: -7,
                                            background: 'hsl(38,65%,55%)', color: '#0a0a0a',
                                            fontSize: 9, fontWeight: 900,
                                            width: 16, height: 16, borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            lineHeight: 1,
                                        }}>
                                            {totalItems > 9 ? '9+' : totalItems}
                                        </span>
                                    )}
                                </motion.span>
                                <span>Cart</span>
                            </>
                        )}
                    </NavLink>
                </li>

                {/* Wishlist */}
                <li style={{ position: 'relative' }}>
                    <NavLink to="/wishlist" className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`} aria-label={`Wishlist — ${wishCount} saved`}>
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

                {/* Profile / Login */}
                <li>
                    <NavLink
                        to={isLoggedIn ? '/profile' : '/login'}
                        className={({ isActive }) => `mobile-nav-link${isActive ? ' active' : ''}`}
                        aria-label={isLoggedIn ? 'My Profile' : 'Login'}
                    >
                        {({ isActive }) => (
                            <>
                                <motion.span animate={isActive ? { scale: 1.18 } : { scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                    <FiUser size={22} aria-hidden="true" />
                                </motion.span>
                                <span>{isLoggedIn ? 'Profile' : 'Login'}</span>
                            </>
                        )}
                    </NavLink>
                </li>

            </ul>
        </nav>
    )
}

export default MobileNav
