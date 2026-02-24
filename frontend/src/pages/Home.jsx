/**
 * Harlon — Home Page
 * Nike-level, mobile-first premium experience
 * Concept B: "The Legend Wears This"
 *
 * Sections:
 *  1. Hero         — gold headline, floating chips, scroll indicator
 *  2. TrustMarquee — dark CSS-animated strip, zero JS
 *  3. CategoryStrip — horizontal scroll snap
 *  4. FeaturedDrops — 2-col mobile / 4-col desktop stagger grid
 *  5. SocialProof  — 3 animated stats on black
 *  6. UrgencyBand  — pulsing gold strip
 *  7. FooterCTA    — dark full-width shop CTA
 *  +  StickyBar    — mobile bottom bar (IntersectionObserver)
 */
import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { FiArrowRight, FiShoppingBag } from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'
import { WHATSAPP_NUMBER, buildWhatsAppUrl } from '../config/constants'
import Skeleton from '../components/ui/Skeleton'
import '../styles/home.css'

/* ─── Animation helpers ────────────────────────────────────── */
const mk = (y = 24, duration = 0.5) => ({
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration, ease: [0.16, 1, 0.3, 1] } },
})

const stagger = (delay = 0.08) => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: delay, delayChildren: 0.05 } },
})

const chipAnim = {
    hidden: { opacity: 0, scale: 0.8, y: 10 },
    visible: {
        opacity: 1, scale: 1, y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 18, delay: 0.55 }
    },
}

/* ─── Price formatter ──────────────────────────────────────── */
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const discount = (p, o) => o && p < o ? Math.round((1 - p / o) * 100) : 0

/* ===================================================================
   SECTION COMPONENTS
   =================================================================== */

/* 1. HERO ────────────────────────────────────────────────────────── */
function HeroSection({ products, shouldReduceMotion }) {
    const heroImage = products.find(p => p.featured && p.images?.[0])?.images?.[0]
        || products[0]?.images?.[0]
        || '/images/placeholder.jpg'

    const visible = visibleCount(products)

    return (
        <section className="hh-hero" aria-label="Hero">
            <div className="hh-hero-inner">

                {/* ── Left: copy ── */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={shouldReduceMotion ? {} : stagger(0.1)}
                >
                    <motion.span
                        variants={shouldReduceMotion ? {} : mk(16, 0.4)}
                        className="hh-eyebrow"
                    >
                        <span className="hh-eyebrow-dot" aria-hidden="true" />
                        India's No.1 Retro Jersey Store
                    </motion.span>

                    <motion.h1
                        variants={shouldReduceMotion ? {} : mk(32, 0.55)}
                        className="hh-headline"
                    >
                        The Legend
                        <span className="hh-headline-gold">Wears This.</span>
                    </motion.h1>

                    <motion.p
                        variants={shouldReduceMotion ? {} : mk(24, 0.5)}
                        className="hh-sub"
                    >
                        Authentic retro football jerseys. Handpicked.
                        India-shipped. Yours.
                    </motion.p>

                    <motion.div
                        variants={shouldReduceMotion ? {} : mk(20, 0.45)}
                        className="hh-ctas"
                    >
                        <Link to="/shop" className="hh-btn-primary" id="hero-shop-cta">
                            Explore Drops <FiArrowRight aria-hidden="true" />
                        </Link>
                        <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hh-btn-wa"
                            aria-label="Order on WhatsApp"
                        >
                            <FaWhatsapp aria-hidden="true" /> Order Now
                        </a>
                    </motion.div>

                    <motion.div
                        variants={shouldReduceMotion ? {} : mk(16, 0.4)}
                        className="hh-trust-chips"
                        aria-label="Trust badges"
                    >
                        {[
                            { icon: '🔒', text: 'Secure' },
                            { icon: '🚚', text: 'Free Delivery ₹999+' },
                            { icon: '↩️', text: '7-Day Returns' },
                            { icon: '✅', text: '100% Authentic' },
                        ].map(({ icon, text }) => (
                            <span key={text} className="hh-trust-chip">
                                <span aria-hidden="true">{icon}</span> {text}
                            </span>
                        ))}
                    </motion.div>
                </motion.div>

                {/* ── Right: image ── */}
                <motion.div
                    className="hh-hero-media"
                    initial={shouldReduceMotion ? {} : { opacity: 0, x: 32, scale: 0.94 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="hh-hero-image-frame">
                        {/* LCP — eager, no animation wrapper */}
                        <img
                            src={heroImage}
                            alt="Premium retro football jersey"
                            loading="eager"
                            fetchPriority="high"
                            width={440}
                            height={550}
                        />
                    </div>

                    {/* Floating stat chips */}
                    <motion.div
                        className="hh-float-chip hh-float-chip-stock"
                        variants={shouldReduceMotion ? {} : chipAnim}
                        initial="hidden"
                        animate="visible"
                        aria-label={`${visible} jerseys in stock`}
                    >
                        <span className="hh-float-chip-dot" aria-hidden="true" />
                        {visible > 0 ? `${visible} in stock` : 'Live inventory'}
                    </motion.div>

                    <motion.div
                        className="hh-float-chip hh-float-chip-ship"
                        variants={shouldReduceMotion ? {} : { ...chipAnim, visible: { ...chipAnim.visible, transition: { ...chipAnim.visible.transition, delay: 0.7 } } }}
                        initial="hidden"
                        animate="visible"
                        aria-label="Ships in 24 hours"
                    >
                        <span className="hh-float-chip-lightning" aria-hidden="true">⚡</span>
                        Ships in 24h
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <div className="hh-scroll-indicator" aria-hidden="true">
                <svg width={20} height={20} fill="none" viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth={1.8}
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>scroll</span>
            </div>
        </section>
    )
}

/* 2. TRUST MARQUEE ────────────────────────────────────────────────── */
const TRUST_ITEMS = [
    { icon: '🔒', text: 'Secure Payments' },
    { icon: '🚚', text: 'Free Delivery ₹999+' },
    { icon: '⚽', text: '100% Authentic' },
    { icon: '↩️', text: '7-Day Easy Returns' },
    { icon: '⚡', text: 'Ships in 24 Hours' },
    { icon: '🇮🇳', text: 'Made for India' },
]

function TrustMarquee() {
    // Duplicate items for seamless loop
    const doubled = [...TRUST_ITEMS, ...TRUST_ITEMS]
    return (
        <div className="hh-trust-bar" aria-label="Trust signals" role="complementary">
            <div className="hh-trust-track" aria-hidden="true">
                {[1, 2].map((pass) => (
                    <div key={pass} className="hh-trust-inner">
                        {TRUST_ITEMS.map(({ icon, text }, i) => (
                            <div key={i} className="hh-trust-item">
                                <span className="hh-trust-item-icon">{icon}</span>
                                {text}
                            </div>
                        ))}
                        <span className="hh-trust-item-sep">◆</span>
                    </div>
                ))}
            </div>
            {/* Screen-reader version */}
            <ul style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}>
                {TRUST_ITEMS.map(({ text }) => <li key={text}>{text}</li>)}
            </ul>
        </div>
    )
}

/* 3. CATEGORY STRIP ───────────────────────────────────────────────── */
function CategoryStrip({ categories, products, shouldReduceMotion }) {
    if (!categories?.length) return null

    return (
        <section className="hh-categories">
            <div className="hh-categories-header">
                <div>
                    <p className="hh-section-eyebrow">Collections</p>
                    <h2 className="hh-section-title">Shop by Category</h2>
                </div>
                <Link to="/shop" className="hh-view-all" aria-label="View all categories">
                    All Categories <FiArrowRight aria-hidden="true" />
                </Link>
            </div>

            <div className="hh-cat-strip" role="list">
                {categories.map((cat, i) => {
                    const img = cat.image
                        || products.find(p => p.category === cat.name && !p.soldOut)?.images?.[0]
                        || '/images/placeholder.jpg'
                    return (
                        <motion.div
                            key={cat._id}
                            role="listitem"
                            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Link
                                to={`/shop?category=${cat.slug}`}
                                className="hh-cat-card"
                                aria-label={`Browse ${cat.name}`}
                            >
                                <img
                                    src={img}
                                    alt={cat.name}
                                    loading="lazy"
                                    width={300}
                                    height={400}
                                />
                                <div className="hh-cat-overlay">
                                    <h3 className="hh-cat-name">{cat.name}</h3>
                                    <span className="hh-cat-cta">
                                        Shop Now <FiArrowRight size={11} aria-hidden="true" />
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    )
}

/* 4. PRODUCT GRID (reusable for both Featured + All) ──────────────── */
function ProductCard({ product, shouldReduceMotion }) {
    const disc = discount(product.price, product.originalPrice)
    const isSoldOut = !!product.soldOut

    return (
        <Link
            to={`/product/${product._id}`}
            className="hh-product-card"
            aria-label={`${product.name}${isSoldOut ? ' — Sold Out' : ''}, ${fmt(product.price)}`}
            tabIndex={0}
        >
            <div className="hh-product-img-wrap">
                <img
                    src={product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    loading="lazy"
                    width={300}
                    height={400}
                    style={isSoldOut ? { opacity: 0.5, filter: 'grayscale(50%)' } : undefined}
                />

                {/* Badges */}
                {isSoldOut
                    ? <span className="hh-product-badge hh-product-badge--sold">Sold Out</span>
                    : product.bestSeller
                        ? <span className="hh-product-badge hh-product-badge--best">⭐ Best Seller</span>
                        : disc >= 8
                            ? <span className="hh-product-badge hh-product-badge--sale">{disc}% OFF</span>
                            : null
                }

                {/* Sold-out bottom strip */}
                {isSoldOut && (
                    <div className="hh-sold-ribbon" aria-hidden="true">⛔ Sold Out</div>
                )}

                {/* Quick-view tap hint (desktop hover only) */}
                {!isSoldOut && (
                    <span className="hh-quick-btn" aria-hidden="true">
                        <FiShoppingBag size={15} />
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
                    {disc >= 5 && !isSoldOut && (
                        <span className="hh-price-off">{disc}% off</span>
                    )}
                </div>
            </div>
        </Link>
    )
}

function ProductSection({ title, products, eyebrow, bg, id, shouldReduceMotion }) {
    return (
        <section id={id} className={`hh-section${bg ? ' hh-section--alt' : ''}`}>
            <div className="hh-section-inner">
                <div className="hh-section-head">
                    <div>
                        {eyebrow && <p className="hh-section-eyebrow">{eyebrow}</p>}
                        <motion.h2
                            className="hh-section-title"
                            initial={shouldReduceMotion ? {} : { opacity: 0, x: -16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                        >
                            {title}
                        </motion.h2>
                    </div>
                    <Link to="/shop" className="hh-view-all">
                        View All <FiArrowRight aria-hidden="true" />
                    </Link>
                </div>

                <motion.div
                    className="hh-product-grid"
                    initial={shouldReduceMotion ? {} : 'hidden'}
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.05 }}
                    variants={stagger(0.07)}
                >
                    {products.map(p => (
                        <motion.div
                            key={p._id}
                            variants={shouldReduceMotion ? {} : mk(28, 0.45)}
                        >
                            <ProductCard product={p} shouldReduceMotion={shouldReduceMotion} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}

/* 5. SOCIAL PROOF ─────────────────────────────────────────────────── */
function SocialProof({ productCount, shouldReduceMotion }) {
    const stats = [
        { num: `${Math.max(productCount, 1)}+`, label: 'Jerseys in Collection' },
        { num: '500+', label: 'Happy Indian Fans' },
        { num: '4.9★', label: 'Customer Rating' },
    ]
    return (
        <section className="hh-social-strip" aria-label="Social proof stats">
            <motion.div
                className="hh-social-inner"
                initial={shouldReduceMotion ? {} : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={stagger(0.12)}
            >
                {stats.map(({ num, label }, i) => (
                    <motion.div
                        key={label}
                        className="hh-social-stat"
                        variants={shouldReduceMotion ? {} : mk(20, 0.5)}
                    >
                        <span className="hh-social-stat-num" aria-label={num}>{num}</span>
                        <span className="hh-social-stat-label">{label}</span>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    )
}

/* 6. URGENCY BAND ─────────────────────────────────────────────────── */
function UrgencyBand() {
    return (
        <div className="hh-urgency" role="alert" aria-live="polite">
            <span className="hh-urgency-emoji" aria-hidden="true">⚡</span>
            <p className="hh-urgency-text">
                Limited Stock — Jerseys selling fast this week
            </p>
            <Link to="/shop" className="hh-urgency-link">
                Shop Now →
            </Link>
        </div>
    )
}

/* 7. FOOTER CTA BAND ──────────────────────────────────────────────── */
function FooterCTABand({ shouldReduceMotion }) {
    return (
        <section className="hh-footer-cta" aria-label="Final call to action" id="footer-cta">
            <motion.div
                className="hh-footer-cta-inner"
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                <span className="hh-footer-cta-eyebrow">Your jersey is waiting</span>
                <h2 className="hh-footer-cta-title">
                    Find Your <span>Jersey.</span>
                </h2>
                <p className="hh-footer-cta-sub">
                    Browse the full collection. India-shipped, fast.
                </p>
                <div className="hh-footer-cta-btns">
                    <Link to="/shop" className="hh-footer-btn-primary">
                        Explore All Jerseys <FiArrowRight aria-hidden="true" />
                    </Link>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hh-footer-btn-ghost"
                        aria-label="Order directly on WhatsApp"
                    >
                        <FaWhatsapp aria-hidden="true" /> WhatsApp Order
                    </a>
                </div>
            </motion.div>
        </section>
    )
}

/* STICKY BOTTOM BAR ───────────────────────────────────────────────── */
function StickyBar({ show }) {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="hh-sticky-cta"
                    role="complementary"
                    aria-label="Shop CTA"
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                >
                    <div className="hh-sticky-cta-text">
                        <span className="hh-sticky-cta-label">Premium Retro Jerseys</span>
                        <span className="hh-sticky-cta-sub">Free delivery ₹999+</span>
                    </div>
                    <Link to="/shop" className="hh-sticky-cta-btn">
                        Shop <FiArrowRight aria-hidden="true" />
                    </Link>
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hh-sticky-cta-wa"
                        aria-label="Order on WhatsApp"
                    >
                        <FaWhatsapp aria-hidden="true" />
                    </a>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

/* ─── Helper ───────────────────────────────────────────────── */
function visibleCount(products) {
    return products.filter(p => p.isVisible !== false && !p.soldOut).length
}

/* ===================================================================
   MAIN PAGE
   =================================================================== */
export default function Home() {
    const { products, categories, loading, error } = useProducts()
    const shouldReduceMotion = useReducedMotion()

    // Sticky CTA — shown when hero CTA has scrolled out of view
    // Hidden again when footer CTA enters view
    const [showSticky, setShowSticky] = useState(false)
    const heroCTARef = useRef(null)
    const footerCTARef = useRef(null)

    useEffect(() => {
        const heroCTAEl = document.getElementById('hero-shop-cta')
        const footerCTAEl = document.getElementById('footer-cta')
        if (!heroCTAEl || !footerCTAEl) return

        const io = new IntersectionObserver((entries) => {
            const heroCTA = entries.find(e => e.target === heroCTAEl)
            const footerCTA = entries.find(e => e.target === footerCTAEl)

            if (heroCTA) setShowSticky(v => heroCTA.isIntersecting ? false : v)
            if (footerCTA) setShowSticky(v => footerCTA.isIntersecting ? false : v)

            // When hero CTA leaves view — show bar
            if (heroCTA && !heroCTA.isIntersecting) setShowSticky(true)
            // When footer enters — hide bar
            if (footerCTA && footerCTA.isIntersecting) setShowSticky(false)
        }, { threshold: 0.1 })

        io.observe(heroCTAEl)
        io.observe(footerCTAEl)
        return () => io.disconnect()
    }, [loading])

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="home">
                <section className="hh-hero" aria-busy="true">
                    <div className="hh-hero-inner">
                        {/* Text skeleton */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="hl-shimmer" style={{ height: 24, width: 160, borderRadius: 99 }} />
                            <div className="hl-shimmer" style={{ height: 72, width: '85%', borderRadius: 10 }} />
                            <div className="hl-shimmer" style={{ height: 72, width: '55%', borderRadius: 10 }} />
                            <div className="hl-shimmer" style={{ height: 20, width: '70%', borderRadius: 6 }} />
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                <div className="hl-shimmer" style={{ height: 52, width: 180, borderRadius: 99 }} />
                                <div className="hl-shimmer" style={{ height: 52, width: 190, borderRadius: 99 }} />
                            </div>
                        </div>
                        {/* Image skeleton */}
                        <div>
                            <div className="hl-shimmer" style={{
                                width: '100%', maxWidth: 400, aspectRatio: '4/5',
                                borderRadius: 32, margin: '0 auto'
                            }} />
                        </div>
                    </div>
                </section>
                <section className="hh-section hh-section--alt">
                    <div className="hh-section-inner">
                        <div className="hl-shimmer" style={{ height: 36, width: 200, borderRadius: 8, marginBottom: 28 }} />
                        <Skeleton.ProductGrid count={4} />
                    </div>
                </section>
            </div>
        )
    }

    /* ── Error ── */
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>⚠️</p>
                <h2 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800, fontSize: 28,
                    marginBottom: 8, color: '#0A0A0A'
                }}>
                    Cannot connect
                </h2>
                <p style={{ color: '#777', marginBottom: 28 }}>{error}</p>
                <button className="hh-btn-primary" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        )
    }

    /* ── Derived data ── */
    const visible = products.filter(p => p.isVisible !== false)
    const featured = visible.filter(p => p.featured).slice(0, 4)
    const allShow = visible.filter(p => !featured.includes(p)).slice(0, 4)

    return (
        <div className="home">

            {/* 1 ── Hero */}
            <HeroSection
                products={visible}
                shouldReduceMotion={shouldReduceMotion}
            />

            {/* 2 ── Trust Marquee */}
            <TrustMarquee />

            {/* 3 ── Categories */}
            <CategoryStrip
                categories={categories}
                products={visible}
                shouldReduceMotion={shouldReduceMotion}
            />

            {/* 4 ── Featured Drops */}
            {featured.length > 0 && (
                <ProductSection
                    id="featured-drops"
                    title="Featured Drops"
                    eyebrow="🔥 Crowd Favourites"
                    products={featured}
                    shouldReduceMotion={shouldReduceMotion}
                />
            )}

            {/* 5 ── Social Proof */}
            <SocialProof
                productCount={visible.length}
                shouldReduceMotion={shouldReduceMotion}
            />

            {/* 6 ── Urgency */}
            <UrgencyBand />

            {/* 4b ── More Jerseys */}
            {allShow.length > 0 && (
                <ProductSection
                    title="More Jerseys"
                    eyebrow="Browse the Collection"
                    products={allShow}
                    bg
                    shouldReduceMotion={shouldReduceMotion}
                />
            )}

            {/* 7 ── Footer CTA Band */}
            <FooterCTABand shouldReduceMotion={shouldReduceMotion} />

            {/* Sticky Bottom CTA (mobile) */}
            {!shouldReduceMotion && <StickyBar show={showSticky} />}

        </div>
    )
}
