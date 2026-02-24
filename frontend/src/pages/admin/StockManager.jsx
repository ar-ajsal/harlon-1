import { useState } from 'react'
import { toast } from 'react-toastify'
import { useProducts } from '../../context/ProductContext'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function StockManager() {
    const { products, refreshData } = useProducts()
    const [editing, setEditing] = useState({}) // { [id]: "newValue" }
    const [saving, setSaving] = useState({}) // { [id]: true }
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')


    const startEdit = (p) => setEditing(e => ({ ...e, [p._id]: String(p.stock ?? 0) }))
    const cancelEdit = (id) => setEditing(e => { const n = { ...e }; delete n[id]; return n })

    const saveStock = async (id) => {
        const val = parseInt(editing[id], 10)
        if (isNaN(val) || val < 0) { toast.error('Enter a valid non-negative number'); return }
        setSaving(s => ({ ...s, [id]: true }))
        try {
            const res = await fetch(`${API_BASE}/products/${id}/stock`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('harlon_token')}`
                },
                body: JSON.stringify({ stock: val })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'Update failed')
            cancelEdit(id)
            toast.success(`Stock updated to ${val}`)
            if (refreshData) refreshData()
        } catch (err) {
            toast.error(err.message || 'Failed to update stock')
        } finally {
            setSaving(s => { const n = { ...s }; delete n[id]; return n })
        }
    }

    // Treat stock=0 as effectively out of stock regardless of the boolean flag
    const effectivelyInStock = (p) => p.inStock && (p.stock ?? 0) > 0
    const effectivelyOutOfStock = (p) => !p.inStock || (p.stock ?? 0) === 0
    // Low stock: inStock=true AND stock is 1-3 (not 0, that's out-of-stock)
    const effectivelyLow = (p) => p.inStock && (p.stock ?? 0) >= 1 && (p.stock ?? 0) <= 3

    const filtered = (products || []).filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
        const matchFilter =
            filter === 'instock' ? effectivelyInStock(p) :
                filter === 'outofstock' ? effectivelyOutOfStock(p) :
                    filter === 'low' ? effectivelyLow(p) : true
        return matchSearch && matchFilter
    })

    const total = (products || []).length
    const inStock = (products || []).filter(effectivelyInStock).length
    const outStock = (products || []).filter(effectivelyOutOfStock).length
    const lowStock = (products || []).filter(effectivelyLow).length

    return (
        <AdminLayout
            title="Stock Manager"
            subtitle="Manage product inventory levels"
            headerRight={<span className="date-badge">{total} products</span>}
        >

            {/* Summary Cards */}
            <div className="stock-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <div className="stat-value">{total}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <div className="stat-value" style={{ color: '#10b981' }}>{inStock}</div>
                    <div className="stat-label">In Stock</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <div className="stat-value" style={{ color: '#ef4444' }}>{outStock}</div>
                    <div className="stat-label">Out of Stock</div>
                </div>
                <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, cursor: 'pointer' }} onClick={() => setFilter('low')}>
                    <div className="stat-value" style={{ color: '#e67e22' }}>{lowStock}</div>
                    <div className="stat-label">Low (≤ 3) ⚠️</div>
                </div>
            </div>

            {/* Filters */}
            <div className="orders-filters" style={{ marginBottom: 16 }}>
                <div className="search-box">
                    <input
                        className="search-input"
                        style={{ paddingLeft: 16 }}
                        placeholder="Search by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="status-filters">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'instock', label: '✅ In Stock' },
                        { key: 'outofstock', label: '❌ Out of Stock' },
                        { key: 'low', label: '⚠️ Low Stock' }
                    ].map(f => (
                        <button
                            key={f.key}
                            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="orders-table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Stock</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                                    No products found
                                </td>
                            </tr>
                        )}
                        {filtered.map(p => {
                            const isEditing = p._id in editing
                            const isSaving = saving[p._id]
                            const stock = p.stock ?? 0
                            const isOut = !p.inStock || stock === 0   // stock=0 treated as out of stock
                            const isLow = p.inStock && stock >= 1 && stock <= 3  // low = 1-3, NOT 0

                            return (
                                <tr key={p._id} style={isOut ? { opacity: 0.65, background: '#fff5f5' } : {}}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {p.images?.[0] && (
                                                <img
                                                    src={p.images[0]} alt={p.name}
                                                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                                                />
                                            )}
                                            <span style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontSize: 13, color: '#6b7280' }}>{p.category}</td>
                                    <td style={{ fontWeight: 600 }}>₹{p.price}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                                            fontSize: 12, fontWeight: 600,
                                            background: p.inStock ? '#10b98122' : '#ef444422',
                                            color: p.inStock ? '#10b981' : '#ef4444',
                                            border: `1px solid ${p.inStock ? '#10b98144' : '#ef444444'}`
                                        }}>
                                            {p.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                                        </span>
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="number" min="0"
                                                className="form-input"
                                                style={{ width: 80, padding: '4px 8px', fontSize: 14 }}
                                                value={editing[p._id]}
                                                onChange={e => setEditing(ed => ({ ...ed, [p._id]: e.target.value }))}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') saveStock(p._id)
                                                    if (e.key === 'Escape') cancelEdit(p._id)
                                                }}
                                                autoFocus
                                            />
                                        ) : (
                                            <span style={{
                                                fontWeight: isLow ? 700 : 400,
                                                color: isLow ? '#e67e22' : (isOut ? '#ef4444' : 'inherit'),
                                                fontSize: 15
                                            }}>
                                                {stock}{isLow && ' ⚠️'}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '4px 12px', fontSize: 12 }}
                                                    onClick={() => saveStock(p._id)}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? '...' : 'Save'}
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ padding: '4px 10px', fontSize: 12 }}
                                                    onClick={() => cancelEdit(p._id)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '4px 14px', fontSize: 12 }}
                                                onClick={() => startEdit(p)}
                                            >
                                                ✏️ Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    )
}

export default StockManager
