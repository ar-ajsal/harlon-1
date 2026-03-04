/**
 * JerseyOfTheDay — Premium daily spotlight card on homepage
 * Admin picks a product ID stored in localStorage: harlon_jotd = { productId, setAt }
 * Falls back to auto-picking the highest rated / featured product of the day
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiStar } from 'react-icons/fi'

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

function getJotdId() {
    try {
        const stored = localStorage.getItem('harlon_jotd')
        if (stored) {
            const data = JSON.parse(stored)
            // Valid for today
            const today = new Date().toDateString()
            if (data.setAt === today && data.productId) return data.productId
        }
    } catch { }
    return null
}

export default function JerseyOfTheDay({ products }) {
    const [jotd, setJotd] = useState(null)

    useEffect(() => {
        if (!products?.length) return

        const savedId = getJotdId()
        let pick = null

        if (savedId) {
            pick = products.find(p => p._id === savedId)
        }

        // Fallback: auto-pick best seller, then featured, then first visible
        if (!pick) {
            pick = products.find(p => p.bestSeller && !p.soldOut)
                || products.find(p => p.featured && !p.soldOut)
                || products.find(p => p.isVisible !== false && !p.soldOut)
        }

        if (pick) setJotd(pick)
    }, [products])

    if (!jotd) return null

    const disc = jotd.originalPrice && jotd.price < jotd.originalPrice
        ? Math.round((1 - jotd.price / jotd.originalPrice) * 100)
        : 0

    return (
        <section className="jotd-section" aria-label="Jersey of the Day">
            <div className="jotd-inner">
                {/* Left: info */}
                <motion.div
                    className="jotd-copy"
                    initial={{ opacity: 0, x: -32 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="jotd-badge">
                        <FiStar size={12} />
                        <span>Jersey of the Day</span>
                    </div>
                    <h2 className="jotd-title">{jotd.name}</h2>
                    <p className="jotd-category">{jotd.category}</p>
                    <div className="jotd-price-row">
                        <span className="jotd-price">{fmt(jotd.price)}</span>
                        {jotd.originalPrice > jotd.price && (
                            <span className="jotd-orig">{fmt(jotd.originalPrice)}</span>
                        )}
                        {disc >= 5 && (
                            <span className="jotd-disc">{disc}% OFF</span>
                        )}
                    </div>
                    {jotd.description && (
                        <p className="jotd-desc">
                            {jotd.description.length > 120
                                ? jotd.description.slice(0, 120) + '…'
                                : jotd.description}
                        </p>
                    )}
                    <div className="jotd-sizes">
                        {(jotd.sizes || []).map(s => (
                            <span key={s} className="jotd-size-chip">{s}</span>
                        ))}
                    </div>
                    <Link to={`/product/${jotd._id}`} className="jotd-cta">
                        View Jersey <FiArrowRight aria-hidden="true" />
                    </Link>
                </motion.div>

                {/* Right: image */}
                <motion.div
                    className="jotd-media"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="jotd-img-wrap">
                        <img
                            src={jotd.images?.[0] || '/images/placeholder.jpg'}
                            alt={jotd.name}
                            loading="lazy"
                        />
                        <div className="jotd-glow" aria-hidden="true" />
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
