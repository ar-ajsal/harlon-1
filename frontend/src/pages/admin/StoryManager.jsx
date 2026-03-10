import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const AUTH = { Authorization: 'Bearer admin-authenticated' }

const EMPTY_FORM = {
    storyEnabled: false,
    storyTitle: '',
    storyPlayer: '',
    storyYear: '',
    storyText: '',
    storyVideo: '',
    storyImage: '',
}

const input = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
}

export default function StoryManager() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetch(`${API}/products`, { headers: AUTH })
            .then(r => r.json())
            .then(d => {
                const list = Array.isArray(d) ? d : d.products || d.data || []
                setProducts(list)
            })
            .catch(() => toast.error('Failed to load products'))
            .finally(() => setLoading(false))
    }, [])

    const startEdit = (p) => {
        setEditingId(p._id)
        setForm({
            storyEnabled: p.storyEnabled || false,
            storyTitle: p.storyTitle || '',
            storyPlayer: p.storyPlayer || '',
            storyYear: p.storyYear || '',
            storyText: p.storyText || '',
            storyVideo: p.storyVideo || '',
            storyImage: p.storyImage || '',
        })
    }

    const saveStory = async (id) => {
        setSaving(true)
        try {
            const res = await fetch(`${API}/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...AUTH },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (data.success || data._id || data.data?._id) {
                const updated = data.data || data
                setProducts(ps => ps.map(p => p._id === id ? { ...p, ...updated, ...form } : p))
                setEditingId(null)
                toast.success('Story saved!')
            } else {
                toast.error(data.message || 'Save failed')
            }
        } catch {
            toast.error('Failed to save story')
        } finally {
            setSaving(false)
        }
    }

    const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <AdminLayout title="Jersey Story Manager">
            <div style={{ padding: '24px', maxWidth: 960 }}>

                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px' }}>
                        📖 Jersey Story Commerce
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>
                        Add storytelling to each jersey — legendary moment, player, year, highlight video.
                    </p>
                </div>

                {/* Search */}
                <input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ ...input, marginBottom: 20, maxWidth: 360 }}
                />

                {loading ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading products…</p>
                ) : filtered.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No products found.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {filtered.map(p => (
                            <div key={p._id} style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${p.storyEnabled ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                borderLeft: `3px solid ${p.storyEnabled ? '#FFD700' : 'transparent'}`,
                                borderRadius: 16,
                                padding: 20,
                            }}>
                                {/* Product row */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    <img
                                        src={p.images?.[0]}
                                        alt={p.name}
                                        style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                                        onError={e => { e.currentTarget.style.display = 'none' }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {p.name}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                                            {p.category}
                                        </div>
                                        {p.storyEnabled && p.storyTitle && (
                                            <div style={{ fontSize: '0.75rem', color: '#FFD700', marginTop: 4 }}>
                                                ⚽ {p.storyTitle}
                                                {p.storyPlayer && ` · ${p.storyPlayer}`}
                                                {p.storyYear && ` · ${p.storyYear}`}
                                            </div>
                                        )}
                                    </div>
                                    {editingId !== p._id && (
                                        <button
                                            onClick={() => startEdit(p)}
                                            style={{
                                                background: p.storyEnabled ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.07)',
                                                border: `1px solid ${p.storyEnabled ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.15)'}`,
                                                color: p.storyEnabled ? '#FFD700' : '#fff',
                                                fontWeight: 600, fontSize: '0.8rem',
                                                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {p.storyEnabled ? 'Edit Story' : 'Add Story'}
                                        </button>
                                    )}
                                </div>

                                {/* Edit form */}
                                {editingId === p._id && (
                                    <div style={{ marginTop: 20, padding: 20, background: 'rgba(0,0,0,0.35)', borderRadius: 12 }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>

                                            {/* Enable toggle */}
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', gridColumn: '1 / -1' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={form.storyEnabled}
                                                    onChange={e => setForm(f => ({ ...f, storyEnabled: e.target.checked }))}
                                                />
                                                <span style={{ fontWeight: 700 }}>Enable Story Section on Product Page</span>
                                            </label>

                                            {/* Story Title */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 5, letterSpacing: '1px' }}>
                                                    STORY TITLE
                                                </label>
                                                <input
                                                    style={input}
                                                    placeholder="e.g. The Night Messi Made History"
                                                    value={form.storyTitle}
                                                    onChange={set('storyTitle')}
                                                />
                                            </div>

                                            {/* Player */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 5, letterSpacing: '1px' }}>
                                                    PLAYER
                                                </label>
                                                <input
                                                    style={input}
                                                    placeholder="e.g. Lionel Messi"
                                                    value={form.storyPlayer}
                                                    onChange={set('storyPlayer')}
                                                />
                                            </div>

                                            {/* Year */}
                                            <div>
                                                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 5, letterSpacing: '1px' }}>
                                                    YEAR
                                                </label>
                                                <input
                                                    style={input}
                                                    placeholder="e.g. 2006"
                                                    value={form.storyYear}
                                                    onChange={set('storyYear')}
                                                />
                                            </div>

                                            {/* Video URL */}
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 5, letterSpacing: '1px' }}>
                                                    YOUTUBE VIDEO URL (optional)
                                                </label>
                                                <input
                                                    style={input}
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    value={form.storyVideo}
                                                    onChange={set('storyVideo')}
                                                />
                                            </div>

                                            {/* Story Text */}
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 5, letterSpacing: '1px' }}>
                                                    STORY TEXT
                                                </label>
                                                <textarea
                                                    style={{ ...input, minHeight: 90, resize: 'vertical', fontFamily: 'inherit' }}
                                                    placeholder="Write the legendary story behind this jersey..."
                                                    value={form.storyText}
                                                    onChange={set('storyText')}
                                                />
                                            </div>
                                        </div>

                                        {/* Preview */}
                                        {form.storyEnabled && form.storyTitle && (
                                            <div style={{
                                                background: 'linear-gradient(135deg, rgba(10,14,26,0.9), rgba(20,28,50,0.85))',
                                                border: '1px solid rgba(255,215,0,0.15)',
                                                borderRadius: 12, padding: '16px 20px', marginBottom: 16
                                            }}>
                                                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2px', color: '#FFD700', marginBottom: 6 }}>
                                                    ⚽ PREVIEW
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: '1rem' }}>{form.storyTitle}</div>
                                                {form.storyPlayer && (
                                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,215,0,0.7)', marginTop: 4 }}>
                                                        👤 {form.storyPlayer} {form.storyYear && `· ${form.storyYear}`}
                                                    </div>
                                                )}
                                                {form.storyText && (
                                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: '8px 0 0', lineHeight: 1.6 }}>
                                                        {form.storyText.slice(0, 140)}{form.storyText.length > 140 ? '…' : ''}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button
                                                onClick={() => saveStory(p._id)}
                                                disabled={saving}
                                                style={{
                                                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                    color: '#000', fontWeight: 700, fontSize: '0.875rem',
                                                    padding: '10px 22px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                                    opacity: saving ? 0.7 : 1,
                                                }}
                                            >
                                                {saving ? 'Saving…' : '💾 Save Story'}
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                style={{
                                                    background: 'rgba(255,255,255,0.07)',
                                                    border: '1px solid rgba(255,255,255,0.12)',
                                                    color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                                                    padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                                                }}
                                            >
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
