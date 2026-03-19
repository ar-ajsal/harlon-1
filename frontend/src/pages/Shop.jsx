/**
 * Harlon — Shop Page
 * Premium mobile-first product browser
 * Now powered by Algolia React InstantSearch
 */
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiSearch, FiX, FiShoppingBag, FiHeart } from 'react-icons/fi'
import { useWishlist } from '../context/WishlistContext'
import Skeleton from '../components/ui/Skeleton'
import { useProducts } from '../context/ProductContext'

import { liteClient } from 'algoliasearch/lite'
import { 
    InstantSearch, 
    useSearchBox, 
    useInfiniteHits, 
    useStats,
    useMenu,
    Configure
} from 'react-instantsearch'
import axios from 'axios'
import { productsApi } from '../services/api' // Existing api hook

import '../styles/home.css'

/* ─── ALGOLIA CLIENT OR BACKEND FALLBACK ─── */
const APP_ID = import.meta.env.VITE_ALGOLIA_APP_ID;
const SEARCH_KEY = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

let searchClient;
let isMockClient = false;

if (APP_ID && SEARCH_KEY) {
    // Has real algolia keys
    searchClient = liteClient(APP_ID, SEARCH_KEY);
} else {
    // Fallback Mock Client — Translates React InstantSearch requests to your local backend API!
    isMockClient = true;
    searchClient = {
        async search(requests) {
            const results = await Promise.all(
                requests.map(async (req) => {
                    const query = req.params?.query || '';
                    const categoryFilter = req.params?.facetFilters ? req.params.facetFilters.find(f => Array.isArray(f) && f[0].startsWith('category:'))?.[0]?.split(':')[1] : '';
                    const page = req.params?.page !== undefined ? req.params.page + 1 : 1;
                    
                    const res = await productsApi.getAll({ 
                        search: query, 
                        category: categoryFilter,
                        page,
                        limit: req.params?.hitsPerPage || 12
                    });
                    
                    const data = res.data?.data || res.data || [];
                    const total = res.data?.pagination?.total || data.length;
                    const pages = res.data?.pagination?.pages || Math.ceil(total/12);
                    
                    return {
                        hits: data.map(item => ({ ...item, objectID: item._id.toString() })),
                        nbHits: total,
                        nbPages: pages,
                        page: page - 1,
                        hitsPerPage: req.params?.hitsPerPage || 12,
                        processingTimeMS: 15,
                        query: query,
                        facets: {},
                    };
                })
            );
            return { results };
        }
    };
}

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const disc = (p, o) => o && p < o ? Math.round((1 - p / o) * 100) : 0

const cardV = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
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
    // Product comes from Algolia or Mongo, handle both ID fields
    const productId = product.objectID || product._id
    const wishlisted = isWishlisted(productId)

    return (
        <Link
            to={`/product/${productId}`}
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
                <button
                    className={`hh-wish-btn${wishlisted ? ' wishlisted' : ''}`}
                    onClick={(e) => { e.preventDefault(); toggleWishlist({ ...product, _id: productId }) }}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <FiHeart size={14} />
                </button>
                {sold && <div className="hh-sold-ribbon" aria-hidden="true">⛔ Sold Out</div>}
                {!sold && <span className="hh-quick-btn" aria-hidden="true"><FiShoppingBag size={14} /></span>}
            </div>
            <div className="hh-product-info">
                <p className="hh-product-cat">{product.category}</p>
                <h3 className="hh-product-name">{product.name}</h3>
                <div className="hh-product-price-row">
                    <span className="hh-price">{fmt(product.price)}</span>
                    {product.originalPrice > product.price && (
                        <span className="hh-price-orig">{fmt(product.originalPrice)}</span>
                    )}
                    {d >= 5 && !sold && <span className="hh-price-off">{d}% off</span>}
                </div>
            </div>
        </Link>
    )
}

/* ─── Formatted Custom InstantSearch Components ─── */

function CustomSearchBox() {
    const { query, refine, clear } = useSearchBox();

    return (
        <div style={{ position: 'relative', maxWidth: 480 }}>
            <FiSearch
                size={16}
                style={{
                    position: 'absolute', left: 16, top: '50%',
                    transform: 'translateY(-50%)', color: '#999', pointerEvents: 'none',
                }}
            />
            <input
                type="search"
                value={query}
                onChange={e => refine(e.target.value)}
                placeholder="Search jerseys, clubs, nations…"
                style={{
                    width: '100%', padding: '13px 44px', borderRadius: 99,
                    border: '1.5px solid #E5E5E5', background: '#fff',
                    fontFamily: "'Inter', sans-serif", fontSize: 14, color: '#0A0A0A',
                    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'hsl(38,65%,55%)'}
                onBlur={e => e.target.style.borderColor = '#E5E5E5'}
            />
            <AnimatePresence>
                {query && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        onClick={clear}
                        style={{
                            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                            background: '#EEE', border: 'none', cursor: 'pointer', borderRadius: '50%',
                            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                    >
                        <FiX size={13} />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    )
}

function CustomCategoryMenu() {
    const { refine } = useMenu({ attribute: 'category' });
    const { items } = useMenu({ attribute: 'category' }); // To detect active refinements
    const { categories } = useProducts();
    const shouldReduceMotion = useReducedMotion();

    const activeCat = items.find(item => item.isRefined)?.value || '';

    return (
        <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}
        >
            <button
                onClick={() => refine('')}
                style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 13,
                    fontWeight: !activeCat ? 700 : 500, padding: '9px 18px',
                    borderRadius: 99, border: `1.5px solid ${!activeCat ? 'hsl(38,65%,55%)' : '#E5E5E5'}`,
                    background: !activeCat ? 'hsl(38,65%,55%)' : '#fff',
                    color: !activeCat ? '#0A0A0A' : '#555', cursor: 'pointer',
                    minHeight: 40, transition: 'all 0.18s ease',
                    boxShadow: !activeCat ? '0 2px 12px hsl(38,65%,55%,0.28)' : 'none',
                }}
            >
                All Products
            </button>

            {/* Fallback to original categories DB list + active state mapping */}
            {(categories || []).map(c => {
                const isActive = activeCat.toLowerCase() === c.name.toLowerCase();
                return (
                    <button
                        key={c._id || c.name}
                        onClick={() => refine(c.name)}
                        style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 13,
                            fontWeight: isActive ? 700 : 500, padding: '9px 18px',
                            borderRadius: 99, border: `1.5px solid ${isActive ? 'hsl(38,65%,55%)' : '#E5E5E5'}`,
                            background: isActive ? 'hsl(38,65%,55%)' : '#fff',
                            color: isActive ? '#0A0A0A' : '#555', cursor: 'pointer',
                            minHeight: 40, transition: 'all 0.18s ease',
                            boxShadow: isActive ? '0 2px 12px hsl(38,65%,55%,0.28)' : 'none',
                        }}
                    >
                        {c.name}
                    </button>
                )
            })}
        </motion.div>
    )
}

function CustomStats() {
    const { nbHits, processingTimeMS } = useStats();
    
    return (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: '#999', marginBottom: 24, minHeight: 20 }}>
            {nbHits === 0 ? 'No jerseys found' : `${nbHits} hits found in ${processingTimeMS}ms`}
        </p>
    )
}

function AlgoliaHitsGrid() {
    const { hits, isLastPage, showMore } = useInfiniteHits();
    const loaderRef = useRef(null);

    useEffect(() => {
        const currentLoader = loaderRef.current;
        if (!currentLoader || isLastPage) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isLastPage) {
                showMore();
            }
        }, { rootMargin: '200px' });

        observer.observe(currentLoader);
        return () => observer.unobserve(currentLoader);
    }, [isLastPage, showMore]);

    if (hits.length === 0) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '80px 20px' }}>
                <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: '#0A0A0A' }}>
                    Nothing found
                </h3>
                <p style={{ color: '#999', fontSize: 14 }}>Try a different search or category.</p>
            </motion.div>
        )
    }

    // Explicitly stripping nested opacity stagger variants that got stuck on mount.
    // Let raw robust CSS Grid handling take over visibility.
    return (
        <>
            <motion.div
                className="hh-product-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {hits.map((p, idx) => (
                    <motion.div 
                        key={p.objectID} 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                    >
                        <ShopCard product={p} />
                    </motion.div>
                ))}
            </motion.div>

            {!isLastPage && (
                <div ref={loaderRef} style={{ display: 'flex', justifyContent: 'center', marginTop: 40, paddingBottom: 40 }}>
                    <div style={{ color: '#999', fontSize: 14, fontFamily: "'Inter', sans-serif" }}>
                        Loading more jerseys...
                    </div>
                </div>
            )}
        </>
    )
}

/* ─── Main Shop Page Shell ──────────────────────────────── */
export default function Shop() {
    const shouldReduceMotion = useReducedMotion()

    return (
        <InstantSearch searchClient={searchClient} indexName="products" routing={true}>
            <Configure hitsPerPage={12} filters="isVisible:true" />
            
            <div className="shop-page">
                <section style={{ paddingTop: '100px', paddingBottom: '60px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 20px' }}>
                        
                        {/* Header */}
                        <motion.div
                            initial={shouldReduceMotion ? {} : { opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ marginBottom: 32 }}
                        >
                            <p className="hh-section-eyebrow" style={{ marginBottom: 6 }}>The Collection</p>
                            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(32px, 7vw, 52px)', color: '#0A0A0A', margin: '0 0 10px' }}>
                                All Jerseys
                            </h1>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: '#777', margin: 0 }}>
                                Fast global search powered by Algolia
                            </p>
                        </motion.div>

                        {/* Search & Categories */}
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <CustomSearchBox />
                        </motion.div>
                        
                        <div style={{ marginTop: 20 }}>
                            <CustomCategoryMenu />
                        </div>

                        <CustomStats />
                        <AlgoliaHitsGrid />

                    </div>
                </section>
            </div>
        </InstantSearch>
    )
}
