import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { createInquiry } from '../api/inquiry.api'

function InquiryModal({ product, onClose }) {
    const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

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
                customer: {
                    name: form.name,
                    phone: form.phone,
                    email: form.email
                },
                message: form.message
            })
            setSubmitted(true)
            toast.success('Inquiry submitted! We\'ll contact you soon.')
        } catch (err) {
            toast.error(err.message || 'Failed to submit inquiry. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="modal-card"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

                    {submitted ? (
                        <div className="modal-success">
                            <div style={{ fontSize: '40px' }}>✅</div>
                            <h3>Inquiry Sent!</h3>
                            <p>We'll contact you on <strong>{form.phone}</strong> shortly.</p>
                            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="modal-title">💬 Product Inquiry</h2>
                            <p className="modal-subtitle">
                                Asking about: <strong>{product?.name}</strong>
                            </p>

                            <form className="inquiry-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Your Name *</label>
                                    <input
                                        type="text" name="name" value={form.name}
                                        onChange={handleChange} placeholder="Full name"
                                        required className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel" name="phone" value={form.phone}
                                        onChange={handleChange} placeholder="+91 98765 43210"
                                        required className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email (Optional)</label>
                                    <input
                                        type="email" name="email" value={form.email}
                                        onChange={handleChange} placeholder="you@example.com"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea
                                        name="message" value={form.message}
                                        onChange={handleChange}
                                        placeholder="Ask about size, stock, custom print…"
                                        required className="form-input" rows={4}
                                        maxLength={1000}
                                    />
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                        {form.message.length}/1000
                                    </span>
                                </div>
                                <motion.button
                                    type="submit" className="btn btn-primary"
                                    disabled={loading}
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    style={{ width: '100%' }}
                                >
                                    {loading ? 'Submitting…' : 'Send Inquiry'}
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
