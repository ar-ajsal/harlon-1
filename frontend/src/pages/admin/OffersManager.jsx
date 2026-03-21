import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiToggleLeft, FiToggleRight, FiPercent, FiDollarSign, FiTruck, FiTag } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { offersApi } from '../../api/offers.api'
import { productsApi } from '../../api/products.api'
import { categoriesApi } from '../../api/categories.api'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

/* ── Helpers ───────────────────────────────────────────────── */
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const DISCOUNT_TYPES = [
    { value: 'percentage', label: 'Percentage (%)' },
    { value: 'fixed', label: 'Fixed Amount (₹)' },
]

const TYPE_META = {
    percentage: { icon: <FiPercent size={12} />, color: '#2563eb', bg: '#eff6ff', label: '% OFF' },
    fixed:      { icon: <FiDollarSign size={12} />, color: '#16a34a', bg: '#f0fdf4', label: '₹ OFF' },
    freeship:   { icon: <FiTruck size={12} />, color: '#7c3aed', bg: '#f5f3ff', label: 'SHIP' },
}

const DEFAULT_FORM = {
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    isActive: true,
    applicableTo: 'all',        // 'all' | 'categories' | 'products'
    categories: '',             // comma-separated category names
    products: '',               // comma-separated product IDs
}

function StatCard({ icon, label, value, color }) {
    return (
        <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: 10, background: color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, fontSize: 18, flexShrink: 0,
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontWeight: 700, fontSize: 22, color: '#111', lineHeight: 1.1 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            </div>
        </div>
    )
}

/* ── Main component ─────────────────────────────────────────── */
export default function OffersManager() {
    const [offers, setOffers] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(DEFAULT_FORM)
    const [search, setSearch] = useState('')
    const [allProducts, setAllProducts] = useState([])
    const [allCategories, setAllCategories] = useState([])
    const [prodSearch, setProdSearch] = useState('')

    useEffect(() => { fetchAll() }, [])

    async function fetchAll() {
        try {
            setLoading(true)
            const [offersRes, statsRes, prodsRes, catsRes] = await Promise.all([
                offersApi.getAll(),
                offersApi.getStats(),
                productsApi.getAll({ limit: 1000, _admin: true }),
                categoriesApi.getAll({ limit: 1000 }),
            ])
            const data = offersRes.data?.data?.data || offersRes.data?.data || []
            setOffers(Array.isArray(data) ? data : [])
            setStats(statsRes.data?.data || null)
            
            setAllProducts(prodsRes.data?.data?.products || prodsRes.data?.data || [])
            setAllCategories(catsRes.data?.data || catsRes.data || [])
        } catch (err) {
            console.error(err)
            toast.error('Failed to load offers')
        } finally {
            setLoading(false)
        }
    }

    function openCreate() {
        setEditing(null)
        setForm(DEFAULT_FORM)
        setShowModal(true)
    }

    function openEdit(offer) {
        setEditing(offer)
        setForm({
            description: offer.description || '',
            discountType: offer.discountType,
            discountValue: offer.discountValue,
            startDate: offer.startDate?.split('T')[0] || '',
            expiryDate: offer.expiryDate?.split('T')[0] || '',
            isActive: offer.isActive,
            applicableTo: offer.applicableTo || 'all',
            categories: (offer.categories || []).join(', '),
            products: (offer.products || []).join(', '),
        })
        setShowModal(true)
    }

    function generateCode() {
        const prefix = ['HARLON', 'SALE', 'DROP', 'WIN'][Math.floor(Math.random() * 4)]
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        setForm(f => ({ ...f, code: `${prefix}${suffix}` }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.description.trim()) { toast.error('Description is required'); return }
        if (!form.expiryDate) { toast.error('Expiry date is required'); return }
        if (form.discountType !== 'freeship' && (!form.discountValue || form.discountValue <= 0)) {
            toast.error('Discount value must be greater than 0'); return
        }
        if (form.discountType === 'percentage' && form.discountValue > 100) {
            toast.error('Percentage cannot exceed 100'); return
        }

        const payload = {
            ...form,
            code: editing?.code || Math.random().toString(36).substring(2, 9).toUpperCase(),
            discountValue: parseFloat(form.discountValue) || 0,
            maxDiscount: null,
            minOrderAmount: 0,
            usageLimit: null,
            perUserLimit: 1,
            applicableTo: form.applicableTo,
            categories: form.applicableTo === 'categories'
                ? form.categories.split(',').map(s => s.trim()).filter(Boolean)
                : [],
            products: form.applicableTo === 'products'
                ? form.products.split(',').map(s => s.trim()).filter(Boolean)
                : [],
        }

        try {
            setSaving(true)
            if (editing) {
                await offersApi.update(editing._id, payload)
                toast.success('Offer updated!')
            } else {
                await offersApi.create(payload)
                toast.success('Offer created!')
            }
            setShowModal(false)
            fetchAll()
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Failed to save offer')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id) {
        if (!window.confirm('Delete this offer? This cannot be undone.')) return
        try {
            await offersApi.delete(id)
            toast.success('Offer deleted')
            fetchAll()
        } catch (err) {
            toast.error('Failed to delete offer')
        }
    }

    async function toggleActive(offer) {
        try {
            await offersApi.update(offer._id, { isActive: !offer.isActive })
            toast.success(offer.isActive ? 'Offer deactivated' : 'Offer activated')
            fetchAll()
        } catch {
            toast.error('Failed to update status')
        }
    }

    const filtered = offers.filter(o =>
        !search || o.code.includes(search.toUpperCase()) || o.description?.toLowerCase().includes(search.toLowerCase())
    )

    function offerStatus(offer) {
        const now = new Date()
        if (!offer.isActive) return { label: 'Inactive', color: '#6b7280', bg: '#f3f4f6' }
        if (now > new Date(offer.expiryDate)) return { label: 'Expired', color: '#dc2626', bg: '#fef2f2' }
        if (offer.usageLimit && offer.usedCount >= offer.usageLimit) return { label: 'Exhausted', color: '#d97706', bg: '#fffbeb' }
        return { label: 'Active', color: '#16a34a', bg: '#f0fdf4' }
    }

    return (
        <AdminLayout
            title="Offer Management"
            subtitle="Create & manage promo codes for checkout discounts"
            headerRight={
                <button className="btn btn-primary" onClick={openCreate}>
                    <FiPlus /> New Offer
                </button>
            }
        >
            {/* Stats row */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <StatCard icon={<FiTag />} label="Total Offers" value={stats.total} color="#2563eb" />
                    <StatCard icon={<FiToggleRight />} label="Active" value={stats.active} color="#16a34a" />
                    <StatCard icon={<FiX />} label="Expired" value={stats.expired} color="#dc2626" />
                    <StatCard icon={<FiPercent />} label="Total Used" value={stats.totalUsage} color="#7c3aed" />
                </div>
            )}

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
                <input
                    className="form-input"
                    style={{ maxWidth: 320 }}
                    placeholder="Search by code or description…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>Loading offers…</div>
            ) : (
                <div className="content-card">
                    {/* Mobile cards */}
                    <div className="mobile-card-list">
                        {filtered.map(offer => {
                            const st = offerStatus(offer)
                            const meta = TYPE_META[offer.discountType] || TYPE_META.percentage
                            return (
                                <div key={offer._id} className="mobile-card" onClick={() => openEdit(offer)}>
                                    <div className="mobile-card-content">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: st.bg, color: st.color }}>
                                                    {st.label}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#555', marginBottom: 4 }}>{offer.description}</div>
                                        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888' }}>
                                            <span>
                                                {offer.discountType === 'freeship' ? 'Free Shipping'
                                                    : offer.discountType === 'percentage' ? `${offer.discountValue}% off`
                                                        : `₹${offer.discountValue} off`}
                                            </span>
                                            <span>
                                                {offer.applicableTo === 'all' ? '🌍 All' :
                                                    offer.applicableTo === 'categories' ? `📂 ${(offer.categories || []).join(', ') || 'Categories'}` :
                                                        `🏷️ ${(offer.products || []).length} product(s)`}
                                            </span>
                                            <span>Used: {offer.usedCount}{offer.usageLimit ? `/${offer.usageLimit}` : ''}</span>
                                            <span>Exp: {fmtDate(offer.expiryDate)}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <button className="btn-icon" onClick={e => { e.stopPropagation(); toggleActive(offer) }}
                                            style={{ color: offer.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                                            {offer.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                        </button>
                                        <button className="btn-icon" onClick={e => { e.stopPropagation(); handleDelete(offer._id) }}
                                            style={{ color: 'var(--error)' }}>
                                            <FiTrash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Desktop table */}
                    <div className="table-responsive desktop-only">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Discount</th>
                                    <th>Scope</th>
                                    <th>Expiry</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(offer => {
                                    const st = offerStatus(offer)
                                    const meta = TYPE_META[offer.discountType] || TYPE_META.percentage
                                    return (
                                        <tr key={offer._id}>
                                            <td style={{ color: '#111', fontSize: 14, fontWeight: 600, maxWidth: 180 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <span style={{ color: meta.color }}>{meta.icon}</span>
                                                    {offer.description}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                {offer.discountType === 'freeship' ? '🚚 Free Shipping'
                                                    : offer.discountType === 'percentage'
                                                        ? `${offer.discountValue}%${offer.maxDiscount ? ` (max ${fmt(offer.maxDiscount)})` : ''}`
                                                        : fmt(offer.discountValue)}
                                            </td>
                                            <td style={{ fontSize: 12 }}>
                                                {offer.applicableTo === 'all' || !offer.applicableTo ? (
                                                    <span style={{ color: '#6b7280' }}>🌍 All</span>
                                                ) : offer.applicableTo === 'categories' ? (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 180 }}>
                                                        {(offer.categories || []).map(c => (
                                                            <span key={c} style={{
                                                                fontSize: 11, padding: '2px 7px', borderRadius: 99,
                                                                background: '#eff6ff', color: '#2563eb', fontWeight: 600,
                                                            }}>{c}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#7c3aed', fontWeight: 600 }}>🏷️ {(offer.products || []).length} product(s)</span>
                                                )}
                                            </td>
                                            <td style={{ fontSize: 13, color: new Date() > new Date(offer.expiryDate) ? '#dc2626' : '#374151' }}>
                                                {fmtDate(offer.expiryDate)}
                                            </td>
                                            <td>
                                                <button onClick={() => toggleActive(offer)} style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    border: 'none', cursor: 'pointer', padding: '4px 10px',
                                                    borderRadius: 16, fontSize: 12, fontWeight: 600,
                                                    background: st.bg, color: st.color,
                                                }}>
                                                    {offer.isActive ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                                                    {st.label}
                                                </button>
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button className="action-btn edit" onClick={() => openEdit(offer)} title="Edit">
                                                        <FiEdit2 />
                                                    </button>
                                                    <button className="action-btn delete" onClick={() => handleDelete(offer._id)} title="Delete">
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
                            {search ? 'No offers match your search.' : 'No offers yet. Click "New Offer" to create one.'}
                        </div>
                    )}
                </div>
            )}

            {/* ── Modal ─────────────────────────────────────── */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editing ? 'Edit Offer' : 'Create New Offer'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body-grid">
                                {/* Description */}
                                <div className="form-group">
                                    <label className="form-label">Description (shown to customer) *</label>
                                    <input
                                        className="form-input" required
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Describe the offer"
                                    />
                                </div>

                                {/* Discount type + value */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Discount Type *</label>
                                        <select
                                            className="form-input"
                                            value={form.discountType}
                                            onChange={e => setForm(f => ({ ...f, discountType: e.target.value, discountValue: 0 }))}
                                        >
                                            {DISCOUNT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Discount Value {form.discountType === 'percentage' ? '(%)' : '(₹)'} *
                                        </label>
                                        <input
                                            className="form-input" type="number" required
                                            min={1} max={form.discountType === 'percentage' ? 100 : undefined}
                                            value={form.discountValue}
                                            onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Start + Expiry */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="form-group">
                                        <label className="form-label">Start Date *</label>
                                        <input
                                            className="form-input" type="date" required
                                            value={form.startDate}
                                            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Expiry Date *</label>
                                        <input
                                            className="form-input" type="date" required
                                            value={form.expiryDate}
                                            onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* ── Applicable To ── */}
                                <div className="form-group">
                                    <label className="form-label">Applicable To *</label>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {[
                                            { value: 'all', label: '🌍 All Products' },
                                            { value: 'categories', label: '📂 By Category' },
                                            { value: 'products', label: '🏷️ Specific Products' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, applicableTo: opt.value }))}
                                                style={{
                                                    padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                                    border: form.applicableTo === opt.value ? '2px solid #0A0A0A' : '1px solid #d1d5db',
                                                    background: form.applicableTo === opt.value ? '#0A0A0A' : '#fff',
                                                    color: form.applicableTo === opt.value ? '#fff' : '#374151',
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Category input — shown when applicableTo = 'categories' */}
                                {form.applicableTo === 'categories' && (
                                    <div className="form-group">
                                        <label className="form-label">Select Categories *</label>
                                        <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fafafa' }}>
                                            {allCategories.map(cat => {
                                                const selectedCats = form.categories ? form.categories.split(',').map(s => s.trim()).filter(Boolean) : [];
                                                const isSelected = selectedCats.includes(cat.name);
                                                return (
                                                    <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', cursor: 'pointer', borderRadius: 4, background: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'transparent' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) selectedCats.push(cat.name);
                                                                else selectedCats.splice(selectedCats.indexOf(cat.name), 1);
                                                                setForm(f => ({ ...f, categories: selectedCats.join(', ') }));
                                                            }}
                                                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                                                        />
                                                        <span style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400 }}>{cat.name}</span>
                                                    </label>
                                                )
                                            })}
                                            {allCategories.length === 0 && <div style={{ fontSize: 13, color: '#888', padding: 8 }}>No categories found</div>}
                                        </div>
                                    </div>
                                )}

                                {/* Product IDs input — shown when applicableTo = 'products' */}
                                {form.applicableTo === 'products' && (
                                    <div className="form-group">
                                        <label className="form-label">Select Products *</label>
                                        <input 
                                            className="form-input" 
                                            placeholder="Search products to select..." 
                                            value={prodSearch} 
                                            onChange={e => setProdSearch(e.target.value)} 
                                            style={{ marginBottom: 8 }}
                                        />
                                        <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#fafafa' }}>
                                            {allProducts.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase())).map(p => {
                                                const selectedProds = form.products ? form.products.split(',').map(s => s.trim()).filter(Boolean) : [];
                                                const isSelected = selectedProds.includes(p._id);
                                                return (
                                                    <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', cursor: 'pointer', borderRadius: 4, background: isSelected ? 'rgba(37, 99, 235, 0.05)' : 'transparent' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isSelected}
                                                            onChange={(e) => {
                                                                if (e.target.checked) selectedProds.push(p._id);
                                                                else selectedProds.splice(selectedProds.indexOf(p._id), 1);
                                                                setForm(f => ({ ...f, products: selectedProds.join(', ') }));
                                                            }}
                                                            style={{ width: 16, height: 16, cursor: 'pointer' }}
                                                        />
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                                                            {p.images?.[0] ? 
                                                                <img src={p.images[0]} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover', background: '#e5e7eb' }} />
                                                                : <div style={{ width: 28, height: 28, borderRadius: 4, background: '#e5e7eb' }} />
                                                            }
                                                            <div>
                                                                <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 500 }}>{p.name}</div>
                                                                <div style={{ fontSize: 11, color: '#888' }}>{p.category} • ₹{p.price}</div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                            {allProducts.length === 0 && <div style={{ fontSize: 13, color: '#888', padding: 8 }}>No products available</div>}
                                        </div>
                                    </div>
                                )}

                                {/* Active toggle */}
                                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <input
                                        type="checkbox" id="offer-active"
                                        checked={form.isActive}
                                        onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                                    />
                                    <label htmlFor="offer-active" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                                        Offer is active (available to customers)
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving…' : (editing ? 'Update Offer' : 'Create Offer')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
