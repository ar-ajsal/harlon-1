import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { toast } from 'react-toastify'
import { createInquiry } from '../api/inquiry.api'

function InquiryModal({ product, onClose }) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const prefersReduced = useReducedMotion()

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
            toast.error('Name, phone and message are required')
            return
        }
        setLoading(true)
        try {
            await createInquiry({
                productId: product._id,
                productName: product.name,
                customer: { name: form.name, phone: form.phone, email: form.email },
                message: form.message
            })
            setSubmitted(true)
        } catch (err) {
            toast.error(err.message || 'Failed to submit. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const cardVariants = prefersReduced
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
        : { initial: { opacity: 0, y: 60 }, animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 380, damping: 34 } }, exit: { opacity: 0, y: 40, transition: { duration: 0.18 } } }

    return (
        <AnimatePresence>
            <motion.div
                className="pd-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                aria-modal="true"
                role="dialog"
                aria-label="Product inquiry"
            >
                <motion.div
                    className="pd-modal-card"
                    {...cardVariants}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Drag handle (mobile) */}
                    <div className="pd-modal-handle" aria-hidden />

                    {/* Close */}
                    <button className="pd-modal-close" onClick={onClose} aria-label="Close">✕</button>

                    {submitted ? (
                        /* ── Success state ── */
                        <motion.div
                            className="pd-modal-success"
                            initial={prefersReduced ? {} : { opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={prefersReduced ? {} : { type: 'spring', stiffness: 340, damping: 28 }}
                        >
                            <span className="pd-modal-success-icon">✅</span>
                            <h3>Inquiry Sent!</h3>
                            <p>We'll reach you on <strong>{form.phone}</strong> shortly.</p>
                            <motion.button
                                className="pd-btn-buy"
                                onClick={onClose}
                                whileTap={prefersReduced ? {} : { scale: 0.97 }}
                                style={{ marginTop: 8, width: '100%' }}
                            >
                                Got it
                            </motion.button>
                        </motion.div>
                    ) : (
                        <>
                            <p className="pd-modal-title">💬 Ask Us Anything</p>
                            <p className="pd-modal-sub">About: <strong>{product?.name}</strong></p>

                            <form onSubmit={handleSubmit} noValidate>
                                <div className="pd-field">
                                    <label htmlFor="inq-name">Your Name *</label>
                                    <input
                                        id="inq-name"
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Full name"
                                        required
                                        autoComplete="name"
                                    />
                                </div>

                                <div className="pd-field">
                                    <label htmlFor="inq-phone">Phone *</label>
                                    <input
                                        id="inq-phone"
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        required
                                        inputMode="tel"
                                        autoComplete="tel"
                                    />
                                </div>

                                <div className="pd-field">
                                    <label htmlFor="inq-email">Email <span style={{ fontWeight: 400, textTransform: 'none', color: '#aaa' }}>(optional)</span></label>
                                    <input
                                        id="inq-email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="pd-field">
                                    <label htmlFor="inq-msg">Message *</label>
                                    <textarea
                                        id="inq-msg"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Ask about size, stock, custom print, bulk order…"
                                        required
                                        rows={4}
                                        maxLength={1000}
                                    />
                                    <span style={{ fontSize: 11, color: '#aaa', display: 'block', textAlign: 'right', marginTop: 3 }}>
                                        {form.message.length}/1000
                                    </span>
                                </div>

                                <motion.button
                                    type="submit"
                                    className="pd-btn-buy"
                                    disabled={loading}
                                    whileTap={prefersReduced ? {} : { scale: 0.97 }}
                                    style={{ width: '100%', marginTop: 4 }}
                                >
                                    {loading ? 'Sending…' : 'Send Inquiry →'}
                                </motion.button>
                            </form>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default InquiryModal
