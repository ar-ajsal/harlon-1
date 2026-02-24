import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

function ProductGallery({ images = [], selected = 0, onSelect, alt = '' }) {
    const [zoomed, setZoomed] = useState(false)
    const [lightbox, setLightbox] = useState(false)
    const prefersReduced = useReducedMotion()

    const validImages = images?.length > 0 ? images : ['/images/placeholder.jpg']
    const activeIdx = Math.min(selected, validImages.length - 1)

    // ── Touch swipe ──────────────────────────────────────────────────
    const touchStart = useRef(null)
    const touchEnd = useRef(null)
    const MIN_SWIPE = 40

    const handleTouchStart = useCallback((e) => {
        touchStart.current = e.targetTouches[0].clientX
        touchEnd.current = null
    }, [])

    const handleTouchMove = useCallback((e) => {
        touchEnd.current = e.targetTouches[0].clientX
    }, [])

    const handleTouchEnd = useCallback(() => {
        if (!touchStart.current || !touchEnd.current) return
        const dist = touchStart.current - touchEnd.current
        if (Math.abs(dist) < MIN_SWIPE) return
        if (dist > 0) {
            // swiped left → next
            onSelect?.(activeIdx < validImages.length - 1 ? activeIdx + 1 : 0)
        } else {
            // swiped right → prev
            onSelect?.(activeIdx > 0 ? activeIdx - 1 : validImages.length - 1)
        }
    }, [activeIdx, validImages.length, onSelect])

    const handleMainClick = () => {
        if (window.innerWidth >= 768) {
            setZoomed(z => !z)
        } else {
            setLightbox(true)
        }
    }

    const variants = prefersReduced
        ? {}
        : { initial: { opacity: 0, scale: 0.98 }, animate: { opacity: 1, scale: zoomed ? 1.15 : 1 }, exit: { opacity: 0 } }

    return (
        <div className="pd-gallery">
            {/* ── Main image ───────────────────────────────── */}
            <div
                className={`pd-gallery-main${zoomed ? ' zoomed' : ''}`}
                onClick={handleMainClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                title={zoomed ? 'Click to zoom out' : 'Click to zoom in'}
                aria-label="Product image"
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeIdx}
                        src={validImages[activeIdx]}
                        alt={`${alt} — view ${activeIdx + 1}`}
                        {...(prefersReduced ? {} : {
                            initial: { opacity: 0, scale: 0.97 },
                            animate: { opacity: 1, scale: zoomed ? 1.15 : 1 },
                            exit: { opacity: 0 },
                            transition: { duration: 0.25 }
                        })}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                        loading="eager"
                        onError={e => { e.target.src = '/images/placeholder.jpg' }}
                    />
                </AnimatePresence>

                {/* Count badge (desktop) */}
                {validImages.length > 1 && (
                    <span className="pd-gallery-count">
                        {activeIdx + 1} / {validImages.length}
                    </span>
                )}

                {/* Prev / Next (desktop) */}
                {validImages.length > 1 && (
                    <>
                        <button
                            className="pd-gallery-prev"
                            onClick={e => { e.stopPropagation(); onSelect?.(activeIdx > 0 ? activeIdx - 1 : validImages.length - 1) }}
                            aria-label="Previous image"
                        >‹</button>
                        <button
                            className="pd-gallery-next"
                            onClick={e => { e.stopPropagation(); onSelect?.(activeIdx < validImages.length - 1 ? activeIdx + 1 : 0) }}
                            aria-label="Next image"
                        >›</button>
                    </>
                )}
            </div>

            {/* ── Dot indicators (mobile) ─────────────────── */}
            {validImages.length > 1 && (
                <div className="pd-gallery-dots" aria-hidden>
                    {validImages.map((_, i) => (
                        <button
                            key={i}
                            className={`pd-gallery-dot${i === activeIdx ? ' active' : ''}`}
                            onClick={() => onSelect?.(i)}
                            aria-label={`Go to image ${i + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* ── Thumbnails ───────────────────────────────── */}
            {validImages.length > 1 && (
                <div className="pd-gallery-thumbs">
                    {validImages.map((src, i) => (
                        <motion.button
                            key={i}
                            type="button"
                            className={`pd-thumb${i === activeIdx ? ' active' : ''}`}
                            onClick={() => { onSelect?.(i); setZoomed(false) }}
                            whileTap={prefersReduced ? {} : { scale: 0.95 }}
                            aria-label={`View image ${i + 1}`}
                        >
                            <img
                                src={src}
                                alt={`Thumbnail ${i + 1}`}
                                loading="lazy"
                                onError={e => { e.target.src = '/images/placeholder.jpg' }}
                            />
                        </motion.button>
                    ))}
                </div>
            )}

            {/* ── Lightbox overlay (mobile) ─────────────────── */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        className="pd-lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(false)}
                    >
                        <motion.img
                            src={validImages[activeIdx]}
                            alt={`${alt} — full view`}
                            initial={prefersReduced ? {} : { scale: 0.85 }}
                            animate={{ scale: 1 }}
                            exit={prefersReduced ? {} : { scale: 0.85 }}
                            transition={{ duration: 0.25 }}
                        />
                        <button className="pd-lightbox-close" aria-label="Close fullscreen">✕</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProductGallery
