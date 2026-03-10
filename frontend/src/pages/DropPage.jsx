import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import './DropPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function useCountdown(targetDate) {
    const getTimeLeft = useCallback(() => {
        const diff = new Date(targetDate) - Date.now()
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
        return {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
            expired: false
        }
    }, [targetDate])

    const [timeLeft, setTimeLeft] = useState(getTimeLeft)
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000)
        return () => clearInterval(timer)
    }, [getTimeLeft])
    return timeLeft
}

function DropCard({ drop }) {
    const now = new Date()
    const isLive = new Date(drop.dropStartTime) <= now && new Date(drop.dropEndTime) >= now
    const isUpcoming = new Date(drop.dropStartTime) > now
    const remaining = drop.dropQuantity - (drop.dropSold || 0)
    const stockPct = drop.dropQuantity > 0 ? Math.max(0, (remaining / drop.dropQuantity) * 100) : 100
    const countdown = useCountdown(isUpcoming ? drop.dropStartTime : drop.dropEndTime)
    const [viewCount] = useState(() => Math.floor(Math.random() * 80) + 20)
    const [remindForm, setRemindForm] = useState(false)
    const [remindData, setRemindData] = useState({ email: '', phone: '' })
    const [submitting, setSubmitting] = useState(false)

    const handleRemind = async (e) => {
        e.preventDefault()
        if (!remindData.email && !remindData.phone) {
            toast.error('Enter email or WhatsApp number')
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch(`${API}/drops/${drop._id}/remind`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(remindData)
            })
            const data = await res.json()
            if (data.success) {
                toast.success('🔔 You\'ll be notified when the drop goes live!')
                setRemindForm(false)
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Failed to subscribe')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className={`drop-card ${isLive ? 'drop-live' : ''} ${remaining === 0 ? 'drop-soldout' : ''}`}>
            {isLive && <div className="drop-live-pulse"><span className="live-dot" />LIVE DROP</div>}
            {remaining === 0 && <div className="drop-soldout-overlay"><span>SOLD OUT</span></div>}

            <div className="drop-card-image">
                <img
                    src={drop.images?.[0] || '/placeholder-jersey.jpg'}
                    alt={drop.name}
                    loading="lazy"
                />
                {isLive && (
                    <div className="drop-viewers">
                        <span className="viewer-dot" />
                        {viewCount} viewing now
                    </div>
                )}
            </div>

            <div className="drop-card-info">
                <span className="drop-category">{drop.category}</span>
                <h3 className="drop-name">{drop.name}</h3>
                <div className="drop-price">
                    ₹{drop.price?.toLocaleString()}
                    {drop.originalPrice && <span className="drop-og-price">₹{drop.originalPrice?.toLocaleString()}</span>}
                </div>

                {/* Countdown */}
                {!countdown.expired && (
                    <div className="drop-countdown">
                        <p className="countdown-label">{isLive ? 'Drop ends in' : 'Drop starts in'}</p>
                        <div className="countdown-grid">
                            {countdown.days > 0 && <div className="cd-unit"><span>{String(countdown.days).padStart(2, '0')}</span><label>Days</label></div>}
                            <div className="cd-unit"><span>{String(countdown.hours).padStart(2, '0')}</span><label>Hrs</label></div>
                            <div className="cd-unit"><span>{String(countdown.minutes).padStart(2, '0')}</span><label>Min</label></div>
                            <div className="cd-unit"><span>{String(countdown.seconds).padStart(2, '0')}</span><label>Sec</label></div>
                        </div>
                    </div>
                )}

                {/* Stock bar (live drops only) */}
                {isLive && drop.dropQuantity > 0 && (
                    <div className="drop-stock">
                        <div className="stock-bar">
                            <div className="stock-fill" style={{ width: `${stockPct}%`, background: stockPct < 20 ? '#ff4444' : '#00ff87' }} />
                        </div>
                        <p className="stock-label">{remaining} / {drop.dropQuantity} remaining</p>
                    </div>
                )}

                {/* Actions */}
                <div className="drop-actions">
                    {isLive && remaining > 0 && (
                        <Link to={`/product/${drop._id}`} className="drop-btn-buy">
                            Grab It Now ⚡
                        </Link>
                    )}
                    {isUpcoming && (
                        <>
                            <button className="drop-btn-remind" onClick={() => setRemindForm(v => !v)}>
                                🔔 Remind Me
                            </button>
                            {remindForm && (
                                <form className="remind-form" onSubmit={handleRemind}>
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={remindData.email}
                                        onChange={e => setRemindData(d => ({ ...d, email: e.target.value }))}
                                    />
                                    <input
                                        type="tel"
                                        placeholder="WhatsApp number"
                                        value={remindData.phone}
                                        onChange={e => setRemindData(d => ({ ...d, phone: e.target.value }))}
                                    />
                                    <button type="submit" disabled={submitting}>
                                        {submitting ? 'Subscribing...' : 'Subscribe'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}
                    {remaining === 0 && (
                        <button className="drop-btn-soldout" disabled>⚡ Sold Out</button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function DropPage() {
    const [drops, setDrops] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API}/drops/active`)
            .then(r => r.json())
            .then(data => { if (data.success) setDrops(data.data) })
            .catch(() => toast.error('Could not load drops'))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="drop-page">
            <div className="drop-hero">
                <div className="drop-hero-content">
                    <div className="drop-hero-badge">⚡ LIMITED DROPS</div>
                    <h1>Matchday<br /><span className="drop-hero-accent">Drop Zone</span></h1>
                    <p>Exclusive jersey drops. Limited quantities. Matchday only.</p>
                </div>
                <div className="drop-hero-glow" />
            </div>

            <div className="drop-page-body">
                {loading ? (
                    <div className="drop-skeleton-grid">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="drop-skeleton">
                                <div className="skeleton-img shimmer" />
                                <div className="skeleton-line shimmer" style={{ width: '60%' }} />
                                <div className="skeleton-line shimmer" style={{ width: '40%' }} />
                            </div>
                        ))}
                    </div>
                ) : drops.length === 0 ? (
                    <div className="drop-empty">
                        <div className="drop-empty-icon">🏟️</div>
                        <h2>No drops active right now</h2>
                        <p>Follow us on Instagram for drop alerts</p>
                        <Link to="/shop" className="drop-btn-browse">Browse All Jerseys</Link>
                    </div>
                ) : (
                    <div className="drop-grid">
                        {drops.map(drop => <DropCard key={drop._id} drop={drop} />)}
                    </div>
                )}
            </div>
        </div>
    )
}
