import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import './MysteryBoxPage.css'

const MYSTERY_PRODUCT = {
    _id: 'mystery-box-001',
    name: 'Mystery Jersey Box',
    price: 1499,
    originalPrice: 2999,
    productType: 'mystery-box',
    images: [],
    category: 'Mystery Box'
}

const POSSIBLE_REWARDS = [
    { icon: '👑', label: 'Rare Retro Jersey', desc: 'A vintage classic from the 80s-90s era' },
    { icon: '⭐', label: 'Current Club Jersey', desc: 'Latest season home or away kit' },
    { icon: '🏆', label: 'Legend Edition', desc: 'Legendary player special edition jersey' },
    { icon: '🔥', label: 'Last-Drop Jersey', desc: 'An exclusive matchday drop jersey' },
]

function UnboxingReveal({ onClose }) {
    const [phase, setPhase] = useState('shake') // shake → open → reveal
    const [reward] = useState(() => POSSIBLE_REWARDS[Math.floor(Math.random() * POSSIBLE_REWARDS.length)])

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('open'), 1500)
        const t2 = setTimeout(() => setPhase('reveal'), 3000)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    return (
        <div className="unboxing-overlay">
            <div className="unboxing-container">
                <div className={`mystery-box-3d phase-${phase}`}>
                    <div className="box-face box-top">
                        <div className="box-question">?</div>
                    </div>
                    <div className="box-face box-front" />
                    <div className="box-face box-back" />
                    <div className="box-face box-left" />
                    <div className="box-face box-right" />
                    <div className="box-face box-bottom" />
                </div>
                {phase === 'reveal' && (
                    <div className="unboxing-reveal animate-pop">
                        <div className="confetti-wrap">
                            {[...Array(20)].map((_, i) => (
                                <span key={i} className="confetti-piece" style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                    background: ['#FFD700', '#00ff87', '#ff6b6b', '#a78bfa', '#38bdf8'][i % 5]
                                }} />
                            ))}
                        </div>
                        <div className="reward-icon">{reward.icon}</div>
                        <h2>You Got!</h2>
                        <h3 className="reward-name">{reward.label}</h3>
                        <p className="reward-desc">{reward.desc}</p>
                        <p className="reward-note">We'll contact you to choose your exact jersey</p>
                        <button className="unbox-close-btn" onClick={onClose}>
                            Shop More
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function MysteryBoxPage() {
    const { addToCart } = useCart()
    const [showUnboxing, setShowUnboxing] = useState(false)
    const [selectedSize, setSelectedSize] = useState('M')

    const handleAddToCart = () => {
        addToCart({ ...MYSTERY_PRODUCT, selectedSize }, 1)
        toast.success('Mystery Box added to cart!')
    }

    const handleBuyNow = () => {
        addToCart({ ...MYSTERY_PRODUCT, selectedSize }, 1)
        setShowUnboxing(true)
    }

    return (
        <div className="mystery-page">
            {showUnboxing && <UnboxingReveal onClose={() => setShowUnboxing(false)} />}

            <div className="mystery-hero">
                <div className="mystery-stars">
                    {[...Array(30)].map((_, i) => (
                        <span key={i} className="mystery-star" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: 'auto',
                            aspectRatio: '1'
                        }} />
                    ))}
                </div>
                <div className="mystery-hero-content">
                    <div className="mystery-badge">🎁 EXCLUSIVE DROP</div>
                    <h1>Mystery<br /><span className="mystery-accent">Jersey Box</span></h1>
                    <p>One box. Infinite possibilities. A surprise jersey chosen just for you.</p>
                </div>
            </div>

            <div className="mystery-body">
                {/* Product Card */}
                <div className="mystery-product-card">
                    <div className="mystery-box-preview">
                        <div className="preview-box">
                            <div className="preview-box-face preview-box-top"><span>?</span></div>
                            <div className="preview-box-face preview-box-front" />
                            <div className="preview-box-face preview-box-back" />
                            <div className="preview-box-face preview-box-left" />
                            <div className="preview-box-face preview-box-right" />
                            <div className="preview-box-face preview-box-bottom" />
                        </div>
                    </div>
                    <div className="mystery-product-info">
                        <span className="mystery-tag">Limited Edition</span>
                        <h2>Mystery Jersey Box</h2>
                        <div className="mystery-price">
                            <span className="price-current">₹1,499</span>
                            <span className="price-original">₹2,999</span>
                            <span className="price-save">Save 50%</span>
                        </div>
                        <div className="mystery-size-pick">
                            <p className="size-label">Your Size</p>
                            <div className="size-opts">
                                {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                    <button
                                        key={s}
                                        className={`size-opt ${selectedSize === s ? 'size-active' : ''}`}
                                        onClick={() => setSelectedSize(s)}
                                    >{s}</button>
                                ))}
                            </div>
                        </div>
                        <div className="mystery-actions">
                            <button className="mystery-btn-cart" onClick={handleAddToCart}>Add to Cart</button>
                            <button className="mystery-btn-buy" onClick={handleBuyNow}>
                                Open Now ✨
                            </button>
                        </div>
                        <div className="mystery-guarantee">
                            <span>🔒 Guaranteed jersey value ₹2,000+</span>
                            <span>🚀 Ships in 2-3 days</span>
                            <span>♻️ No returns (it's a surprise!)</span>
                        </div>
                    </div>
                </div>

                {/* Possible rewards */}
                <div className="mystery-rewards">
                    <h2 className="section-title">What's Inside?</h2>
                    <p className="section-sub">Every Mystery Box contains one of these exclusive jersey types</p>
                    <div className="rewards-grid">
                        {POSSIBLE_REWARDS.map((r, i) => (
                            <div key={i} className="reward-card">
                                <div className="reward-card-icon">{r.icon}</div>
                                <h3>{r.label}</h3>
                                <p>{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How it works */}
                <div className="mystery-how">
                    <h2 className="section-title">How It Works</h2>
                    <div className="how-steps">
                        {[
                            { n: '01', title: 'Select Your Size', desc: 'Choose S / M / L / XL / XXL' },
                            { n: '02', title: 'Place Your Order', desc: 'Complete checkout securely' },
                            { n: '03', title: 'We Pick Your Jersey', desc: 'Our team curates a surprise for you' },
                            { n: '04', title: 'Unbox & Enjoy', desc: 'Receive your mystery jersey in 2-3 days' },
                        ].map(s => (
                            <div key={s.n} className="how-step">
                                <div className="how-step-num">{s.n}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
