import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { toast } from 'react-toastify'
import { FaWhatsapp } from 'react-icons/fa'
import { FiChevronDown, FiChevronUp, FiTag, FiX } from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../api/guestOrder.api'
import { WHATSAPP_NUMBER } from '../config/constants'
import OrderSuccess from '../components/order/OrderSuccess'
import { offersApi } from '../api/offers.api'
import { settingsApi } from '../api/settings.api'
import '../styles/checkout.css'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
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

// ── Inline validation helpers ─────────────────────────────────────────────
const VALIDATORS = {
    fullName: v => v.trim().length >= 2 ? null : 'Enter your full name',
    phone: v => /^\d{10}$/.test(v.replace(/\s/g, '')) ? null : 'Enter 10-digit phone number',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email',
    streetAddress: v => v.trim().length >= 5 ? null : 'Enter your street address',
    city: v => v.trim().length >= 2 ? null : 'Enter city / town',
    pinCode: v => /^\d{6}$/.test(v) ? null : '6-digit PIN code required',
    state: v => v.trim().length > 0 ? null : 'Select a state',
}

function Field({ label, error, touched, valid, optional, children }) {
    return (
        <div className="co-field">
            {label && (
                <label className="co-label">
                    {label}{optional && <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#bbb' }}> (optional)</span>}
                </label>
            )}
            {children}
            {touched && error && (
                <div className="co-field-error">
                    <span>✗</span> {error}
                </div>
            )}
            {touched && !error && valid && (
                <div className="co-validation-icon" aria-hidden>✅</div>
            )}
        </div>
    )
}

function Checkout() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { products } = useProducts()
    const { items: cartItems, clearCart } = useCart()
    const { user } = useAuth()
    const prefersReduced = useReducedMotion()

    const productId = searchParams.get('productId')
    const prefilledSize = searchParams.get('size') || ''
    const isCartMode = searchParams.get('cart') === 'true'

    const [product, setProduct] = useState(null)
    const [summaryOpen, setSummaryOpen] = useState(false)
    const [showNotes, setShowNotes] = useState(false)

    const [form, setForm] = useState({
        fullName: user?.name || '',
        country: 'India',
        streetAddress: '', apartment: '',
        city: '', state: 'Delhi', pinCode: '',
        phone: user?.phone || '', email: user?.email || '',
        orderNotes: '',
        size: prefilledSize,
    })

    // Pre-fill form when user data loads
    useEffect(() => {
        if (user) {
            setForm(f => ({
                ...f,
                fullName: f.fullName || user.name || '',
                email: f.email || user.email || '',
                phone: f.phone || user.phone || '',
            }))
        }
    }, [user])

    const [touched, setTouched] = useState({})
    const [fieldErrors, setFieldErrors] = useState({})

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('razorpay')

    // ── Promo / Offer code ───────────────────────────────────────────────────
    const [promoCode, setPromoCode] = useState('')
    const [promoInput, setPromoInput] = useState('')
    const [promoValidating, setPromoValidating] = useState(false)
    const [appliedOffer, setAppliedOffer] = useState(null)  // { code, description, discountAmount, discountType }

    // ── Global Order Settings ───────────────────────────────────────────────
    const [orderSettings, setOrderSettings] = useState({ whatsappOrderEnabled: true, onlinePaymentEnabled: true })
    const [loadingSettings, setLoadingSettings] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await settingsApi.getSettings()
                if (res.success) {
                    const settings = res.data
                    setOrderSettings(settings)
                    
                    // Adjust default payment method if "razorpay" is disabled
                    if (!settings.onlinePaymentEnabled && settings.whatsappOrderEnabled) {
                        setPaymentMethod('whatsapp')
                    }
                }
            } catch (err) {
                console.error('Error fetching settings:', err)
            } finally {
                setLoadingSettings(false)
            }
        }
        fetchSettings()
    }, [])

    // ── Load product ────────────────────────────────────────────────────────
    useEffect(() => {
        if (products.length > 0 && productId) {
            const found = products.find(p => p._id === productId)
            setProduct(found || null)
            if (found && !prefilledSize && found.sizes?.length > 0) {
                setForm(f => ({ ...f, size: found.sizes[0] }))
            }
        }
    }, [products, productId, prefilledSize])

    // ── Form handlers ────────────────────────────────────────────────────────
    const handleChange = useCallback((e) => {
        const { name, value } = e.target
        setForm(f => ({ ...f, [name]: value }))
        // Live validate on change once touched
        if (touched[name] && VALIDATORS[name]) {
            setFieldErrors(fe => ({ ...fe, [name]: VALIDATORS[name](value) }))
        }
    }, [touched])

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target
        setTouched(t => ({ ...t, [name]: true }))
        if (VALIDATORS[name]) {
            setFieldErrors(fe => ({ ...fe, [name]: VALIDATORS[name](value) }))
        }
    }, [])

    // ── Validation ───────────────────────────────────────────────────────────
    const validateAll = useCallback(() => {
        const fields = ['fullName', 'phone', 'email', 'streetAddress', 'city', 'pinCode', 'state']
        const errors = {}
        const newTouched = {}
        fields.forEach(f => {
            newTouched[f] = true
            errors[f] = VALIDATORS[f]?.(form[f]) || null
        })
        setTouched(t => ({ ...t, ...newTouched }))
        setFieldErrors(errors)

        if (!form.size) { toast.error('Please select a size'); return false }

        const firstErr = Object.values(errors).find(Boolean)
        if (firstErr) { toast.error(firstErr); return false }
        return true
    }, [form])

    // ── Promo code handlers ──────────────────────────────────────────────────
    const handleApplyPromo = useCallback(async () => {
        const code = promoInput.trim().toUpperCase()
        if (!code) { toast.error('Enter a promo code'); return }
        if (!product) { toast.error('Please select a product first'); return }

        try {
            setPromoValidating(true)
            const res = await offersApi.validate(code, product.price, product._id, product.category)
            const offer = res.data?.data
            if (!offer) throw new Error('Invalid response')

            setAppliedOffer({
                code: offer.code,
                description: offer.description,
                discountAmount: offer.discountAmount ?? 0,
                discountType: offer.discountType,
            })
            setPromoCode(code)
            toast.success(`✅ "${offer.code}" applied! ${offer.discountType === 'freeship' ? 'Free shipping unlocked' : `₹${offer.discountAmount} saved`}`)
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Invalid promo code'
            toast.error(msg)
            setAppliedOffer(null)
        } finally {
            setPromoValidating(false)
        }
    }, [promoInput, product])

    const removePromo = () => {
        setAppliedOffer(null)
        setPromoCode('')
        setPromoInput('')
        toast.info('Promo code removed')
    }

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateAll()) return

        setLoading(true)
        try {
            const [firstName, ...rest] = form.fullName.trim().split(' ')
            const lastName = rest.join(' ') || firstName

            const response = await createOrder({
                productId,
                size: form.size,
                paymentMethod,
                promoCode: appliedOffer?.code || undefined,
                discountAmount: appliedOffer?.discountAmount || 0,
                customer: {
                    firstName, lastName,
                    company: '',
                    country: form.country,
                    streetAddress: form.streetAddress,
                    apartment: form.apartment,
                    city: form.city,
                    state: form.state,
                    pinCode: form.pinCode,
                    phone: form.phone,
                    email: form.email,
                    orderNotes: form.orderNotes,
                },
            })

            if (paymentMethod === 'whatsapp') {
                setSuccess({ orderId: response.orderId, trackToken: response.trackToken, isWhatsapp: true })
                if (isCartMode) clearCart()
                return
            }

            if (!response?.razorpayOrderId || !response?.keyId) {
                toast.error('Payment gateway error. Please try again.')
                return
            }

            await handleRazorpay(response)
            if (isCartMode) clearCart()
        } catch (err) {
            toast.error(err.message || 'Failed to place order. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleRazorpay = async (data) => {
        const loaded = await loadRazorpayScript()
        if (!loaded) { toast.error('Failed to load payment gateway. Please try again.'); return }

        return new Promise((resolve) => {
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency || 'INR',
                name: 'Harlon Jersey Store',
                description: product?.name || 'Jersey Order',
                order_id: data.razorpayOrderId,
                prefill: { name: form.fullName, email: form.email, contact: form.phone },
                theme: { color: '#C8962B' }, // gold
                handler: () => { setSuccess({ orderId: data.orderId, trackToken: data.trackToken }); resolve() },
                modal: { ondismiss: () => { toast.info('Payment cancelled. Your order is saved.'); resolve() } },
            }
            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', (resp) => {
                toast.error(`Payment failed: ${resp.error?.description || 'Unknown error'}`)
                resolve()
            })
            rzp.open()
        })
    }

    // ── Track link ───────────────────────────────────────────────────────────
    const trackLink = success?.trackToken
        ? `${window.location.origin}/t/${success.trackToken}`
        : success
            ? `${window.location.origin}/track-order?orderId=${success.orderId}&email=${encodeURIComponent(form.email)}`
            : ''

    const handleCopyLink = () => {
        navigator.clipboard.writeText(trackLink)
            .then(() => toast.success('Tracking link copied!'))
            .catch(() => toast.error('Copy failed'))
    }

    // ── Indian price format ──────────────────────────────────────────────────
    const fmt = (n) => new Intl.NumberFormat('en-IN').format(n)

    // ── Success ──────────────────────────────────────────────────────────────
    if (success) {
        return (
            <OrderSuccess
                order={{ ...success, productName: product?.name, product }}
                trackLink={trackLink}
                onCopyLink={handleCopyLink}
                whatsappNumber={WHATSAPP_NUMBER}
            />
        )
    }

    // ── Not found — only block if NOT cart mode ──────────────────────────────
    if (!isCartMode && !product) {
        return (
            <div className="co-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 12, fontSize: 24 }}>
                        No product selected
                    </h2>
                    <button className="co-submit" style={{ width: 'auto', padding: '14px 32px', display: 'inline-flex' }} onClick={() => navigate('/shop')}>
                        Go to Shop
                    </button>
                </div>
            </div>
        )
    }

    // Cart mode with empty cart — redirect to shop
    if (isCartMode && cartItems.length === 0) {
        return (
            <div className="co-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', padding: 32 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 12, fontSize: 24 }}>
                        Your cart is empty
                    </h2>
                    <button className="co-submit" style={{ width: 'auto', padding: '14px 32px', display: 'inline-flex' }} onClick={() => navigate('/shop')}>
                        Go to Shop
                    </button>
                </div>
            </div>
        )
    }

    const price = product.price
    const discountAmt = appliedOffer?.discountAmount ?? 0
    const finalPrice = Math.max(0, price - discountAmt)
    const submitLabel = loading
        ? 'Processing…'
        : paymentMethod === 'whatsapp'
            ? '💬 Place WhatsApp Order'
            : `🔒 Pay Securely — ₹${fmt(finalPrice)}`

    const tap = prefersReduced ? {} : { scale: 0.97 }
    const hover = prefersReduced ? {} : { scale: 1.01 }

    return (
        <div className="co-page">
            <div className="co-container">
                {/* ── Header ── */}
                <motion.div
                    className="co-header"
                    initial={prefersReduced ? {} : { opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                >
                    <span className="co-eyebrow">Harlon Jerseys</span>
                    <h1 className="co-title">Checkout</h1>
                </motion.div>

                {/* ── Collapsible summary (mobile only) ── */}
                <div className="co-summary-toggle" onClick={() => setSummaryOpen(o => !o)}>
                    {product.images?.[0] && (
                        <img src={product.images[0]} alt={product.name} className="co-summary-toggle-img" />
                    )}
                    <span className="co-summary-toggle-label">
                        {summaryOpen ? 'Hide' : 'Show'} order summary
                        {summaryOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                    <span className="co-summary-toggle-price">₹{fmt(finalPrice)}</span>
                </div>

                <AnimatePresence>
                    {summaryOpen && (
                        <motion.div
                            initial={prefersReduced ? {} : { height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={prefersReduced ? {} : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: 'hidden', marginBottom: 12 }}
                        >
                            <SummaryPanel product={product} form={form} setForm={setForm} fmt={fmt} prefersReduced={prefersReduced} appliedOffer={appliedOffer} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main grid ── */}
                <div className="co-grid">
                    {/* ── Form ── */}
                    <motion.form
                        className="co-card"
                        onSubmit={handleSubmit}
                        noValidate
                        initial={prefersReduced ? {} : { opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.38, delay: 0.05 }}
                    >
                        <h2 className="co-card-title">Billing Details</h2>

                        {/* ── Payment method (FIRST) ── */}
                        <p className="co-section-label">Payment Method</p>
                        
                        {!orderSettings.onlinePaymentEnabled && !orderSettings.whatsappOrderEnabled ? (
                            <div className="co-wa-notice" style={{ marginBottom: 16 }}>
                                🚫 <strong>Orders are currently disabled.</strong> We are not accepting any new orders at the moment. Please check back later.
                            </div>
                        ) : (
                            <div className="co-pay-grid">
                                {orderSettings.onlinePaymentEnabled && (
                                    <button
                                        type="button"
                                        className={`co-pay-card${paymentMethod === 'razorpay' ? ' selected' : ''}`}
                                        onClick={() => setPaymentMethod('razorpay')}
                                        aria-pressed={paymentMethod === 'razorpay'}
                                    >
                                        <span className="co-pay-icon">💳</span>
                                        <span className="co-pay-label">Pay Online</span>
                                        <span className="co-pay-sub">UPI · Cards · Netbanking</span>
                                        <span className="co-pay-badge">⚡ Recommended</span>
                                    </button>
                                )}
                                {orderSettings.whatsappOrderEnabled && (
                                    <button
                                        type="button"
                                        className={`co-pay-card${paymentMethod === 'whatsapp' ? ' selected' : ''}`}
                                        onClick={() => setPaymentMethod('whatsapp')}
                                        aria-pressed={paymentMethod === 'whatsapp'}
                                    >
                                        <span className="co-pay-icon"><FaWhatsapp style={{ color: '#25D366' }} /></span>
                                        <span className="co-pay-label">WhatsApp</span>
                                        <span className="co-pay-sub">Confirm manually</span>
                                    </button>
                                )}
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            {paymentMethod === 'razorpay' && (
                                <motion.div
                                    key="rp-notice"
                                    initial={prefersReduced ? {} : { opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: 16 }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', fontFamily: 'Inter, sans-serif' }}>
                                        🔒 <span>100% secure payment powered by <strong>Razorpay</strong></span>
                                    </div>
                                </motion.div>
                            )}
                            {paymentMethod === 'whatsapp' && (
                                <motion.div
                                    key="wa-notice"
                                    className="co-wa-notice"
                                    initial={prefersReduced ? {} : { opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: 16 }}
                                >
                                    📲 <strong>WhatsApp orders:</strong> Fill your address below, place the order, and our team will WhatsApp you to confirm availability and arrange COD/UPI payment.
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Contact ── */}
                        <p className="co-section-label">Contact</p>

                        <div className="co-row">
                            <Field
                                label="Full Name *"
                                error={fieldErrors.fullName}
                                touched={touched.fullName}
                                valid={!fieldErrors.fullName}
                            >
                                <input
                                    className={`co-input${touched.fullName ? (fieldErrors.fullName ? ' invalid' : ' valid') : ''}`}
                                    type="text" name="fullName" value={form.fullName}
                                    onChange={handleChange} onBlur={handleBlur}
                                    placeholder="First Last" autoComplete="name"
                                />
                            </Field>

                            <Field
                                label="Phone *"
                                error={fieldErrors.phone}
                                touched={touched.phone}
                                valid={!fieldErrors.phone}
                            >
                                <div className="co-phone-wrap">
                                    <span className="co-phone-prefix">+91</span>
                                    <input
                                        className={`co-input co-input--phone${touched.phone ? (fieldErrors.phone ? ' invalid' : ' valid') : ''}`}
                                        type="tel" name="phone" value={form.phone}
                                        onChange={handleChange} onBlur={handleBlur}
                                        placeholder="98765 43210"
                                        inputMode="tel" autoComplete="tel"
                                        maxLength={11}
                                    />
                                </div>
                            </Field>
                        </div>

                        <Field
                            label="Email *"
                            error={fieldErrors.email}
                            touched={touched.email}
                            valid={!fieldErrors.email}
                        >
                            <input
                                className={`co-input${touched.email ? (fieldErrors.email ? ' invalid' : ' valid') : ''}`}
                                type="email" name="email" value={form.email}
                                onChange={handleChange} onBlur={handleBlur}
                                placeholder="you@example.com" autoComplete="email"
                            />
                        </Field>

                        {/* ── Address ── */}
                        <p className="co-section-label" style={{ marginTop: 8 }}>Delivery Address</p>

                        <Field
                            label="Street Address *"
                            error={fieldErrors.streetAddress}
                            touched={touched.streetAddress}
                            valid={!fieldErrors.streetAddress}
                        >
                            <input
                                className={`co-input${touched.streetAddress ? (fieldErrors.streetAddress ? ' invalid' : ' valid') : ''}`}
                                type="text" name="streetAddress" value={form.streetAddress}
                                onChange={handleChange} onBlur={handleBlur}
                                placeholder="House number and street name"
                                autoComplete="street-address"
                            />
                        </Field>

                        <Field label="Apartment / Flat / Landmark" optional>
                            <input
                                className="co-input"
                                type="text" name="apartment" value={form.apartment}
                                onChange={handleChange}
                                placeholder="Flat 4B, Near ABC Mall…"
                                autoComplete="address-line2"
                            />
                        </Field>

                        <div className="co-row">
                            <Field
                                label="City / Town *"
                                error={fieldErrors.city}
                                touched={touched.city}
                                valid={!fieldErrors.city}
                            >
                                <input
                                    className={`co-input${touched.city ? (fieldErrors.city ? ' invalid' : ' valid') : ''}`}
                                    type="text" name="city" value={form.city}
                                    onChange={handleChange} onBlur={handleBlur}
                                    placeholder="Mumbai" autoComplete="address-level2"
                                />
                            </Field>

                            <Field
                                label="PIN Code *"
                                error={fieldErrors.pinCode}
                                touched={touched.pinCode}
                                valid={!fieldErrors.pinCode}
                            >
                                <input
                                    className={`co-input${touched.pinCode ? (fieldErrors.pinCode ? ' invalid' : ' valid') : ''}`}
                                    type="text" name="pinCode" value={form.pinCode}
                                    onChange={handleChange} onBlur={handleBlur}
                                    placeholder="400001"
                                    inputMode="numeric" autoComplete="postal-code"
                                    maxLength={6}
                                />
                            </Field>
                        </div>

                        <Field label="State *" error={fieldErrors.state} touched={touched.state} valid={!fieldErrors.state}>
                            <div className="co-select-wrap">
                                <select
                                    className={`co-select${touched.state ? (fieldErrors.state ? ' invalid' : ' valid') : ''}`}
                                    name="state" value={form.state}
                                    onChange={handleChange} onBlur={handleBlur}
                                    autoComplete="address-level1"
                                >
                                    {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                </select>
                            </div>
                        </Field>

                        {/* ── Order notes toggle ── */}
                        <button
                            type="button"
                            className="co-notes-toggle"
                            onClick={() => setShowNotes(n => !n)}
                        >
                            {showNotes ? <FiChevronUp /> : <FiChevronDown />}
                            {showNotes ? 'Hide' : 'Add'} order notes
                        </button>

                        <AnimatePresence>
                            {showNotes && (
                                <motion.div
                                    initial={prefersReduced ? {} : { height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={prefersReduced ? {} : { height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <Field>
                                        <textarea
                                            className="co-textarea"
                                            name="orderNotes" value={form.orderNotes}
                                            onChange={handleChange}
                                            placeholder="Special instructions, colour preferences, gifting notes…"
                                            rows={3}
                                        />
                                    </Field>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Promo Code ── */}
                        <div style={{ marginTop: 8, marginBottom: 4 }}>
                            <p className="co-section-label">Promo Code</p>
                            {appliedOffer ? (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    borderRadius: 10, padding: '10px 14px',
                                }}>
                                    <FiTag color="#16a34a" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: '#15803d', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
                                            {appliedOffer.code}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#166534' }}>
                                            {appliedOffer.description}
                                            {appliedOffer.discountAmount > 0 && (
                                                <span style={{ fontWeight: 700 }}> — ₹{fmt(appliedOffer.discountAmount)} saved</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removePromo}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}
                                        aria-label="Remove promo code"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input
                                        className="co-input"
                                        style={{ flex: 1, fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}
                                        placeholder="Enter promo code"
                                        value={promoInput}
                                        onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                                        disabled={promoValidating}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyPromo}
                                        disabled={promoValidating || !promoInput.trim()}
                                        style={{
                                            padding: '0 20px', borderRadius: 10, border: 'none',
                                            background: '#0A0A0A', color: '#fff',
                                            fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
                                            cursor: promoValidating ? 'wait' : 'pointer',
                                            whiteSpace: 'nowrap', minHeight: 44,
                                        }}
                                    >
                                        {promoValidating ? '…' : 'Apply'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Submit ── */}
                        <motion.button
                            type="submit"
                            className={`co-submit${paymentMethod === 'whatsapp' ? ' co-submit-wa' : ''}`}
                            disabled={loading || (!orderSettings.onlinePaymentEnabled && !orderSettings.whatsappOrderEnabled)}
                            whileHover={loading || (!orderSettings.onlinePaymentEnabled && !orderSettings.whatsappOrderEnabled) ? {} : hover}
                            whileTap={loading || (!orderSettings.onlinePaymentEnabled && !orderSettings.whatsappOrderEnabled) ? {} : tap}
                        >
                            {submitLabel}
                        </motion.button>

                        <div className="co-submit-trust">
                            🔒 No hidden charges · Free shipping · 7-day returns
                        </div>
                    </motion.form>

                    {/* ── Order summary (desktop sticky) ── */}
                    <div className="co-summary-card-wrap">
                        <SummaryPanel product={product} form={form} setForm={setForm} fmt={fmt} prefersReduced={prefersReduced} appliedOffer={appliedOffer} />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Order summary panel (shared: mobile collapsible + desktop sticky) ─────────
function SummaryPanel({ product, form, setForm, fmt, prefersReduced, appliedOffer }) {
    const price = product.price
    const hasDiscount = product.originalPrice && product.originalPrice > product.price
    const promoDiscount = appliedOffer?.discountAmount ?? 0
    const finalTotal = Math.max(0, price - promoDiscount)

    return (
        <div className="co-summary-card">
            <h3 className="co-card-title">Order Summary</h3>

            <div className="co-summary-product">
                {product.images?.[0] && (
                    <img src={product.images[0]} alt={product.name} className="co-summary-img" />
                )}
                <div className="co-summary-info">
                    <div className="co-summary-cat">{product.category}</div>
                    <p className="co-summary-name">{product.name}</p>
                    <div className="co-summary-price">₹{fmt(price)}</div>
                </div>
            </div>

            {/* Size selector in summary */}
            {product.sizes?.length > 0 && (
                <div>
                    <span className="co-size-label">Size *</span>
                    <div className="co-sizes">
                        {product.sizes.map(s => (
                            <motion.button
                                key={s}
                                type="button"
                                className={`co-size-btn${form.size === s ? ' selected' : ''}`}
                                onClick={() => setForm(f => ({ ...f, size: s }))}
                                whileTap={prefersReduced ? {} : { scale: 0.94 }}
                            >
                                {s}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            <div className="co-summary-divider" />

            <div className="co-price-row">
                <span>{hasDiscount ? 'MRP' : 'Subtotal'}</span>
                <span>₹{fmt(hasDiscount ? product.originalPrice : price)}</span>
            </div>
            {hasDiscount && (
                <div className="co-price-row free">
                    <span>Discount</span>
                    <span>−₹{fmt(product.originalPrice - price)}</span>
                </div>
            )}
            {promoDiscount > 0 && (
                <div className="co-price-row free">
                    <span>Promo ({appliedOffer.code})</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>−₹{fmt(promoDiscount)}</span>
                </div>
            )}
            <div className="co-price-row free">
                <span>Delivery</span>
                <span>{appliedOffer?.discountType === 'freeship' ? 'FREE 🎁' : 'FREE 🎉'}</span>
            </div>

            <div className="co-summary-divider" />

            <div className="co-price-total">
                <span>Total</span>
                <span className="co-price-total-num">₹{fmt(finalTotal)}</span>
            </div>

            <div style={{ marginTop: 12, fontSize: 11, color: '#aaa', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                🇮🇳 Made in India · Ships within 24h
            </div>
        </div>
    )
}

export default Checkout

