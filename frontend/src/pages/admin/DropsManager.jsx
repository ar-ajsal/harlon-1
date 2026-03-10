import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const token = 'admin-authenticated'

function formatDateTime(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function DropsManager() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({ dropEnabled: false, dropStartTime: '', dropEndTime: '', dropQuantity: 0 })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch(`${API}/drops/admin/list`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setProducts(d.data) })
            .catch(() => toast.error('Failed to load products'))
            .finally(() => setLoading(false))
    }, [])

    const startEdit = (p) => {
        setEditingId(p._id)
        setForm({
            dropEnabled: p.dropEnabled || false,
            dropStartTime: p.dropStartTime ? new Date(p.dropStartTime).toISOString().slice(0, 16) : '',
            dropEndTime: p.dropEndTime ? new Date(p.dropEndTime).toISOString().slice(0, 16) : '',
            dropQuantity: p.dropQuantity || 0
        })
    }

    const saveDrop = async (id) => {
        setSaving(true)
        try {
            const res = await fetch(`${API}/drops/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    dropStartTime: form.dropStartTime || undefined,
                    dropEndTime: form.dropEndTime || undefined,
                })
            })
            const data = await res.json()
            if (data.success) {
                setProducts(ps => ps.map(p => p._id === id ? { ...p, ...data.data } : p))
                setEditingId(null)
                toast.success('Drop updated!')
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AdminLayout title="Manage Drops">
            <div style={{ padding: '24px', maxWidth: '900px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 6px' }}>⚡ Drop Engine</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                        Configure limited-time drops for any product. Set start/end time and quantity.
                    </p>
                </div>

                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading products...</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {products.map(p => (
                            <div key={p._id} style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '20px',
                                borderLeftColor: p.dropEnabled ? '#FFD700' : 'transparent',
                                borderLeftWidth: p.dropEnabled ? '3px' : '1px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <img src={p.images?.[0]} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{p.category}</div>
                                        {p.dropEnabled && (
                                            <div style={{ fontSize: '0.75rem', color: '#FFD700', marginTop: '4px' }}>
                                                ⚡ Drop: {formatDateTime(p.dropStartTime)} — {formatDateTime(p.dropEndTime)} · {p.dropQuantity} qty · {p.dropSold || 0} sold
                                                {(p.dropReminders?.length > 0) && ` · ${p.dropReminders.length} subscribers`}
                                            </div>
                                        )}
                                    </div>
                                    {editingId !== p._id && (
                                        <button onClick={() => startEdit(p)} style={{
                                            background: 'rgba(255,215,0,0.15)',
                                            border: '1px solid rgba(255,215,0,0.3)',
                                            color: '#FFD700', fontWeight: '600', fontSize: '0.8rem',
                                            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
                                        }}>
                                            {p.dropEnabled ? 'Edit Drop' : 'Setup Drop'}
                                        </button>
                                    )}
                                </div>

                                {editingId === p._id && (
                                    <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                <input type="checkbox" checked={form.dropEnabled} onChange={e => setForm(f => ({ ...f, dropEnabled: e.target.checked }))} />
                                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Enable Drop</span>
                                            </label>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>START TIME</label>
                                                <input type="datetime-local" value={form.dropStartTime} onChange={e => setForm(f => ({ ...f, dropStartTime: e.target.value }))}
                                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>END TIME</label>
                                                <input type="datetime-local" value={form.dropEndTime} onChange={e => setForm(f => ({ ...f, dropEndTime: e.target.value }))}
                                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>QUANTITY</label>
                                                <input type="number" min="0" value={form.dropQuantity} onChange={e => setForm(f => ({ ...f, dropQuantity: parseInt(e.target.value) || 0 }))}
                                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px 10px', borderRadius: '8px', fontSize: '0.85rem', width: '100%' }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => saveDrop(p._id)} disabled={saving} style={{
                                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                color: '#000', fontWeight: '700', fontSize: '0.875rem',
                                                padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer'
                                            }}>
                                                {saving ? 'Saving...' : 'Save Drop'}
                                            </button>
                                            <button onClick={() => setEditingId(null)} style={{
                                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                                                color: '#fff', fontWeight: '600', fontSize: '0.875rem',
                                                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
                                            }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
