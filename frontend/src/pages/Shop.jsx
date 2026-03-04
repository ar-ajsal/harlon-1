/**
 * Harlon — Shop Page
 * Premium mobile-first product browser
 * Features: animated header, category pill rail, result count, premium grid,
 *           staggered card entrance, load-more, empty state
 */
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiSearch, FiX, FiShoppingBag, FiHeart } from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'
import { useWishlist } from '../context/WishlistContext'
import Skeleton from '../components/ui/Skeleton'

/* Premium home-page card re-used here */
import '../styles/home.css'

/* ─────────────────────────────────── helpers ── */
const PRODUCTS_PER_PAGE = 12
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const disc = (p, o) => o && p < o ? Math.round((1 - p / o) * 100) : 0

const cardV = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
    },
}
const gridV = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

/* ─── Premium product card (shop variant) ──── */
function ShopCard({ product }) {
    const d = disc(product.price, product.originalPrice)
    const sold = !!product.soldOut
    const { isWishlisted, toggleWishlist } = useWishlist()
    const wishlisted = isWishlisted(product._id)

    return (
        <Link
            to={`/product/${product._id}`}
            className="hh-product-card"
            aria-label={`${product.name}${sold ? ' — Sold Out' : ''}, ${fmt(product.price)}`}
        >
            <div className="hh-product-img-wrap">
                <img
                    src={product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    loading="lazy"
                    width={300} height={400}
                    style={sold ? { opacity: 0.48, filter: 'grayscale(50%)' } : undefined}
                />
                {sold
                    ? <span className="hh-product-badge hh-product-badge--sold">Sold Out</span>
                    : product.bestSeller
                        ? <span className="hh-product-badge hh-product-badge--best">⭐ Best</span>
                        : d >= 8
                            ? <span className="hh-product-badge hh-product-badge--sale">{d}% OFF</span>
                            : null
                }
                {/* Wishlist heart */}
                <button
                    className={`hh-wish-btn${wishlisted ? ' wishlisted' : ''}`}
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product) }}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <FiHeart size={14} />
                </button>
                {sold && <div className="hh-sold-ribbon" aria-hidden="true">⛔ Sold Out</div>}
                {!sold && (
                    <span className="hh-quick-btn" aria-hidden="true">
                        <FiShoppingBag size={14} />
                    </span>
                )}
            </div>
            <div className="hh-product-info">
                <p className="hh-product-cat">{product.category}</p>
                <h3 className="hh-product-name">{product.name}</h3>
                <div className="hh-product-price-row">
                    <span className="hh-price">{fmt(product.price)}</span>
                    {product.originalPrice > product.price && (
                        <span className="hh-price-orig">{fmt(product.originalPrice)}</span>
                    )}
                    {d >= 5 && !sold && (
                        <span className="hh-price-off">{d}% off</span>
                    )}
                </div>
            </div>
        </Link>
    )
}

/* ─── Main page ──────────────────────────────── */
export default function Shop() {
    const shouldReduceMotion = useReducedMotion()
    const [searchParams, setSearchParams] = useSearchParams()
    const { products, categories, loading, loadingMore, error } = useProducts()

    const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || 'all')
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)

    /* Keep state in sync with URL */
    useEffect(() => {
        const c = searchParams.get('category')
        const s = searchParams.get('search')
        if (c) setSelectedCat(c)
        if (s !== null) setSearchTerm(s)
    }, [searchParams])

    /* Filtered list */
    const filtered = (() => {
        let r = products.filter(p => p.isVisible !== false)
        if (selectedCat !== 'all') {
            r = r.filter(p => p.category.toLowerCase() === selectedCat.toLowerCase())
        }
        if (searchTerm.trim()) {
            const t = searchTerm.toLowerCase()
            r = r.filter(p =>
                p.name.toLowerCase().includes(t) ||
                p.category.toLowerCase().includes(t) ||
                p.description?.toLowerCase().includes(t)
            )
        }
        return r
    })()

    const displayed = filtered.slice(0, displayCount)
    const hasMore = displayCount < filtered.length
    const remaining = filtered.length - displayCount

    /* Handlers */
    const setCategory = useCallback((cat) => {
        setSelectedCat(cat)
        setDisplayCount(PRODUCTS_PER_PAGE)
        const p = new URLSearchParams(searchParams)
        p.set('category', cat)
        setSearchParams(p, { replace: true })
    }, [searchParams, setSearchParams])

    const handleSearchChange = useCallback((e) => {
        const val = e.target.value
        setSearchTerm(val)
        setDisplayCount(PRODUCTS_PER_PAGE)
        const p = new URLSearchParams(searchParams)
        val ? p.set('search', val) : p.delete('search')
        setSearchParams(p, { replace: true })
    }, [searchParams, setSearchParams])

    const clearSearch = () => handleSearchChange({ target: { value: '' } })

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="shop-page">
                <div style={{ padding: '120px 20px 40px', maxWidth: 1280, margin: '0 auto' }}>
                    <div className="hl-shimmer" style={{ height: 44, width: 280, borderRadius: 8, marginBottom: 12 }} />
                    <div className="hl-shimmer" style={{ height: 20, width: 420, borderRadius: 6, marginBottom: 32 }} />
                    <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
                        {[90, 120, 100, 140, 110].map((w, i) => (
                            <div key={i} className="hl-shimmer" style={{ height: 38, width: w, borderRadius: 99 }} />
                        ))}
                    </div>
                    <Skeleton.ProductGrid count={8} />
                </div>
            </div>
        )
    }

    /* ── Error ── */
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>⚠️</p>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 8 }}>
                    Cannot connect
                </h2>
                <p style={{ color: '#777', marginBottom: 28 }}>{error}</p>
                <button className="hh-btn-primary" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        )
    }

    return (
        <div className="shop-page">
            <section style={{ paddingTop: '100px', paddingBottom: '60px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>

                    {/* ── Page header ── */}
                    <motion.div
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ marginBottom: 32 }}
                    >
                        <p className="hh-section-eyebrow" style={{ marginBottom: 6 }}>
                            The Collection
                        </p>
                        <h1 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 800,
                            fontSize: 'clamp(32px, 7vw, 52px)',
                            letterSpacing: '-0.03em',
                            lineHeight: 1.05,
                            color: '#0A0A0A',
                            margin: '0 0 10px',
                        }}>
                            All Jerseys
                        </h1>
                        <p style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 15,
                            color: '#777',
                            margin: 0,
                        }}>
                            Authentic retro football jerseys — handpicked for Indian fans
                        </p>
                    </motion.div>

                    {/* ── Search bar ── */}
                    <motion.div
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        style={{ marginBottom: 20 }}
                    >
                        <div style={{
                            position: 'relative',
                            maxWidth: 480,
                        }}>
                            <FiSearch
                                size={16}
                                style={{
                                    position: 'absolute', left: 16, top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#999', pointerEvents: 'none',
                                }}
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                placeholder="Search jerseys, clubs, nations…"
                                aria-label="Search products"
                                style={{
                                    width: '100%',
                                    padding: '13px 44px 13px 44px',
                                    borderRadius: 99,
                                    border: '1.5px solid #E5E5E5',
                                    background: '#fff',
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 14,
                                    color: '#0A0A0A',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = 'hsl(38,65%,55%)'}
                                onBlur={e => e.target.style.borderColor = '#E5E5E5'}
                            />
                            <AnimatePresence>
                                {searchTerm && (
                                    <motion.button
                                        key="clear"
                                        initial={{ opacity: 0, scale: 0.7 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.7 }}
                                        onClick={clearSearch}
                                        aria-label="Clear search"
                                        style={{
                                            position: 'absolute', right: 14, top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: '#EEE',
                                            border: 'none', cursor: 'pointer',
                                            borderRadius: '50%',
                                            width: 24, height: 24,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <FiX size={13} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* ── Category pill rail ── */}
                    <motion.div
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.15 }}
                        style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            marginBottom: 28,
                        }}
                        role="group"
                        aria-label="Filter by category"
                    >
                        {['all', ...(categories || []).map(c => c.name.toLowerCase())].map((cat, i) => {
                            const label = cat === 'all' ? 'All Products' :
                                (categories.find(c => c.name.toLowerCase() === cat)?.name || cat)
                            const isActive = selectedCat === cat
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    aria-pressed={isActive}
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 13,
                                        fontWeight: isActive ? 700 : 500,
                                        padding: '9px 18px',
                                        borderRadius: 99,
                                        border: `1.5px solid ${isActive ? 'hsl(38,65%,55%)' : '#E5E5E5'}`,
                                        background: isActive ? 'hsl(38,65%,55%)' : '#fff',
                                        color: isActive ? '#0A0A0A' : '#555',
                                        cursor: 'pointer',
                                        minHeight: 40,
                                        transition: 'all 0.18s ease',
                                        whiteSpace: 'nowrap',
                                        boxShadow: isActive ? '0 2px 12px hsl(38,65%,55%,0.28)' : 'none',
                                    }}
                                >
                                    {label}
                                </button>
                            )
                        })}
                    </motion.div>

                    {/* ── Result count ── */}
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: '#999',
                        marginBottom: 24,
                        minHeight: 20,
                    }}>
                        {filtered.length
                            ? `${displayed.length} of ${filtered.length} ${filtered.length === 1 ? 'jersey' : 'jerseys'}${searchTerm ? ` for "${searchTerm}"` : ''}`
                            : searchTerm ? `No jerseys found for "${searchTerm}"` : 'No jerseys in this category'
                        }
                    </p>

                    {/* ── Grid ── */}
                    <AnimatePresence mode="wait">
                        {displayed.length > 0 ? (
                            <motion.div
                                key={`${selectedCat}-${searchTerm}`}
                                className="hh-product-grid"
                                initial="hidden"
                                animate="visible"
                                variants={shouldReduceMotion ? {} : gridV}
                            >
                                {displayed.map(p => (
                                    <motion.div key={p._id} variants={shouldReduceMotion ? {} : cardV}>
                                        <ShopCard product={p} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ textAlign: 'center', padding: '80px 20px' }}
                            >
                                <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
                                <h3 style={{
                                    fontFamily: "'Syne', sans-serif",
                                    fontWeight: 800,
                                    fontSize: 22,
                                    marginBottom: 8,
                                    color: '#0A0A0A',
                                }}>
                                    Nothing found
                                </h3>
                                <p style={{ color: '#999', marginBottom: 24, fontSize: 14 }}>
                                    Try a different search or category
                                </p>
                                <button
                                    className="hh-btn-primary"
                                    onClick={() => { setCategory('all'); clearSearch() }}
                                >
                                    Clear filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Load More ── */}
                    {hasMore && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
                            <motion.button
                                className="hh-btn-primary"
                                onClick={() => setDisplayCount(c => c + PRODUCTS_PER_PAGE)}
                                disabled={loadingMore}
                                whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                                style={{ minWidth: 200 }}
                            >
                                {loadingMore
                                    ? 'Loading…'
                                    : `Load More — ${remaining} left`}
                            </motion.button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
