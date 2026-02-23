import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ProductGallery({ images = [], selected = 0, onSelect, alt = '' }) {
    const [zoomed, setZoomed] = useState(false)

    const validImages = images?.length > 0 ? images : ['/images/placeholder.jpg']
    const activeIdx = Math.min(selected, validImages.length - 1)

    return (
        <div className="product-gallery">
            {/* Main image */}
            <div
                className="product-gallery__main"
                onClick={() => setZoomed(z => !z)}
                title={zoomed ? 'Click to zoom out' : 'Click to zoom in'}
                style={{ cursor: 'zoom-in', position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#f3f4f6', aspectRatio: '1/1' }}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeIdx}
                        src={validImages[activeIdx]}
                        alt={`${alt} – view ${activeIdx + 1}`}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: zoomed ? 1.15 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { e.target.src = '/images/placeholder.jpg' }}
                    />
                </AnimatePresence>

                {/* Badge: multiple images */}
                {validImages.length > 1 && (
                    <span style={{
                        position: 'absolute', bottom: 10, right: 10,
                        background: 'rgba(0,0,0,0.55)', color: '#fff',
                        borderRadius: 999, fontSize: 11, padding: '2px 8px', fontWeight: 600
                    }}>
                        {activeIdx + 1} / {validImages.length}
                    </span>
                )}
            </div>

            {/* Thumbnails */}
            {validImages.length > 1 && (
                <div className="product-gallery__thumbs" style={{
                    display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto', paddingBottom: 4
                }}>
                    {validImages.map((src, i) => (
                        <motion.button
                            key={i}
                            type="button"
                            onClick={() => { onSelect?.(i); setZoomed(false) }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`View image ${i + 1}`}
                            style={{
                                flexShrink: 0, width: 64, height: 64, borderRadius: 8,
                                overflow: 'hidden', border: i === activeIdx ? '2px solid #1a1a2e' : '2px solid transparent',
                                cursor: 'pointer', padding: 0, background: '#f3f4f6', transition: 'border-color 0.2s'
                            }}
                        >
                            <img
                                src={src} alt={`Thumbnail ${i + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.src = '/images/placeholder.jpg' }}
                            />
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductGallery
