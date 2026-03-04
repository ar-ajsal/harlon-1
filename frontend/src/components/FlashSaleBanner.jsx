/**
 * FlashSaleBanner — Sticky countdown banner for flash sales
 * Admin sets: VITE_FLASH_SALE_END (ISO date), VITE_FLASH_SALE_TEXT
 * Or stored in localStorage as harlon_flash_sale = { endTime, text, discount }
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiZap } from 'react-icons/fi'

function getFlashSale() {
    try {
        const stored = localStorage.getItem('harlon_flash_sale')
        if (stored) {
            const data = JSON.parse(stored)
            if (new Date(data.endTime) > new Date()) return data
            // expired — clean up
            localStorage.removeItem('harlon_flash_sale')
        }
    } catch { }
    return null
}

function useCountdown(endTime) {
    const [timeLeft, setTimeLeft] = useState(null)

    useEffect(() => {
        if (!endTime) return
        const tick = () => {
            const diff = new Date(endTime) - new Date()
            if (diff <= 0) { setTimeLeft(null); return }
            const h = Math.floor(diff / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft({ h, m, s })
        }
        tick()
        const id = setInterval(tick, 1000)
        return () => clearInterval(id)
    }, [endTime])

    return timeLeft
}

function Seg({ val, label }) {
    return (
        <div className="fsb-seg">
            <span className="fsb-seg-num">{String(val).padStart(2, '0')}</span>
            <span className="fsb-seg-label">{label}</span>
        </div>
    )
}

export default function FlashSaleBanner() {
    const [sale, setSale] = useState(null)
    const [dismissed, setDismissed] = useState(false)
    const timeLeft = useCountdown(sale?.endTime)

    useEffect(() => {
        const s = getFlashSale()
        setSale(s)

        // Listen for storage changes (admin sets from dashboard)
        const handler = () => setSale(getFlashSale())
        window.addEventListener('storage', handler)
        // Also poll every 5s (same-tab admin update)
        const id = setInterval(() => setSale(getFlashSale()), 5000)
        return () => { window.removeEventListener('storage', handler); clearInterval(id) }
    }, [])

    if (!sale || !timeLeft || dismissed) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fsb-banner"
                initial={{ y: -56, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -56, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
                <div className="fsb-inner">
                    <span className="fsb-icon" aria-hidden="true"><FiZap /></span>
                    <span className="fsb-text">
                        {sale.text || 'Flash Sale'}{sale.discount ? ` — ${sale.discount}% OFF` : ''}
                    </span>
                    <div className="fsb-countdown" aria-label="Time remaining">
                        <Seg val={timeLeft.h} label="hr" />
                        <span className="fsb-colon">:</span>
                        <Seg val={timeLeft.m} label="min" />
                        <span className="fsb-colon">:</span>
                        <Seg val={timeLeft.s} label="sec" />
                    </div>
                    <Link to="/shop" className="fsb-shop-btn">Shop Now →</Link>
                    <button
                        className="fsb-close"
                        onClick={() => setDismissed(true)}
                        aria-label="Dismiss flash sale banner"
                    >
                        <FiX size={14} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
