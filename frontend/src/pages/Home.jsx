/**
 * HARLON — HOME PAGE
 * Hero: DripDrip-style infinite horizontal photo marquee
 * Portrait cards (5:9) auto-scroll on white background
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { FiArrowRight, FiShoppingBag, FiHeart, FiZap } from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { WHATSAPP_NUMBER } from '../config/constants'
import Skeleton from '../components/ui/Skeleton'
import '../styles/home.css'
import '../styles/hero-slider.css'

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const discount = (p, o) => o && p < o ? Math.round((1 - p / o) * 100) : 0

const mk = (y = 24, duration = 0.5) => ({
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration, ease: [0.16, 1, 0.3, 1] } },
})
const stagger = (delay = 0.08) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: delay, delayChildren: 0.05 } },
})

/* ─── Branded Error State ──────────────────────────────────── */
function LegendaryError({ onRetry }) {
    return (
        <div className="home-error-state">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="home-error-inner"
            >
                <div className="home-error-logo">HARLON</div>
                <div className="home-error-icon">⚽</div>
                <h1 className="home-error-title">Even legends rest.</h1>
                <p className="home-error-sub">We'll be back. The drop is worth the wait.</p>
                <button className="home-error-retry" onClick={onRetry}>
                    <FiZap size={16} /> Try Again
                </button>
            </motion.div>
        </div>
    )
}

/* ─── Hero Marquee — DripDrip Clone ───────────────────────── */
/* Infinite horizontal scroll of portrait model photos         */
/* Admin uploads via /admin/slider. Fallback: product images   */
function HeroMarquee({ products }) {
    const [adminSlides, setAdminSlides] = useState(null)

    // Fetch admin-uploaded slides
    useEffect(() => {
        const base = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '') + '/api'
        fetch(`${base}/slider`)
            .then(r => r.json())
            .then(res => setAdminSlides(res.success ? (res.slides || []) : []))
            .catch(() => setAdminSlides([]))
    }, [])

    // Build image list: admin slides → product images
    const rawImages = (() => {
        if (adminSlides && adminSlides.length > 0) {
            return adminSlides.map(s => ({ id: s._id, url: s.url, link: s.link || '/shop' }))
        }
        return (products || [])
            .filter(p => p.images?.[0])
            .slice(0, 12)
            .map(p => ({ id: p._id, url: p.images[0], link: `/product/${p._id}` }))
    })()

    // Nothing to show yet
    if (adminSlides === null || rawImages.length === 0) {
        return (
            <section className="dd-marquee-section" style={{ paddingBottom: 24, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Link to="/shop" style={{
                    fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 12,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    background: '#0a0a0a', color: '#fff',
                    padding: '13px 28px', borderRadius: 2, textDecoration: 'none'
                }}>
                    SHOP THE DROP →
                </Link>
            </section>
        )
    }

    // Duplicate cards for seamless infinite loop (exactly like DripDrip)
    const track = [...rawImages, ...rawImages]

    return (
        <section className="dd-marquee-section" aria-label="Featured drops">
            <div className="dd-marquee-container">
                <div className="dd-marquee-track">
                    {track.map((img, i) => (
                        <Link
                            key={`${img.id}-${i}`}
                            to={img.link}
                            className="dd-card"
                            tabIndex={i >= rawImages.length ? -1 : 0}
                            aria-hidden={i >= rawImages.length}
                        >
                            <div className="dd-card-aspect">
                                <img
                                    src={img.url}
                                    alt="Drop"
                                    className="dd-card-img"
                                    loading={i < 4 ? 'eager' : 'lazy'}
                                    fetchPriority={i < 4 ? 'high' : 'auto'}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

/* ─── Trust Bar (3 icons, DripDrip style) ──────────────────── */
const TRUST_ITEMS = [
    '🏆 India\'s No.1 Retro Jersey Store',
    '⚡ 10,000+ Fans Suited Up',
    '🔒 100% Authentic Fabrics',
    '🚀 Ships Pan India',
    '💬 WhatsApp Support',
    '✅ Zero Fake Prints',
]

function TrustMarquee() {
    return (
        <div className="cvt-marquee-bar">
            <div className="cvt-marquee-track">
                {[...TRUST_ITEMS, ...TRUST_ITEMS].map((t, i) => (
                    <span key={i} className="cvt-marquee-item">{t}</span>
                ))}
            </div>
        </div>
    )
}

/* ─── Category Cards Section ───────────────────────────────── */
function CategoryCardsSection({ categories, products, reduced }) {
    if (!categories || categories.length === 0) return null

    const cards = categories.map(cat => {
        const fallbackProduct = products?.find(p => p.category === cat.name && p.images?.length > 0)
        return {
            id: encodeURIComponent(cat.name.toLowerCase()),
            name: cat.name,
            img: cat.image || fallbackProduct?.images?.[0] || null,
        }
    })

    const infiniteCards = [...cards, ...cards, ...cards, ...cards]

    return (
        <section className="cvt-moments" aria-label="Shop by Category">
            <div className="cvt-section-header">
                <span className="cvt-section-eyebrow">THE COLLECTION</span>
                <h2 className="cvt-section-title">Shop by<br /><em>Category.</em></h2>
                <p className="cvt-section-desc">Find the exact era, club, or legend you're looking for.</p>
            </div>

            <div className="cvt-moments-scroll-wrap">
                <div className="cvt-moments-track cvt-auto-slider">
                    <div className="cvt-moments-group">
                        {infiniteCards.map((card, i) => (
                            <Link to={`/shop?chip=${card.id}`} key={`g1-${i}`} className="cvt-moment-card">
                                <div className="cvt-moment-img-wrap">
                                    {card.img ? (
                                        <img src={card.img} alt={card.name} className="cvt-moment-img" />
                                    ) : (
                                        <div className="cvt-moment-placeholder" style={{ background: '#222' }}>
                                            <span style={{ color: '#555', fontSize: 32 }}>⚽</span>
                                        </div>
                                    )}
                                    <div className="cvt-moment-overlay">
                                        <span className="cvt-moment-tag">CATEGORY</span>
                                        <h3 className="cvt-moment-label">{card.name}</h3>
                                        <p className="cvt-moment-story">Authentic retro drops.</p>
                                        <span className="cvt-moment-cta">Explore <FiArrowRight size={12} /></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="cvt-moments-group" aria-hidden="true">
                        {infiniteCards.map((card, i) => (
                            <Link to={`/shop?chip=${card.id}`} key={`g2-${i}`} className="cvt-moment-card" tabIndex="-1">
                                <div className="cvt-moment-img-wrap">
                                    {card.img ? (
                                        <img src={card.img} alt={card.name} className="cvt-moment-img" />
                                    ) : (
                                        <div className="cvt-moment-placeholder" style={{ background: '#222' }}>
                                            <span style={{ color: '#555', fontSize: 32 }}>⚽</span>
                                        </div>
                                    )}
                                    <div className="cvt-moment-overlay">
                                        <span className="cvt-moment-tag">CATEGORY</span>
                                        <h3 className="cvt-moment-label">{card.name}</h3>
                                        <p className="cvt-moment-story">Authentic retro drops.</p>
                                        <span className="cvt-moment-cta">Explore <FiArrowRight size={12} /></span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ─── Drop Product Card ─────────────────────────────────────── */
function DropCard({ product, reduced }) {
    const { addItem } = useCart()
    const { addToWishlist, isWishlisted } = useWishlist()
    const img = product.images?.[0] || ''
    const price = product.discountedPrice || product.price
    const mrp = product.price
    const disc = discount(price, mrp)
    const stock = product.stock ?? 99
    const inStock = product.inStock !== false && stock > 0
    const lowStock = inStock && stock < 10
    const sellingFast = inStock && stock <= 5
    const sizes = product.sizes?.filter(s => s.stock > 0) || []
    const firstSize = sizes[0]?.size || 'M'
    const wishlisted = isWishlisted(product._id)

    const handleAddCart = useCallback((e) => {
        e.preventDefault()
        addItem(product, firstSize)
    }, [product, firstSize, addItem])

    return (
        <motion.div
            className="cvt-drop-card"
            initial={reduced ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
        >
            <Link to={`/product/${product._id}`} className="cvt-drop-card-link">
                <div className="cvt-drop-img-wrap">
                    {img && <img src={img} alt={product.name} className="cvt-drop-img" loading="lazy" />}
                    {sellingFast && <span className="cvt-badge cvt-badge--fire">🔥 Selling Fast</span>}
                    {!inStock && <span className="cvt-badge cvt-badge--sold">SOLD OUT</span>}
                    {disc > 0 && inStock && !sellingFast && <span className="cvt-badge cvt-badge--sale">−{disc}%</span>}
                    <div className="cvt-drop-overlay">
                        <button
                            className="cvt-drop-wl-btn"
                            onClick={e => { e.preventDefault(); addToWishlist(product) }}
                            aria-label="Save to wishlist"
                        >
                            <FiHeart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                        </button>
                        {inStock && (
                            <button className="cvt-drop-add-btn" onClick={handleAddCart}>
                                <FiShoppingBag size={14} /> Add to Drop
                            </button>
                        )}
                    </div>
                </div>
                <div className="cvt-drop-info">
                    {lowStock && <span className="cvt-stock-pill">⚡ Only {stock} left</span>}
                    <p className="cvt-drop-category">{product.category}</p>
                    <h3 className="cvt-drop-name">{product.name}</h3>
                    <div className="cvt-drop-price-row">
                        <span className="cvt-drop-price">{fmt(price)}</span>
                        {disc > 0 && <span className="cvt-drop-mrp">{fmt(mrp)}</span>}
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}

/* ─── Limited Drop Section ─────────────────────────────────── */
function LimitedDropSection({ products, loading, reduced }) {
    const drops = products.slice(0, 8)
    return (
        <section className="cvt-drops" aria-label="Limited Drop">
            <div className="cvt-drops-header">
                <div>
                    <span className="cvt-section-eyebrow">LIMITED DROP</span>
                    <h2 className="cvt-section-title">The Drop.<br /><em>Right Now.</em></h2>
                </div>
                <div className="cvt-drops-urgency">
                    <div className="cvt-urgency-pill">
                        <span className="cvt-urgency-dot" />
                        No restocks. Ever.
                    </div>
                    <Link to="/shop" className="cvt-view-all">
                        See All Drops <FiArrowRight size={14} />
                    </Link>
                </div>
            </div>
            <div className="cvt-drops-grid">
                {loading
                    ? Array(8).fill(0).map((_, i) => <div key={i} className="cvt-drop-card"><Skeleton.Card /></div>)
                    : drops.map(p => <DropCard key={p._id} product={p} reduced={reduced} />)
                }
            </div>
            {!loading && drops.length > 0 && (
                <div className="cvt-drops-footer">
                    <p className="cvt-drops-footer-txt">Miss this — it's gone forever.</p>
                    <Link to="/shop" className="cvt-cta-primary cvt-cta-primary--outline">
                        View All Drops <FiArrowRight />
                    </Link>
                </div>
            )}
        </section>
    )
}

/* ─── Social Strip ─────────────────────────────────────────── */
function SocialProof() {
    return (
        <section className="cvt-social-strip">
            <div className="cvt-social-inner">
                {[
                    { num: '10,000+', label: 'Fans\nSuited Up' },
                    { num: '50+', label: 'Iconic\nJerseys' },
                    { num: '4.9★', label: 'Average\nRating' },
                ].map(s => (
                    <div key={s.num} className="cvt-stat">
                        <span className="cvt-stat-num">{s.num}</span>
                        <span className="cvt-stat-label">{s.label}</span>
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ─── Footer CTA ───────────────────────────────────────────── */
function FooterCTA() {
    return (
        <section className="cvt-footer-cta">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="cvt-footer-cta-inner"
            >
                <span className="cvt-section-eyebrow">THE IDENTITY</span>
                <h2 className="cvt-footer-headline">
                    Not a fan.<br />
                    <span className="cvt-hero-gold">A Legend.</span>
                </h2>
                <p className="cvt-footer-sub">Every jersey tells a story. What's yours?</p>
                <div className="cvt-footer-ctas">
                    <Link to="/shop" className="cvt-cta-primary">
                        CLAIM YOUR JERSEY <FiArrowRight />
                    </Link>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi HARLON! I want to find my jersey.')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="cvt-cta-wa"
                    >
                        <FaWhatsapp size={20} /> Need help choosing?
                    </a>
                </div>
            </motion.div>
        </section>
    )
}

/* ─── HOME PAGE ────────────────────────────────────────────── */
export default function Home() {
    const { products, categories, loading, error, refreshData } = useProducts()
    const reduced = useReducedMotion()

    if (error) return <LegendaryError onRetry={refreshData} />

    return (
        <main className="home">
            {/* DripDrip-style hero: infinite scrolling portrait photo marquee */}
            <HeroMarquee products={products} />
            <TrustMarquee />
            <CategoryCardsSection categories={categories} products={products} reduced={reduced} />
            <LimitedDropSection products={products} loading={loading} reduced={reduced} />
            <SocialProof />
            <FooterCTA />
        </main>
    )
}
