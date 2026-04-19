import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiUser, FiPackage, FiMapPin, FiSettings, FiLogOut,
    FiChevronRight, FiEdit2, FiCheck, FiX, FiShoppingBag,
    FiTruck, FiClock, FiCheckCircle, FiAlertCircle,
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api/user.api'

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

const STATUS_CONFIG = {
    processing:         { icon: FiClock,        color: '#f59e0b', label: 'Processing',         bg: 'rgba(245,158,11,0.1)' },
    confirmed:          { icon: FiCheckCircle,  color: '#3b82f6', label: 'Confirmed',           bg: 'rgba(59,130,246,0.1)' },
    packed:             { icon: FiPackage,       color: '#8b5cf6', label: 'Packed',              bg: 'rgba(139,92,246,0.1)' },
    shipped:            { icon: FiTruck,         color: '#06b6d4', label: 'Shipped',             bg: 'rgba(6,182,212,0.1)'  },
    'out-for-delivery': { icon: FiTruck,         color: '#f97316', label: 'Out for Delivery',   bg: 'rgba(249,115,22,0.1)' },
    delivered:          { icon: FiCheckCircle,  color: '#16a34a', label: 'Delivered',            bg: 'rgba(22,163,74,0.1)'  },
    cancelled:          { icon: FiAlertCircle,  color: '#dc2626', label: 'Cancelled',            bg: 'rgba(220,38,38,0.1)'  },
}

const INDIAN_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
    'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh','Delhi','Jammu and Kashmir','Ladakh','Puducherry',
]

export default function ProfilePage() {
    const { user, isLoggedIn, userLogout, getUserToken } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('orders')
    const [orders, setOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(false)

    // Profile edit
    const [editingProfile, setEditingProfile] = useState(false)
    const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
    const [savingProfile, setSavingProfile] = useState(false)

    // Address
    const [editingAddress, setEditingAddress] = useState(false)
    const [addrForm, setAddrForm] = useState({
        streetAddress: '', apartment: '', city: '', state: 'Delhi', pinCode: '', country: 'India'
    })
    const [savingAddr, setSavingAddr] = useState(false)

    useEffect(() => {
        if (!isLoggedIn) { navigate('/login?next=/profile'); return }
        setProfileForm({ name: user.name || '', phone: user.phone || '' })
        if (user.address) setAddrForm({ ...addrForm, ...user.address })
        fetchOrders()
    }, [isLoggedIn])

    const fetchOrders = async () => {
        const token = getUserToken()
        if (!token) return
        setOrdersLoading(true)
        try {
            const data = await userApi.getOrders(token)
            if (data.success) setOrders(data.data.orders || [])
        } catch { } finally { setOrdersLoading(false) }
    }

    const handleSaveProfile = async () => {
        const token = getUserToken()
        setSavingProfile(true)
        try {
            const r = await fetch(`${API}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(profileForm),
            })
            const data = await r.json()
            if (data.success) {
                toast.success('Profile updated ✓')
                // Update localStorage
                const stored = JSON.parse(localStorage.getItem('harlon_user_data') || '{}')
                localStorage.setItem('harlon_user_data', JSON.stringify({ ...stored, ...data.data.user }))
                setEditingProfile(false)
            } else toast.error(data.message)
        } catch { toast.error('Failed to update') } finally { setSavingProfile(false) }
    }

    const handleSaveAddress = async () => {
        const token = getUserToken()
        setSavingAddr(true)
        try {
            const r = await fetch(`${API}/user/address`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(addrForm),
            })
            const data = await r.json()
            if (data.success) { toast.success('Address saved ✓'); setEditingAddress(false) }
            else toast.error(data.message)
        } catch { toast.error('Failed to save') } finally { setSavingAddr(false) }
    }

    if (!isLoggedIn) return null

    return (
        <div style={{ minHeight: '100vh', background: 'var(--surface, #fff)', paddingBottom: 80 }}>
            {/* Hero header */}
            <div style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1006 100%)',
                padding: '48px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, hsla(38,65%,55%,0.1) 0%,transparent 70%)', pointerEvents: 'none' }} />

                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
                    {user.avatar
                        ? <img src={user.avatar} alt={user.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid hsl(38,65%,55%)', boxShadow: '0 0 0 4px rgba(200,150,43,0.2)' }} />
                        : <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'hsl(38,65%,55%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#0a0a0a', border: '3px solid rgba(200,150,43,0.4)', boxShadow: '0 0 0 4px rgba(200,150,43,0.1)' }}>
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                    }
                </div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#f5f0e8', fontSize: 24, margin: '0 0 4px' }}>{user.name}</h1>
                <p style={{ color: '#888', fontFamily: 'Inter, sans-serif', fontSize: 13, margin: 0 }}>{user.email}</p>
                {user.phone && <p style={{ color: '#666', fontFamily: 'Inter, sans-serif', fontSize: 12, margin: '4px 0 0' }}>📱 {user.phone}</p>}
            </div>

            {/* Tabs */}
            <div style={{
                maxWidth: 640, margin: '-32px auto 0', padding: '0 16px',
                position: 'relative', zIndex: 2,
            }}>
                <div style={{
                    background: 'var(--surface, #fff)',
                    borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
                    overflow: 'hidden', border: '1px solid rgba(200,150,43,0.1)',
                }}>
                    {/* Tab bar */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(200,150,43,0.08)' }}>
                        {[
                            { id: 'orders', icon: FiPackage, label: 'Orders' },
                            { id: 'address', icon: FiMapPin, label: 'Address' },
                            { id: 'account', icon: FiSettings, label: 'Account' },
                        ].map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                style={{
                                    flex: 1, padding: '16px 8px', border: 'none', cursor: 'pointer',
                                    background: activeTab === id ? 'rgba(200,150,43,0.06)' : 'transparent',
                                    color: activeTab === id ? 'hsl(38,65%,55%)' : 'var(--ink-60, #888)',
                                    fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                    borderBottom: activeTab === id ? '2px solid hsl(38,65%,55%)' : '2px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Icon size={18} />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            style={{ padding: '20px 20px 24px' }}
                        >
                            {activeTab === 'orders' && <OrdersTab orders={orders} loading={ordersLoading} />}
                            {activeTab === 'address' && (
                                <AddressTab
                                    addrForm={addrForm} setAddrForm={setAddrForm}
                                    editing={editingAddress} setEditing={setEditingAddress}
                                    saving={savingAddr} onSave={handleSaveAddress}
                                />
                            )}
                            {activeTab === 'account' && (
                                <AccountTab
                                    user={user} profileForm={profileForm} setProfileForm={setProfileForm}
                                    editing={editingProfile} setEditing={setEditingProfile}
                                    saving={savingProfile} onSave={handleSaveProfile}
                                    onLogout={() => { userLogout(); navigate('/') }}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({ orders, loading }) {
    if (loading) return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 32, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚡</div>
            <p style={{ color: '#888', fontFamily: 'Inter, sans-serif', marginTop: 12 }}>Loading orders…</p>
        </div>
    )

    if (orders.length === 0) return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: '#888', fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 20 }}>Your order history will appear here</p>
            <Link to="/shop" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'hsl(38,65%,55%)', color: '#0a0a0a',
                padding: '12px 24px', borderRadius: 10,
                fontFamily: 'Inter, sans-serif', fontWeight: 700, textDecoration: 'none', fontSize: 14,
            }}>
                <FiShoppingBag size={15} /> Shop Now
            </Link>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: '0 0 4px', color: 'var(--ink, #0a0a0a)' }}>
                Your Orders <span style={{ color: '#aaa', fontSize: 14, fontWeight: 400 }}>({orders.length})</span>
            </h3>
            {orders.map(order => {
                const cfg = STATUS_CONFIG[order.deliveryStatus] || STATUS_CONFIG.processing
                const StatusIcon = cfg.icon
                const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()
                return (
                    <Link
                        key={order._id}
                        to={order.trackToken ? `/t/${order.trackToken}` : `/track-order?orderId=${order.orderId}&email=${order.customer?.email}`}
                        style={{
                            display: 'block', textDecoration: 'none',
                            border: '1px solid rgba(200,150,43,0.12)', borderRadius: 14,
                            padding: '14px 16px', transition: 'all 0.2s',
                            background: 'var(--surface, #fff)',
                        }}
                    >
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            {/* Product image */}
                            {order.product?.image
                                ? <img src={order.product.image} alt={order.product?.name} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(200,150,43,0.15)' }} />
                                : <div style={{ width: 56, height: 56, borderRadius: 8, background: 'rgba(200,150,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👕</div>
                            }
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, margin: '0 0 3px', color: 'var(--ink, #0a0a0a)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {order.product?.name || 'Jersey Order'}
                                </p>
                                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888', margin: '0 0 8px' }}>
                                    #{order.orderId} · Size {order.product?.size}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        padding: '3px 10px', borderRadius: 20,
                                        background: cfg.bg, color: cfg.color,
                                        fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
                                    }}>
                                        <StatusIcon size={10} /> {cfg.label}
                                    </span>
                                    <span style={{ color: 'hsl(38,65%,55%)', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14 }}>
                                        {fmt(order.amount || order.product?.price || 0)}
                                    </span>
                                </div>
                            </div>
                            <FiChevronRight size={16} color="#ccc" style={{ flexShrink: 0, marginTop: 4 }} />
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

// ── Address Tab ───────────────────────────────────────────────────────────────
function AddressTab({ addrForm, setAddrForm, editing, setEditing, saving, onSave }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: 0, color: 'var(--ink, #0a0a0a)' }}>Delivery Address</h3>
                {!editing && (
                    <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(200,150,43,0.1)', color: 'hsl(38,65%,55%)', border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <FiEdit2 size={13} /> Edit
                    </button>
                )}
            </div>

            {!editing && addrForm.streetAddress ? (
                <div style={{ background: 'rgba(200,150,43,0.04)', border: '1px solid rgba(200,150,43,0.12)', borderRadius: 12, padding: '16px' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--ink, #0a0a0a)', margin: 0, lineHeight: 1.6 }}>
                        {addrForm.streetAddress}{addrForm.apartment ? `, ${addrForm.apartment}` : ''}<br />
                        {addrForm.city}, {addrForm.state} — {addrForm.pinCode}<br />
                        {addrForm.country}
                    </p>
                </div>
            ) : !editing ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <FiMapPin size={32} color="#ccc" style={{ marginBottom: 12 }} />
                    <p style={{ color: '#888', fontFamily: 'Inter, sans-serif', fontSize: 14 }}>No address saved yet</p>
                    <button onClick={() => setEditing(true)} style={{ marginTop: 12, background: 'hsl(38,65%,55%)', color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '10px 20px', fontFamily: 'Inter, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        + Add Address
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                        { name: 'streetAddress', label: 'Street Address', placeholder: 'House No. & Street' },
                        { name: 'apartment', label: 'Apartment / Landmark', placeholder: 'Flat 4B, Near ABC Mall (optional)' },
                        { name: 'city', label: 'City', placeholder: 'Mumbai' },
                        { name: 'pinCode', label: 'PIN Code', placeholder: '400001', type: 'tel' },
                    ].map(({ name, label, placeholder, type }) => (
                        <div key={name}>
                            <label style={labelSt}>{label}</label>
                            <input
                                value={addrForm[name]} type={type || 'text'}
                                onChange={e => setAddrForm(f => ({ ...f, [name]: e.target.value }))}
                                placeholder={placeholder} style={inputSt}
                            />
                        </div>
                    ))}
                    <div>
                        <label style={labelSt}>State</label>
                        <select value={addrForm.state} onChange={e => setAddrForm(f => ({ ...f, state: e.target.value }))} style={{ ...inputSt, cursor: 'pointer' }}>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                        <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(128,128,128,0.2)', background: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#888' }}>
                            <FiX size={14} /> Cancel
                        </button>
                        <button onClick={onSave} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'hsl(38,65%,55%)', color: '#0a0a0a', cursor: saving ? 'wait' : 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            {saving ? '…' : <><FiCheck size={14} /> Save Address</>}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ── Account Tab ───────────────────────────────────────────────────────────────
function AccountTab({ user, profileForm, setProfileForm, editing, setEditing, saving, onSave, onLogout }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: 0, color: 'var(--ink, #0a0a0a)' }}>Account Details</h3>
                {!editing && (
                    <button onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(200,150,43,0.1)', color: 'hsl(38,65%,55%)', border: 'none', borderRadius: 8, padding: '8px 14px', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                        <FiEdit2 size={13} /> Edit
                    </button>
                )}
            </div>

            {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={labelSt}>Full Name</label>
                        <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" style={inputSt} />
                    </div>
                    <div>
                        <label style={labelSt}>Phone</label>
                        <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="98765 43210" type="tel" style={inputSt} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1px solid rgba(128,128,128,0.2)', background: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 13, color: '#888' }}>
                            Cancel
                        </button>
                        <button onClick={onSave} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: 'hsl(38,65%,55%)', color: '#0a0a0a', cursor: saving ? 'wait' : 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14 }}>
                            {saving ? '…' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 24 }}>
                    {[
                        { label: 'Name', value: user.name },
                        { label: 'Email', value: user.email },
                        { label: 'Phone', value: user.phone || '—' },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(200,150,43,0.06)' }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#888', fontWeight: 500 }}>{label}</span>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--ink, #0a0a0a)', fontWeight: 600 }}>{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Logout */}
            <button
                onClick={onLogout}
                style={{
                    width: '100%', marginTop: 8, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    borderRadius: 12, border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.05)',
                    color: '#dc2626', fontFamily: 'Inter, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 14,
                }}
            >
                <FiLogOut size={16} /> Sign Out
            </button>
        </div>
    )
}

const labelSt = {
    display: 'block', marginBottom: 5,
    fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700,
    color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em',
}
const inputSt = {
    width: '100%', padding: '11px 14px', borderRadius: 10, boxSizing: 'border-box',
    border: '1px solid rgba(200,150,43,0.15)', background: 'rgba(200,150,43,0.04)',
    fontFamily: 'Inter, sans-serif', fontSize: 14, color: 'var(--ink, #0a0a0a)', outline: 'none',
}
