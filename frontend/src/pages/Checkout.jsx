import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useProducts } from '../context/ProductContext'
import { createOrder } from '../api/guestOrder.api'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-script')) return resolve(true)
        const script = document.createElement('script')
        script.id = 'razorpay-script'
        script.src = RAZORPAY_SCRIPT
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
    })
}

function Checkout() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { products } = useProducts()

    const productId = searchParams.get('productId')
    const prefilledSize = searchParams.get('size') || ''

    const [product, setProduct] = useState(null)
    const [form, setForm] = useState({
        firstName: '', lastName: '',
        company: '',
        country: 'India',
        streetAddress: '', apartment: '',
        city: '', state: 'Delhi', pinCode: '',
        phone: '', email: '',
        orderNotes: '',
        size: prefilledSize,
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('razorpay')

    useEffect(() => {
        if (products.length > 0 && productId) {
            const found = products.find(p => p._id === productId)
            setProduct(found || null)
            if (found && !prefilledSize && found.sizes?.length > 0) {
                setForm(f => ({ ...f, size: found.sizes[0] }))
            }
        }
    }, [products, productId, prefilledSize])

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    }

    const validateForm = () => {
        if (!form.firstName.trim()) { toast.error('First name is required'); return false }
        if (!form.lastName.trim()) { toast.error('Last name is required'); return false }
        if (!form.streetAddress.trim()) { toast.error('Street address is required'); return false }
        if (!form.city.trim()) { toast.error('Town / City is required'); return false }
        if (!form.state.trim()) { toast.error('State is required'); return false }
        if (!form.pinCode.trim()) { toast.error('PIN Code is required'); return false }
        if (!/^\d{6}$/.test(form.pinCode)) { toast.error('PIN Code must be 6 digits'); return false }
        if (!form.phone.trim()) { toast.error('Phone is required'); return false }
        if (!form.email.trim()) { toast.error('Email is required'); return false }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Invalid email'); return false }
        if (!form.size) { toast.error('Please select a size'); return false }
        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        setLoading(true)
        try {
            const response = await createOrder({
                productId,
                size: form.size,
                paymentMethod,
                customer: {
                    firstName: form.firstName,
                    lastName: form.lastName,
                    company: form.company,
                    country: form.country,
                    streetAddress: form.streetAddress,
                    apartment: form.apartment,
                    city: form.city,
                    state: form.state,
                    pinCode: form.pinCode,
                    phone: form.phone,
                    email: form.email,
                    orderNotes: form.orderNotes,
                }
            })

            if (paymentMethod === 'whatsapp') {
                // WhatsApp order — show success immediately and offer WA redirect
                setSuccess({
                    orderId: response.orderId,
                    trackToken: response.trackToken,
                    isWhatsapp: true
                })
                return
            }

            if (!response || !response.razorpayOrderId || !response.keyId) {
                toast.error('Payment gateway error. Please try again.')
                return
            }

            await handleRazorpay(response)
        } catch (err) {
            toast.error(err.message || 'Failed to place order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRazorpay = async (data) => {
        const loaded = await loadRazorpayScript()
        if (!loaded) {
            toast.error('Failed to load payment gateway. Please try again.')
            return
        }

        return new Promise((resolve) => {
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'Harlon Jersey Store',
                description: product?.name || 'Jersey Order',
                order_id: data.razorpayOrderId,
                prefill: {
                    name: `${form.firstName} ${form.lastName}`,
                    email: form.email,
                    contact: form.phone
                },
                theme: { color: '#1a1a2e' },
                handler: () => {
                    setSuccess({ orderId: data.orderId, trackToken: data.trackToken })
                    resolve()
                },
                modal: {
                    ondismiss: () => {
                        toast.info('Payment cancelled. Your order is saved.')
                        resolve()
                    }
                }
            }
            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', (resp) => {
                toast.error(`Payment failed: ${resp.error?.description || 'Unknown error'}`)
                resolve()
            })
            rzp.open()
        })
    }

    // ── Helpers for success screen ───────────────────────────────────────────
    const trackLink = success?.trackToken
        ? `${window.location.origin}/track-order?token=${success.trackToken}`
        : success
            ? `${window.location.origin}/track-order?orderId=${success.orderId}&email=${encodeURIComponent(form.email)}`
            : ''

    const handleCopyLink = () => {
        navigator.clipboard.writeText(trackLink)
            .then(() => toast.success('Tracking link copied!'))
            .catch(() => toast.error('Copy failed — please copy manually'))
    }

    const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Track my Harlon order: ${trackLink}`)}`

    // ── Success screen ───────────────────────────────────────────────────────
    if (success) {
        return (
            <div className="checkout-success">
                <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="success-card"
                >
                    {/* Icon + heading */}
                    <div className="success-icon">🎉</div>
                    <h2>Order Placed Successfully!</h2>
                    <p style={{ color: '#6b7280', fontSize: '15px', maxWidth: '340px', margin: '0 auto 20px' }}>
                        Your payment is being processed. We'll send a confirmation to <strong>{form.email}</strong>.
                    </p>

                    {/* Order ID */}
                    <div className="success-order-id">
                        Order ID: <strong>{success.orderId}</strong>
                    </div>

                    {/* Mini steps */}
                    <div className="success-mini-timeline">
                        {['Order Placed ✅', 'Payment Processing 💳', 'Being Prepared ⚙️'].map((step, i) => (
                            <div key={i} className={`success-mini-step ${i === 0 ? 'done' : i === 1 ? 'active' : ''}`}>
                                <div className="success-mini-dot" />
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="success-actions">
                        <motion.button
                            className="btn btn-primary"
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                            onClick={() => navigate(trackLink.replace(window.location.origin, ''))}
                        >
                            📦 Track My Order
                        </motion.button>

                        <div className="success-share-row">
                            <button className="success-copy-btn" onClick={handleCopyLink} title="Copy tracking link">
                                🔗 Copy Tracking Link
                            </button>
                            <a
                                href={whatsappShareUrl}
                                target="_blank" rel="noreferrer"
                                className="success-wa-btn"
                                title="Share via WhatsApp"
                            >
                                💬 Share via WhatsApp
                            </a>
                        </div>

                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%' }}
                            onClick={() => navigate('/shop')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="checkout-error">
                <div className="container">
                    <h2>Product not found</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/shop')}>Go to Shop</button>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="checkout-title"
                >
                    Checkout
                </motion.h1>

                <div className="checkout-grid">

                    {/* ── Billing Form ── */}
                    <motion.form
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="checkout-form"
                        onSubmit={handleSubmit}
                    >
                        <h3 style={{ marginBottom: '1rem' }}>Billing Details</h3>

                        {/* ── Payment Method Selector ─────────────────── */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, display: 'block' }}>
                                How would you like to pay?
                            </label>
                            <div className="checkout-pay-method">
                                <button
                                    type="button"
                                    className={`pay-method-btn ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('razorpay')}
                                    aria-pressed={paymentMethod === 'razorpay'}
                                >
                                    <span className="pay-method-icon">💳</span>
                                    <span className="pay-method-label">Pay Online</span>
                                    <span className="pay-method-sub">Razorpay · UPI · Cards</span>
                                </button>
                                <button
                                    type="button"
                                    className={`pay-method-btn wa ${paymentMethod === 'whatsapp' ? 'selected' : ''}`}
                                    onClick={() => setPaymentMethod('whatsapp')}
                                    aria-pressed={paymentMethod === 'whatsapp'}
                                >
                                    <span className="pay-method-icon">💬</span>
                                    <span className="pay-method-label">WhatsApp Order</span>
                                    <span className="pay-method-sub">We'll confirm manually</span>
                                </button>
                            </div>
                            {paymentMethod === 'whatsapp' && (
                                <div className="wa-notice-box">
                                    <strong>📲 How WhatsApp orders work</strong>
                                    Place your order here and our team will contact you on WhatsApp to confirm availability and arrange payment.
                                </div>
                            )}
                        </div>

                        {/* First / Last name */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input
                                    type="text" name="firstName" value={form.firstName}
                                    onChange={handleChange} placeholder="First name"
                                    required className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input
                                    type="text" name="lastName" value={form.lastName}
                                    onChange={handleChange} placeholder="Last name"
                                    required className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Company Name <span className="optional">(optional)</span></label>
                            <input
                                type="text" name="company" value={form.company}
                                onChange={handleChange} placeholder="Company name"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Country / Region *</label>
                            <input
                                type="text" name="country" value={form.country}
                                className="form-input" readOnly
                            />
                        </div>

                        <div className="form-group">
                            <label>Street Address *</label>
                            <input
                                type="text" name="streetAddress" value={form.streetAddress}
                                onChange={handleChange} placeholder="House number and street name"
                                required className="form-input"
                            />
                            <input
                                type="text" name="apartment" value={form.apartment}
                                onChange={handleChange}
                                placeholder="Apartment, suite, unit, etc. (optional)"
                                className="form-input" style={{ marginTop: '0.5rem' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Town / City *</label>
                            <input
                                type="text" name="city" value={form.city}
                                onChange={handleChange} placeholder="Town / City"
                                required className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>State *</label>
                            <select
                                name="state" value={form.state}
                                onChange={handleChange} required className="form-input"
                            >
                                {INDIAN_STATES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>PIN Code *</label>
                            <input
                                type="text" name="pinCode" value={form.pinCode}
                                onChange={handleChange} placeholder="6-digit PIN code"
                                maxLength={6} required className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone *</label>
                            <input
                                type="tel" name="phone" value={form.phone}
                                onChange={handleChange} placeholder="+91 98765 43210"
                                required className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email" name="email" value={form.email}
                                onChange={handleChange} placeholder="you@example.com"
                                required className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Additional Information</label>
                            <textarea
                                name="orderNotes" value={form.orderNotes}
                                onChange={handleChange}
                                placeholder="Order notes (optional)"
                                className="form-input" rows={3}
                            />
                        </div>

                        <motion.button
                            type="submit"
                            className="btn btn-primary checkout-submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? 'Processing...' : '💳 Pay Now'}
                        </motion.button>
                    </motion.form>

                    {/* ── Order Summary ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="order-summary"
                    >
                        <h3>Order Summary</h3>
                        <div className="summary-product">
                            {product.images?.[0] && (
                                <img src={product.images[0]} alt={product.name} className="summary-img" />
                            )}
                            <div className="summary-details">
                                <p className="summary-name">{product.name}</p>
                                <p className="summary-price">₹{product.price}</p>
                            </div>
                        </div>

                        {/* Size Selection */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label>Size *</label>
                                <div className="size-options">
                                    {product.sizes.map(s => (
                                        <button
                                            key={s} type="button"
                                            className={`size-button ${form.size === s ? 'selected' : ''}`}
                                            onClick={() => setForm(f => ({ ...f, size: s }))}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Summary */}
                        <div className="checkout-total" style={{ marginTop: '1rem' }}>
                            <span>Total</span>
                            <span className="total-price">₹{product.price}</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    )
}

export default Checkout
