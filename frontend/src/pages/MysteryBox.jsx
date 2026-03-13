/**
 * MysteryBox — Fan Universe
 * eFootball/PES player card spin reveal experience
 * Dramatic 3D flip → slowdown → reveal with shiny sweep & particles
 */
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'

/* ─── Inline keyframe styles injected once ─── */
const SPIN_KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

@keyframes mb-spin-in {
  0%   { transform: perspective(800px) rotateY(0deg)   scale(0.6); opacity: 0.3; filter: brightness(1.5); }
  15%  { transform: perspective(800px) rotateY(720deg)  scale(0.8); opacity: 0.6; filter: brightness(3); }
  30%  { transform: perspective(800px) rotateY(1440deg) scale(0.9); opacity: 0.8; filter: brightness(4); }
  50%  { transform: perspective(800px) rotateY(2160deg) scale(1.0); opacity: 1;   filter: brightness(6); }
  65%  { transform: perspective(800px) rotateY(2520deg) scale(1.05); opacity: 1;  filter: brightness(4); }
  80%  { transform: perspective(800px) rotateY(2700deg) scale(1.02); opacity: 1;  filter: brightness(2); }
  90%  { transform: perspective(800px) rotateY(2750deg) scale(1.03); opacity: 1;  filter: brightness(1.5); }
  100% { transform: perspective(800px) rotateY(2880deg) scale(1);    opacity: 1;  filter: brightness(1); }
}

@keyframes mb-glare-sweep {
  0%   { left: -100%; opacity: 0; }
  10%  { opacity: 0.8; }
  50%  { left: 120%;  opacity: 0.6; }
  100% { left: 150%;  opacity: 0; }
}

@keyframes mb-shimmer-loop {
  0%   { left: -80%; }
  100% { left: 140%; }
}

@keyframes mb-bg-flash {
  0%   { opacity: 0; }
  20%  { opacity: 0.25; }
  60%  { opacity: 0.12; }
  100% { opacity: 0; }
}

@keyframes mb-border-pulse {
  0%, 100% { box-shadow: 0 0 30px rgba(168,85,247,0.4), 0 0 80px rgba(168,85,247,0.15); }
  50%       { box-shadow: 0 0 60px rgba(168,85,247,0.9), 0 0 140px rgba(168,85,247,0.4), inset 0 0 40px rgba(168,85,247,0.1); }
}

@keyframes mb-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-10px); }
}

@keyframes mb-particle-out {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--px), var(--py)) scale(0); opacity: 0; }
}

@keyframes mb-stars-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1.3); }
}

@keyframes mb-gold-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.mb-spinning {
  animation: mb-spin-in 2.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-style: preserve-3d;
}

.mb-glare {
  position: absolute;
  top: -20%;
  left: -100%;
  width: 60%;
  height: 140%;
  background: linear-gradient(
    105deg,
    transparent 20%,
    rgba(255,255,255,0.05) 35%,
    rgba(255,255,255,0.55) 50%,
    rgba(255,255,255,0.05) 65%,
    transparent 80%
  );
  transform: skewX(-15deg);
  pointer-events: none;
  z-index: 10;
  animation: mb-glare-sweep 2.2s ease-out forwards;
}

.mb-shimmer-loop {
  position: absolute;
  top: -20%;
  left: -80%;
  width: 50%;
  height: 140%;
  background: linear-gradient(
    105deg,
    transparent 30%,
    rgba(255,255,255,0.12) 50%,
    transparent 70%
  );
  transform: skewX(-15deg);
  pointer-events: none;
  z-index: 9;
  animation: mb-shimmer-loop 1.8s ease-in-out infinite;
}

.mb-revealed-card {
  animation: mb-border-pulse 2s ease-in-out infinite, mb-float 4s ease-in-out infinite;
}

.mb-gold-shimmer-text {
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b, #fde68a, #f59e0b);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: mb-gold-shimmer 2s linear infinite;
}
`

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const TIERS = [
    {
        id: 'classic',
        emoji: '📦',
        label: 'Classic Box',
        price: 799,
        description: 'One premium retro jersey — mystery club revealed at delivery! India shipped.',
        color: '#a855f7',
        glow: 'rgba(168,85,247,0.35)',
        border: 'rgba(168,85,247,0.4)',
        bg: 'linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(109,40,217,0.06) 100%)',
    },
    {
        id: 'legend',
        emoji: '🏆',
        label: 'Legend Box',
        price: 1499,
        description: '2 rare retro jerseys — curated combo, guaranteed different clubs.',
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.35)',
        border: 'rgba(245,158,11,0.4)',
        bg: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(180,83,9,0.06) 100%)',
    },
]

const PARTICLE_COLORS = ['#a855f7', '#f59e0b', '#ec4899', '#22d3ee', '#4ade80', '#fff', '#fbbf24']

function SpinParticle({ angle, dist, color, delay, size }) {
    const rad = (angle * Math.PI) / 180
    const px = Math.cos(rad) * dist
    const py = Math.sin(rad) * dist
    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: size,
                height: size,
                borderRadius: size > 8 ? '50%' : 2,
                background: color,
                '--px': `${px}px`,
                '--py': `${py}px`,
                animation: `mb-particle-out ${0.8 + Math.random() * 0.8}s ease-out ${delay}s forwards`,
                zIndex: 50,
                pointerEvents: 'none',
                boxShadow: `0 0 ${size * 2}px ${color}`,
            }}
        />
    )
}

/* ── Star burst ring around card ── */
function StarBurst({ count = 8, radius = 160, color = '#a855f7' }) {
    return (
        <>
            {Array.from({ length: count }, (_, i) => {
                const angle = (i / count) * 360
                const rad = (angle * Math.PI) / 180
                const x = Math.cos(rad) * radius
                const y = Math.sin(rad) * radius
                return (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            fontSize: 18,
                            animation: `mb-stars-twinkle ${0.6 + (i % 3) * 0.3}s ease-in-out ${i * 0.1}s infinite`,
                            zIndex: 20,
                            pointerEvents: 'none',
                        }}
                    >
                        ✦
                    </div>
                )
            })}
        </>
    )
}

export default function MysteryBox() {
    const { products, loading } = useProducts()
    const navigate = useNavigate()
    const shouldReduceMotion = useReducedMotion()

    const [step, setStep] = useState('pick')  // 'pick' | 'size' | 'spinning' | 'reveal'
    const [selectedTier, setSelectedTier] = useState(null)
    const [selectedSize, setSelectedSize] = useState(null)
    const [revealedProduct, setRevealedProduct] = useState(null)
    const [particles, setParticles] = useState([])
    const [bgFlash, setBgFlash] = useState(false)
    const [showCard, setShowCard] = useState(false)

    /* Inject keyframes once */
    useEffect(() => {
        const id = 'mb-keyframes'
        if (!document.getElementById(id)) {
            const s = document.createElement('style')
            s.id = id
            s.textContent = SPIN_KEYFRAMES
            document.head.appendChild(s)
        }
        return () => {}
    }, [])

    function pickProduct() {
        const eligible = products.filter(p => !p.soldOut && p.isVisible !== false)
        return eligible.length ? eligible[Math.floor(Math.random() * eligible.length)] : null
    }

    function handleReveal() {
        const product = pickProduct()
        setRevealedProduct(product)
        setStep('spinning')
        setBgFlash(true)

        // Generate big particle burst
        const pts = Array.from({ length: 36 }, (_, i) => ({
            id: i,
            angle: (i / 36) * 360 + (Math.random() - 0.5) * 20,
            dist: 80 + Math.random() * 180,
            color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
            delay: 1.6 + Math.random() * 0.4,   // fire after spin peaks
            size: 4 + Math.random() * 10,
        }))
        setParticles(pts)

        setTimeout(() => setBgFlash(false), 800)
        setTimeout(() => {
            setShowCard(true)
            setStep('reveal')
        }, 2300)   // Matches mb-spin-in duration
    }

    function handleCheckout() {
        if (!revealedProduct) return
        navigate('/checkout', {
            state: {
                product: revealedProduct,
                selectedSize,
                isMysteryBox: true,
                tierLabel: selectedTier?.label,
                price: selectedTier?.price,
            }
        })
    }

    function resetAll() {
        setStep('pick')
        setSelectedTier(null)
        setSelectedSize(null)
        setRevealedProduct(null)
        setParticles([])
        setShowCard(false)
    }

    const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #06040f 0%, #0a0618 50%, #06040f 100%)',
            paddingTop: 80,
            paddingBottom: 80,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background flash on reveal */}
            {bgFlash && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(168,85,247,0.7) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 5,
                    animation: 'mb-bg-flash 0.8s ease-out forwards',
                }} />
            )}

            {/* Ambient orbs */}
            <div style={{
                position: 'absolute', top: '10%', left: '5%',
                width: 500, height: 500, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '5%', right: '0%',
                width: 600, height: 600, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>

                {/* Back */}
                <Link to="/" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                    fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600,
                    marginBottom: 40, transition: 'color 0.2s',
                }}>
                    <FiArrowLeft size={14} /> Back to Home
                </Link>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: 48 }}
                >
                    <p style={{
                        fontFamily: "'Inter', sans-serif", fontSize: 11,
                        fontWeight: 800, letterSpacing: '3px',
                        color: '#FFD700', textTransform: 'uppercase', marginBottom: 12,
                    }}>🌟 Fan Universe</p>
                    <h1 style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 800,
                        fontSize: 'clamp(36px, 8vw, 60px)',
                        color: '#fff', lineHeight: 1.05,
                        letterSpacing: '-0.03em', margin: '0 0 14px',
                    }}>
                        Mystery{' '}
                        <span style={{
                            background: 'linear-gradient(135deg, #a855f7 30%, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}>Box</span>
                    </h1>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        color: 'rgba(255,255,255,0.45)', fontSize: 15,
                        lineHeight: 1.6, maxWidth: 460, margin: '0 auto',
                    }}>
                        Pick your tier, choose your size — watch your jersey reveal in dramatic style.
                    </p>
                </motion.div>

                {/* Steps */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 10, marginBottom: 44,
                }}>
                    {[['pick', 'Tier'], ['size', 'Size'], ['reveal', 'Reveal']].map(([s, label], i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
                                background: (step === s || (step === 'spinning' && s === 'reveal'))
                                    ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                                    : (i < ['pick', 'size', 'reveal'].indexOf(step))
                                        ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.08)',
                                color: '#fff',
                                border: 'none',
                                transition: 'all 0.3s',
                            }}>{i + 1}</div>
                            <span style={{
                                fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
                                color: step === s ? '#fff' : 'rgba(255,255,255,0.3)',
                                textTransform: 'uppercase', letterSpacing: '1px',
                            }}>{label}</span>
                            {i < 2 && <div style={{ width: 28, height: 1, background: 'rgba(255,255,255,0.08)' }} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">

                    {/* ── STEP 1: Pick Tier ── */}
                    {step === 'pick' && (
                        <motion.div
                            key="pick"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.4 }}
                            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}
                        >
                            {TIERS.map((tier, i) => (
                                <motion.button
                                    key={tier.id}
                                    onClick={() => { setSelectedTier(tier); setStep('size') }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.12 }}
                                    whileHover={{ y: -10, scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    style={{
                                        background: tier.bg,
                                        border: `1px solid ${tier.border}`,
                                        borderRadius: 24, padding: '36px 28px',
                                        cursor: 'pointer', textAlign: 'left', outline: 'none',
                                        boxShadow: `0 8px 40px ${tier.glow}`,
                                        transition: 'box-shadow 0.3s',
                                        position: 'relative', overflow: 'hidden',
                                    }}
                                >
                                    {/* Hover shimmer */}
                                    <div className="mb-shimmer-loop" style={{ borderRadius: 24 }} />
                                    <div style={{ fontSize: 52, marginBottom: 16, lineHeight: 1 }}>{tier.emoji}</div>
                                    <div style={{
                                        display: 'inline-block', fontSize: 10, fontWeight: 800,
                                        letterSpacing: '2px', textTransform: 'uppercase',
                                        color: tier.color, background: `${tier.color}22`,
                                        padding: '4px 12px', borderRadius: 99, marginBottom: 12,
                                        fontFamily: "'Inter', sans-serif",
                                    }}>{tier.label}</div>
                                    <div style={{
                                        fontFamily: "'Syne', sans-serif",
                                        fontSize: 34, fontWeight: 800, color: '#fff',
                                        marginBottom: 8, lineHeight: 1,
                                    }}>{fmt(tier.price)}</div>
                                    <p style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 13, color: 'rgba(255,255,255,0.5)',
                                        lineHeight: 1.65, margin: '0 0 20px',
                                    }}>{tier.description}</p>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        color: tier.color, fontWeight: 700, fontSize: 13,
                                        fontFamily: "'Inter', sans-serif",
                                    }}>Select This Box <FiArrowRight size={14} /></div>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    {/* ── STEP 2: Pick Size ── */}
                    {step === 'size' && selectedTier && (
                        <motion.div
                            key="size"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.4 }}
                            style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}
                        >
                            {/* Tier badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: `${selectedTier.color}18`,
                                border: `1px solid ${selectedTier.border}`,
                                borderRadius: 99, padding: '8px 20px', marginBottom: 28,
                            }}>
                                <span style={{ fontSize: 20 }}>{selectedTier.emoji}</span>
                                <span style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontWeight: 700, fontSize: 13, color: selectedTier.color,
                                }}>{selectedTier.label} — {fmt(selectedTier.price)}</span>
                            </div>

                            <h2 style={{
                                fontFamily: "'Syne', sans-serif",
                                fontWeight: 800, fontSize: 26, color: '#fff', marginBottom: 6,
                            }}>Pick Your Size</h2>
                            <p style={{
                                fontFamily: "'Inter', sans-serif",
                                color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 32,
                            }}>Your mystery jersey will be hand-picked in this size.</p>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
                                {SIZES.map(sz => (
                                    <motion.button
                                        key={sz}
                                        onClick={() => setSelectedSize(sz)}
                                        whileHover={{ scale: 1.12 }}
                                        whileTap={{ scale: 0.93 }}
                                        style={{
                                            width: 62, height: 62, borderRadius: 14,
                                            border: selectedSize === sz
                                                ? `2px solid ${selectedTier.color}`
                                                : '1px solid rgba(255,255,255,0.1)',
                                            background: selectedSize === sz
                                                ? `${selectedTier.color}25`
                                                : 'rgba(255,255,255,0.03)',
                                            color: selectedSize === sz ? selectedTier.color : 'rgba(255,255,255,0.55)',
                                            fontFamily: "'Syne', sans-serif",
                                            fontWeight: 800, fontSize: 16, cursor: 'pointer', outline: 'none',
                                            boxShadow: selectedSize === sz ? `0 0 24px ${selectedTier.glow}` : 'none',
                                            transition: 'all 0.2s',
                                        }}
                                    >{sz}</motion.button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                                <button
                                    onClick={() => { setStep('pick'); setSelectedTier(null); setSelectedSize(null) }}
                                    style={{
                                        fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
                                        padding: '13px 24px', borderRadius: 99,
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                                    }}
                                >← Back</button>
                                <motion.button
                                    onClick={handleReveal}
                                    disabled={!selectedSize}
                                    whileHover={selectedSize ? { scale: 1.05 } : {}}
                                    whileTap={selectedSize ? { scale: 0.96 } : {}}
                                    style={{
                                        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 15,
                                        padding: '13px 36px', borderRadius: 99, border: 'none',
                                        background: selectedSize
                                            ? `linear-gradient(135deg, ${selectedTier.color}, #ec4899)`
                                            : 'rgba(255,255,255,0.07)',
                                        color: selectedSize ? '#fff' : 'rgba(255,255,255,0.25)',
                                        cursor: selectedSize ? 'pointer' : 'not-allowed',
                                        boxShadow: selectedSize ? `0 8px 32px ${selectedTier.glow}` : 'none',
                                        transition: 'all 0.2s',
                                    }}
                                >🎁 Open My Box</motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── SPINNING (eFootball card spin reveal) ── */}
                    {(step === 'spinning' || step === 'reveal') && (
                        <motion.div
                            key="spin-stage"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                maxWidth: 480,
                                margin: '0 auto',
                                textAlign: 'center',
                                position: 'relative',
                                minHeight: 480,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Particles — fire on reveal */}
                            {step === 'reveal' && particles.map(p => (
                                <SpinParticle key={p.id} {...p} />
                            ))}

                            {/* Star ring — shows after reveal */}
                            {step === 'reveal' && !shouldReduceMotion && (
                                <StarBurst count={12} radius={180} color={selectedTier?.color || '#a855f7'} />
                            )}

                            {/* ── THE CARD ── */}
                            <div
                                key={step === 'spinning' ? 'card-spin' : 'card-still'}
                                className={step === 'spinning' ? 'mb-spinning' : 'mb-revealed-card'}
                                style={{
                                    width: 260,
                                    height: 340,
                                    borderRadius: 24,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: revealedProduct?.images?.[0]
                                        ? 'none'
                                        : 'linear-gradient(135deg, rgba(168,85,247,0.4) 0%, rgba(109,40,217,0.2) 100%)',
                                    border: `2px solid ${selectedTier?.color || '#a855f7'}`,
                                    boxShadow: step === 'spinning'
                                        ? '0 0 60px rgba(168,85,247,0.8), 0 0 120px rgba(168,85,247,0.4)'
                                        : undefined,
                                    flexShrink: 0,
                                }}
                            >
                                {/* Glare sweep animation (during spin only) */}
                                {step === 'spinning' && <div className="mb-glare" />}

                                {/* Shimmer loop (after reveal) */}
                                {step === 'reveal' && <div className="mb-shimmer-loop" style={{ opacity: 0.4 }} />}

                                {/* Jersey image */}
                                {revealedProduct?.images?.[0] ? (
                                    <img
                                        src={revealedProduct.images[0]}
                                        alt={revealedProduct.name}
                                        style={{
                                            width: '100%', height: '100%',
                                            objectFit: 'cover', objectPosition: 'top',
                                            display: 'block',
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '100%', height: '100%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 80,
                                    }}>👕</div>
                                )}

                                {/* Dark gradient footer */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    padding: '48px 16px 16px',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
                                }}>
                                    {step === 'reveal' && revealedProduct && (
                                        <>
                                            <p style={{
                                                fontFamily: "'Inter', sans-serif",
                                                fontSize: 8, fontWeight: 800, letterSpacing: '2px',
                                                textTransform: 'uppercase',
                                                color: selectedTier?.color || '#a855f7',
                                                marginBottom: 3,
                                            }}>{revealedProduct.category || 'Mystery'}</p>
                                            <p style={{
                                                fontFamily: "'Syne', sans-serif",
                                                fontSize: 13, fontWeight: 800,
                                                color: '#fff', margin: 0, lineHeight: 1.2,
                                            }}>{revealedProduct.name}</p>
                                        </>
                                    )}
                                    {step === 'spinning' && (
                                        <p style={{
                                            fontFamily: "'Syne', sans-serif",
                                            fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,0.6)',
                                            letterSpacing: '3px', textTransform: 'uppercase',
                                        }}>REVEALING…</p>
                                    )}
                                </div>

                                {/* Rainbow shimmer border overlay */}
                                {step === 'spinning' && (
                                    <div style={{
                                        position: 'absolute', inset: 0, borderRadius: 22,
                                        background: 'linear-gradient(45deg, transparent 30%, rgba(168,85,247,0.3) 50%, transparent 70%)',
                                        pointerEvents: 'none',
                                    }} />
                                )}
                            </div>

                            {/* Spinning label */}
                            {step === 'spinning' && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0.5, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                    style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 12, fontWeight: 700,
                                        color: 'rgba(168,85,247,0.8)',
                                        letterSpacing: '4px', textTransform: 'uppercase',
                                        marginTop: 28,
                                    }}
                                >Opening your box…</motion.p>
                            )}

                            {/* Reveal: info & actions */}
                            {step === 'reveal' && showCard && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    style={{ marginTop: 32, width: '100%' }}
                                >
                                    <p className="mb-gold-shimmer-text" style={{
                                        fontFamily: "'Syne', sans-serif",
                                        fontWeight: 800, fontSize: 22, marginBottom: 4,
                                    }}>✦ Your Jersey is Revealed! ✦</p>
                                    <p style={{
                                        fontFamily: "'Inter', sans-serif",
                                        fontSize: 13, color: 'rgba(255,255,255,0.4)',
                                        marginBottom: 24,
                                    }}>
                                        Size: <strong style={{ color: '#fff' }}>{selectedSize}</strong>
                                        &nbsp;·&nbsp;
                                        {fmt(selectedTier?.price)}
                                    </p>

                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={resetAll}
                                            style={{
                                                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13,
                                                padding: '12px 22px', borderRadius: 99,
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                                                cursor: 'pointer',
                                            }}
                                        >Try Another</button>
                                        <motion.button
                                            onClick={handleCheckout}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.96 }}
                                            style={{
                                                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
                                                padding: '12px 32px', borderRadius: 99, border: 'none',
                                                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                                color: '#fff', cursor: 'pointer',
                                                boxShadow: '0 8px 32px rgba(168,85,247,0.5)',
                                                display: 'flex', alignItems: 'center', gap: 7,
                                            }}
                                        >Claim My Jersey <FiArrowRight size={14} /></motion.button>
                                    </div>
                                </motion.div>
                            )}

                        </motion.div>
                    )}

                    {/* No products fallback */}
                    {step === 'reveal' && !revealedProduct && !loading && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: 40 }}
                        >
                            <p style={{ fontSize: 40, marginBottom: 12 }}>😢</p>
                            <p style={{ fontFamily: "'Inter', sans-serif" }}>No jerseys available right now!</p>
                            <button onClick={resetAll} style={{
                                marginTop: 20, fontFamily: "'Inter', sans-serif",
                                fontWeight: 700, fontSize: 14, padding: '12px 28px',
                                borderRadius: 99, border: 'none',
                                background: 'rgba(168,85,247,0.3)', color: '#fff', cursor: 'pointer',
                            }}>Try Again</button>
                        </motion.div>
                    )}

                </AnimatePresence>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    style={{
                        display: 'flex', justifyContent: 'center',
                        gap: 24, flexWrap: 'wrap',
                        marginTop: 64, paddingTop: 36,
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                >
                    {['🔒 Secure Checkout', '🚚 India Shipping', '↩️ 7-Day Return', '✅ Authentic Jersey'].map(t => (
                        <span key={t} style={{
                            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600,
                            color: 'rgba(255,255,255,0.3)',
                        }}>{t}</span>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
