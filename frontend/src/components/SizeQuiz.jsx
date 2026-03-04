/**
 * SizeQuiz — Smart 3-step size recommendation modal
 * Pure frontend logic matrix: height × weight × fit preference → size
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiArrowRight, FiArrowLeft } from 'react-icons/fi'

/* Size matrix: returns recommended size */
function recommendSize({ height, weight, fit }) {
    // BMI-like approach
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w) return null

    const bmi = w / ((h / 100) ** 2)

    let base
    if (h < 160) base = bmi < 20 ? 'XS' : bmi < 25 ? 'S' : 'M'
    else if (h < 170) base = bmi < 20 ? 'S' : bmi < 25 ? 'M' : 'L'
    else if (h < 180) base = bmi < 20 ? 'M' : bmi < 25 ? 'L' : 'XL'
    else if (h < 190) base = bmi < 22 ? 'L' : bmi < 27 ? 'XL' : 'XXL'
    else base = bmi < 24 ? 'XL' : 'XXL'

    // Adjust for fit preference
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const idx = sizes.indexOf(base)
    if (fit === 'loose') return sizes[Math.min(idx + 1, sizes.length - 1)]
    if (fit === 'tight') return sizes[Math.max(idx - 1, 0)]
    return base
}

const STEPS = [
    {
        id: 'height',
        question: "What's your height?",
        emoji: '📏',
        options: [
            { label: 'Under 155 cm', value: '150' },
            { label: '155–160 cm', value: '157' },
            { label: '160–165 cm', value: '162' },
            { label: '165–170 cm', value: '167' },
            { label: '170–175 cm', value: '172' },
            { label: '175–180 cm', value: '177' },
            { label: '180–185 cm', value: '182' },
            { label: '185–190 cm', value: '187' },
            { label: 'Over 190 cm', value: '193' },
        ]
    },
    {
        id: 'weight',
        question: "What's your weight?",
        emoji: '⚖️',
        options: [
            { label: 'Under 50 kg', value: '47' },
            { label: '50–55 kg', value: '52' },
            { label: '55–65 kg', value: '60' },
            { label: '65–75 kg', value: '70' },
            { label: '75–85 kg', value: '80' },
            { label: '85–95 kg', value: '90' },
            { label: 'Over 95 kg', value: '100' },
        ]
    },
    {
        id: 'fit',
        question: 'How do you like your jersey to fit?',
        emoji: '👕',
        options: [
            { label: 'Tight / Athletic', value: 'tight', desc: 'Snug & sporty feel' },
            { label: 'Regular / True-to-size', value: 'regular', desc: 'Classic football fit' },
            { label: 'Loose / Relaxed', value: 'loose', desc: 'Comfortable & casual' },
        ]
    }
]

const SIZE_TIPS = {
    XS: { confidence: 96, tip: 'Looks best on slim builds with a sharp athletic profile.' },
    S: { confidence: 94, tip: 'Great proportions — clean and sporty on most slim frames.' },
    M: { confidence: 95, tip: 'Our most popular size — perfect for regular Indian builds.' },
    L: { confidence: 93, tip: 'Comfortable all-day fit with room to move.' },
    XL: { confidence: 92, tip: 'Relaxed without being baggy — great for broader builds.' },
    XXL: { confidence: 91, tip: 'Maximum comfort. The jersey will drape naturally.' },
}

export default function SizeQuiz({ onClose }) {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState({})
    const [result, setResult] = useState(null)

    const currentStep = STEPS[step]

    const selectOption = (val) => {
        const newAnswers = { ...answers, [currentStep.id]: val }
        setAnswers(newAnswers)

        if (step < STEPS.length - 1) {
            setStep(s => s + 1)
        } else {
            // Final step — compute result
            const size = recommendSize(newAnswers)
            setResult(size)
        }
    }

    const reset = () => {
        setStep(0)
        setAnswers({})
        setResult(null)
    }

    return (
        <div className="sq-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <motion.div
                className="sq-modal"
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
                <button className="sq-close" onClick={onClose} aria-label="Close size quiz">
                    <FiX size={18} />
                </button>

                <AnimatePresence mode="wait">
                    {!result ? (
                        <motion.div
                            key={step}
                            className="sq-content"
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Progress */}
                            <div className="sq-progress">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`sq-progress-dot ${i <= step ? 'active' : ''}`}
                                    />
                                ))}
                            </div>

                            <div className="sq-emoji" aria-hidden="true">{currentStep.emoji}</div>
                            <h2 className="sq-question">{currentStep.question}</h2>

                            <div className="sq-options">
                                {currentStep.options.map(opt => (
                                    <button
                                        key={opt.value}
                                        className="sq-option"
                                        onClick={() => selectOption(opt.value)}
                                    >
                                        <span className="sq-option-label">{opt.label}</span>
                                        {opt.desc && <span className="sq-option-desc">{opt.desc}</span>}
                                        <FiArrowRight size={14} className="sq-option-arrow" />
                                    </button>
                                ))}
                            </div>

                            {step > 0 && (
                                <button
                                    className="sq-back"
                                    onClick={() => setStep(s => s - 1)}
                                >
                                    <FiArrowLeft size={14} /> Back
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            className="sq-result"
                            initial={{ opacity: 0, scale: 0.88 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className="sq-result-badge">✅ Size Found</div>
                            <div className="sq-result-size">{result}</div>
                            <div className="sq-result-conf">
                                {SIZE_TIPS[result]?.confidence || 93}% confidence
                            </div>
                            <p className="sq-result-tip">{SIZE_TIPS[result]?.tip}</p>

                            <div className="sq-all-sizes">
                                <p className="sq-all-label">All sizes available:</p>
                                <div className="sq-size-row">
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => (
                                        <span
                                            key={s}
                                            className={`sq-size-chip ${s === result ? 'recommended' : ''}`}
                                        >
                                            {s}
                                            {s === result && <span className="sq-rec-star">★</span>}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button className="sq-retry" onClick={reset}>
                                ↺ Retake Quiz
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}
