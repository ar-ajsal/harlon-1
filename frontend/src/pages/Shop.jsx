/**
 * HARLON — HIGH-CONVERTING SHOP PAGE
 * Limited Drop Marketplace UX
 * Psychology: FOMO + Urgency + Emotional storytelling
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiSearch, FiX, FiShoppingBag, FiHeart, FiZap } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useProducts } from '../context/ProductContext'
import { productsApi } from '../services/api'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { WHATSAPP_NUMBER } from '../config/constants'
import Skeleton from '../components/ui/Skeleton'
import '../styles/shop.css'

const PRODUCTS_PER_PAGE = 12
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const calcDisc = (p, o) => o && p < o ? Math.round((1 - p / o) * 100) : 0

/* ── Smart filter chip definitions ─────────────────────────── */
// Using real categories from context exclusively

/* ── Story / interrupter blocks ─────────────────────────────── */
const STORY_BLOCKS = [
    {
        type: 'story',
        eyebrow: 'THE MOMENT',
        headline: 'Wembley. 2011.\nMessi silenced\nthe world.',
        sub: 'Wearing the same crest. Not the same story.',
    },
    {
        type: 'drop-alert',
        eyebrow: 'NEXT DROP',
        headline: 'New jerseys\ndropping soon.',
        sub: 'Follow us on WhatsApp to be first.',
        cta: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi HARLON! Notify me for next drop 🔔')}`,
    },
    {
        type: 'social',
        eyebrow: 'WORN BY REAL FANS',
        headline: 'Not influencers.\nReal fans.',
        sub: 'Tag @harlon.shop and join thousands of legends.',
    },
]

/* ── Urgency Bar ────────────────────────────────────────────── */
function UrgencyBar() {
    return (
        <div className="shop-urgency-bar">
            <div className="shop-urgency-track">
                {Array(6).fill('🔥 DROP LIVE NOW — LIMITED STOCK — NO RESTOCKS — ').map((t, i) => (
                    <span key={i}>{t}</span>
                ))}
            </div>
        </div>
    )
}

/* ── Micro Hero ─────────────────────────────────────────────── */
function DropHero({ total, loading }) {
    return (
        <div className="shop-hero">
            <div className="shop-hero-inner">
                <span className="shop-hero-eyebrow">
                    <span className="shop-live-dot" /> LIVE NOW
                </span>
                <h1 className="shop-hero-title">THE DROP</h1>
                <p className="shop-hero-sub">
                    Only for real fans. Once sold out, gone forever.
                </p>
                {!loading && total > 0 && (
                    <p className="shop-hero-count">
                        <FiZap size={13} /> {total} jerseys available — while they last
                    </p>
                )}
            </div>
        </div>
    )
}

/* ── Smart Filter Chips ─────────────────────────────────────── */
function filterProducts(products, chipId, search, categories) {
    let result = [...products]

    // Text search
    if (search) {
        const q = search.toLowerCase()
        result = result.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        )
    }

    // Smart chip filters
    if (chipId !== 'all') {
        result = result.filter(p =>
            p.category?.toLowerCase() === chipId.toLowerCase() ||
            p.category?.toLowerCase().includes(chipId.toLowerCase())
        )
    }

    return result
}

/* ── Auto-Cycling Image Carousel ───────────────────────────── */
function ImageCarousel({ images, productName, soldOut }) {
    const [activeIdx, setActiveIdx] = useState(0)
    const [hovered, setHovered] = useState(false)
    const intervalRef = useRef(null)
    const imgs = images?.length > 0 ? images : []
    const hasMultiple = imgs.length > 1

    // Auto-cycle: always cycle every 3s if multiple images, speed up on hover
    useEffect(() => {
        if (!hasMultiple) return
        const delay = hovered ? 1800 : 3000
        intervalRef.current = setInterval(() => {
            setActiveIdx(prev => (prev + 1) % imgs.length)
        }, delay)
        return () => clearInterval(intervalRef.current)
    }, [hasMultiple, hovered, imgs.length])

    if (imgs.length === 0) {
        return <div className="dsc-img-placeholder">👕</div>
    }

    return (
        <div
            className="dsc-carousel"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.img
                    key={activeIdx}
                    src={imgs[activeIdx]}
                    alt={`${productName} – view ${activeIdx + 1}`}
                    className="dsc-img"
                    loading="lazy"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.45, ease: 'easeInOut' }}
                    onError={e => { e.target.style.opacity = '0' }}
                />
            </AnimatePresence>

            {/* Dot indicators */}
            {hasMultiple && (
                <div className="dsc-dots">
                    {imgs.map((_, i) => (
                        <button
                            key={i}
                            className={`dsc-dot${i === activeIdx ? ' active' : ''}`}
                            onClick={e => { e.preventDefault(); e.stopPropagation(); setActiveIdx(i) }}
                            aria-label={`View image ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/* ── Product Card ───────────────────────────────────────────── */
function DropShopCard({ product, index, reduced }) {
    const { addItem } = useCart()
    const { isWishlisted, toggleWishlist } = useWishlist()
    const wishlisted = isWishlisted(product._id)

    const images = product.images || []
    const price = product.discountedPrice || product.price
    const mrp = product.price
    const d = calcDisc(price, mrp)
    const stock = product.stock ?? 99
    const inStock = product.inStock !== false && !product.soldOut && stock > 0
    const lowStock = inStock && stock < 10
    const sellingFast = inStock && stock <= 5
    const sizes = product.sizes?.filter(s => s.stock > 0) || []
    const firstSize = sizes[0]?.size || 'M'

    // Dynamic badge
    const badge = product.soldOut ? { label: 'SOLD OUT', cls: 'badge--sold' }
        : sellingFast ? { label: '🔥 HOT', cls: 'badge--hot' }
        : lowStock ? { label: 'LIMITED', cls: 'badge--limited' }
        : product.bestSeller ? { label: 'BEST', cls: 'badge--best' }
        : d >= 30 ? { label: `−${d}%`, cls: 'badge--sale' }
        : null

    // Parse emotional subtext from description or generate from name
    const subtext = product.story?.trim()?.split('\n')?.[0]
        || product.description?.trim()?.split('.')[0]
        || null

    return (
        <motion.div
            className={`dsc${product.soldOut ? ' dsc--sold' : ''}`}
            initial={reduced ? {} : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
        >
            <Link to={`/product/${product._id}`} className="dsc-link">
                <div className="dsc-img-wrap">
                    <ImageCarousel
                        images={images}
                        productName={product.name}
                        soldOut={product.soldOut}
                    />

                    {/* Stock warning TOP LEFT */}
                    {lowStock && inStock && (
                        <span className="dsc-stock-badge">
                            ⚡ ONLY {stock} LEFT
                        </span>
                    )}
                    {product.soldOut && (
                        <span className="dsc-stock-badge dsc-stock-badge--sold">SOLD OUT</span>
                    )}

                    {/* Type badge TOP RIGHT */}
                    {badge && (
                        <span className={`dsc-badge ${badge.cls}`}>{badge.label}</span>
                    )}

                    {/* Overlay actions */}
                    <div className="dsc-overlay">
                        <button
                            className={`dsc-wl${wishlisted ? ' active' : ''}`}
                            onClick={e => { e.preventDefault(); toggleWishlist(product) }}
                            aria-label="Wishlist"
                        >
                            <FiHeart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
                        </button>
                        {inStock && (
                            <button
                                className="dsc-add"
                                onClick={e => { e.preventDefault(); addItem(product, firstSize) }}
                                aria-label="Add to cart"
                            >
                                <FiShoppingBag size={13} /> Add to Drop
                            </button>
                        )}
                    </div>
                </div>

                <div className="dsc-info">
                    <p className="dsc-cat">{product.category}</p>
                    <h3 className="dsc-name">{product.name}</h3>
                    {subtext && <p className="dsc-subtext">"{subtext}"</p>}
                    <div className="dsc-price-row">
                        <span className="dsc-price">{fmt(price)}</span>
                        {d > 0 && <span className="dsc-mrp">{fmt(mrp)}</span>}
                        {sellingFast && (
                            <span className="dsc-selling-fast">Selling fast</span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

/* ── Scroll Interrupter Block ───────────────────────────────── */
function Interrupter({ block }) {
    if (block.type === 'drop-alert') {
        return (
            <motion.div
                className="interrupter interrupter--alert"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <span className="interrupter-eyebrow">{block.eyebrow}</span>
                <h2 className="interrupter-headline">{block.headline}</h2>
                <p className="interrupter-sub">{block.sub}</p>
                <a href={block.cta} target="_blank" rel="noopener noreferrer" className="interrupter-btn">
                    <FaWhatsapp size={18} /> Get Notified
                </a>
            </motion.div>
        )
    }

    return (
        <motion.div
            className={`interrupter interrupter--${block.type}`}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <span className="interrupter-eyebrow">{block.eyebrow}</span>
            <h2 className="interrupter-headline" style={{ whiteSpace: 'pre-line' }}>{block.headline}</h2>
            <p className="interrupter-sub">{block.sub}</p>
        </motion.div>
    )
}

/* ── Empty State ────────────────────────────────────────────── */
function EmptyDrop({ onClear }) {
    return (
        <motion.div
            className="shop-empty"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="shop-empty-icon">⚽</div>
            <h2 className="shop-empty-title">Nothing here… yet.</h2>
            <p className="shop-empty-sub">Real fans wait for the next drop.</p>
            <button className="shop-empty-btn" onClick={onClear}>
                Clear filters
            </button>
        </motion.div>
    )
}

/* ── Build mixed content (products + interrupters) ─────────── */
function buildFeed(products) {
    const feed = []
    let storyIdx = 0
    for (let i = 0; i < products.length; i++) {
        feed.push({ type: 'product', data: products[i], index: i })
        // Insert interrupter after every 6 products
        if ((i + 1) % 6 === 0 && storyIdx < STORY_BLOCKS.length) {
            feed.push({ type: 'interrupter', data: STORY_BLOCKS[storyIdx++] })
        }
    }
    return feed
}

/* ════════════════════════════════════════════════════════════
   MAIN SHOP PAGE
   ════════════════════════════════════════════════════════════ */
export default function Shop() {
    const reduced = useReducedMotion()
    const [searchParams, setSearchParams] = useSearchParams()
    const { products, categories, loading } = useProducts()
    const { totalItems, openCart } = useCart()

    const [activeChip, setActiveChip] = useState(
        searchParams.get('chip') || decodeURIComponent(searchParams.get('category') || '') || 'all'
    )
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [showFilterBar, setShowFilterBar] = useState(false)
    const [displayCount, setDisplayCount] = useState(PRODUCTS_PER_PAGE)

    const searchRef = useRef(null)
    const loaderRef = useRef(null)

    // Filter products client-side (all loaded)
    const filtered = filterProducts(products, activeChip, search, categories)
    const displayed = filtered.slice(0, displayCount)
    const hasMore = displayed.length < filtered.length
    const feed = buildFeed(displayed)

    // Sync search to URL
    const handleSearch = useCallback((val) => {
        setSearch(val)
        setDisplayCount(PRODUCTS_PER_PAGE)
        const p = new URLSearchParams(searchParams)
        val ? p.set('search', val) : p.delete('search')
        setSearchParams(p, { replace: true })
    }, [searchParams, setSearchParams])

    const handleChip = (id) => {
        setActiveChip(id)
        setDisplayCount(PRODUCTS_PER_PAGE)
    }

    const clearAll = () => {
        setActiveChip('all')
        setSearch('')
        setDisplayCount(PRODUCTS_PER_PAGE)
        setSearchParams({}, { replace: true })
    }

    // Infinite scroll sentinel
    useEffect(() => {
        if (!loaderRef.current || !hasMore) return
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) setDisplayCount(c => c + PRODUCTS_PER_PAGE)
        }, { rootMargin: '300px' })
        obs.observe(loaderRef.current)
        return () => obs.disconnect()
    }, [hasMore, displayed.length])

    return (
        <div className="shop-page-v2">
            {/* ── Urgency bar ── */}
            <UrgencyBar />

            {/* ── Micro hero ── */}
            <DropHero total={filtered.length} loading={loading} />

            {/* ── Search + Filter ── */}
            <div className="shop-controls">
                {/* Search bar */}
                <div className="shop-search-wrap">
                    <FiSearch size={15} className="shop-search-icon" />
                    <input
                        ref={searchRef}
                        type="search"
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                        placeholder="Search jerseys, clubs, legends…"
                        className="shop-search-input"
                    />
                    {search && (
                        <button className="shop-search-clear" onClick={() => handleSearch('')}>
                            <FiX size={13} />
                        </button>
                    )}
                </div>

                {/* Real categories from admin — only ones with an image */}
                <div className="shop-chips">
                    <button
                        className={`shop-chip${activeChip === 'all' ? ' active' : ''}`}
                        onClick={() => handleChip('all')}
                    >
                        ⚡ All
                    </button>
                    {(categories || [])
                        .filter(cat => cat.image && cat.image.trim() !== '')
                        .map(cat => (
                            <button
                                key={cat._id || cat.name}
                                className={`shop-chip${activeChip === cat.name.toLowerCase() ? ' active' : ''}`}
                                onClick={() => handleChip(cat.name.toLowerCase())}
                            >
                                {cat.name}
                            </button>
                        ))}
                </div>

                {/* Result count */}
                {!loading && (
                    <p className="shop-result-count">
                        {filtered.length === 0
                            ? 'No jerseys found'
                            : `${filtered.length} ${filtered.length === 1 ? 'jersey' : 'jerseys'} in the drop`
                        }
                        {(search || activeChip !== 'all') && (
                            <button className="shop-clear-link" onClick={clearAll}>Clear</button>
                        )}
                    </p>
                )}
            </div>

            {/* ── Product feed ── */}
            <div className="shop-feed-wrap">
                {loading ? (
                    <div className="shop-grid-v2">
                        {Array(8).fill(0).map((_, i) => (
                            <div key={i}><Skeleton.Card /></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyDrop onClear={clearAll} />
                ) : (
                    <>
                        <div className="shop-feed">
                            {feed.map((item, i) =>
                                item.type === 'product' ? (
                                    <div key={item.data._id} className="shop-feed-card">
                                        <DropShopCard
                                            product={item.data}
                                            index={item.index}
                                            reduced={reduced}
                                        />
                                    </div>
                                ) : (
                                    <div key={`int-${i}`} className="shop-feed-interrupter">
                                        <Interrupter block={item.data} />
                                    </div>
                                )
                            )}
                        </div>

                        {/* Load more sentinel */}
                        {hasMore && (
                            <div ref={loaderRef} className="shop-load-more">
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    style={{ color: 'var(--noir-40)', fontFamily: "'Inter', sans-serif", fontSize: 13 }}
                                >
                                    Loading more drops…
                                </motion.div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* End of content */}
        </div>
    )
}
