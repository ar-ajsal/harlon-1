import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { toast } from 'react-toastify'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const token = 'admin-authenticated'

const EMPTY_MATCH = {
    title: '', teamA: '', teamB: '', teamALogo: '', teamBLogo: '',
    matchDate: '', league: '', prize: '10% discount coupon', couponPrefix: 'PREDICT', status: 'upcoming'
}

function MatchForm({ initial, onSave, onCancel }) {
    const [form, setForm] = useState(initial || EMPTY_MATCH)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.title || !form.teamA || !form.teamB || !form.matchDate) {
            toast.error('Fill required fields')
            return
        }
        onSave(form)
    }

    const field = (label, key, type = 'text', required = false) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}{required && ' *'}</label>
            <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required={required}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem' }}
            />
        </div>
    )

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {field('Match Title', 'title', 'text', true)}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {field('Team A', 'teamA', 'text', true)}
                {field('Team B', 'teamB', 'text', true)}
                {field('Match Date & Time', 'matchDate', 'datetime-local', true)}
                {field('League', 'league')}
                {field('Prize Description', 'prize')}
                {field('Coupon Code Prefix', 'couponPrefix')}
            </div>
            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                <button type="submit" style={{ background: 'linear-gradient(135deg,#00ff87,#00d970)', color: '#000', fontWeight: '700', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Save Match</button>
                <button type="button" onClick={onCancel} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            </div>
        </form>
    )
}

function ResultModal({ match, onClose, onResult }) {
    const [scores, setScores] = useState({ resultScoreA: 0, resultScoreB: 0 })
    const [loading, setLoading] = useState(false)

    const submit = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API}/predictions/${match._id}/result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(scores)
            })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message)
                onResult(data.data)
                onClose()
            } else {
                toast.error(data.message)
            }
        } catch { toast.error('Failed to submit result') }
        finally { setLoading(false) }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
            <div style={{ background: '#0d1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', maxWidth: '400px', width: '90%' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '1.2rem' }}>Enter Result: {match.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ marginBottom: '6px', fontWeight: '600' }}>{match.teamA}</div>
                        <input type="number" min="0" value={scores.resultScoreA} onChange={e => setScores(s => ({ ...s, resultScoreA: parseInt(e.target.value) || 0 }))}
                            style={{ width: '70px', textAlign: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '1.5rem', fontWeight: '800' }} />
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.5rem' }}>—</div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ marginBottom: '6px', fontWeight: '600' }}>{match.teamB}</div>
                        <input type="number" min="0" value={scores.resultScoreB} onChange={e => setScores(s => ({ ...s, resultScoreB: parseInt(e.target.value) || 0 }))}
                            style={{ width: '70px', textAlign: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '1.5rem', fontWeight: '800' }} />
                    </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
                    Exact-score winners get a coupon automatically generated.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={submit} disabled={loading} style={{ flex: 1, background: 'linear-gradient(135deg,#00ff87,#00d970)', color: '#000', fontWeight: '700', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                        {loading ? 'Processing...' : 'Submit & Award Coupons'}
                    </button>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default function PredictionsManager() {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editingMatch, setEditingMatch] = useState(null)
    const [resultMatch, setResultMatch] = useState(null)
    const [tab, setTab] = useState('upcoming')

    const load = () => {
        setLoading(true)
        fetch(`${API}/predictions`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => { if (d.success) setMatches(d.data) })
            .catch(() => toast.error('Failed to load'))
            .finally(() => setLoading(false))
    }

    useEffect(load, [])

    const createMatch = async (form) => {
        try {
            const res = await fetch(`${API}/predictions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form)
            })
            const d = await res.json()
            if (d.success) { toast.success('Match created!'); setShowCreate(false); load() }
            else toast.error(d.message)
        } catch { toast.error('Failed') }
    }

    const deleteMatch = async (id) => {
        if (!confirm('Delete this match?')) return
        try {
            await fetch(`${API}/predictions/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
            setMatches(ms => ms.filter(m => m._id !== id))
            toast.success('Match deleted')
        } catch { toast.error('Failed') }
    }

    const onResult = (updatedMatch) => {
        setMatches(ms => ms.map(m => m._id === updatedMatch._id ? updatedMatch : m))
    }

    const filtered = matches.filter(m => m.status === tab)

    return (
        <AdminLayout title="Predictions Manager">
            <div style={{ padding: '24px', maxWidth: '960px' }}>
                {resultMatch && <ResultModal match={resultMatch} onClose={() => setResultMatch(null)} onResult={onResult} />}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', margin: '0 0 4px' }}>⚽ Predictions Manager</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: 0 }}>Add matches, enter results, auto-award coupons to winners</p>
                    </div>
                    <button onClick={() => setShowCreate(true)} style={{
                        background: 'linear-gradient(135deg,#00ff87,#00d970)',
                        color: '#000', fontWeight: '700', fontSize: '0.875rem',
                        padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer'
                    }}>
                        + Add Match
                    </button>
                </div>

                {showCreate && (
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: '700' }}>New Match</h3>
                        <MatchForm onSave={createMatch} onCancel={() => setShowCreate(false)} />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {['upcoming', 'live', 'finished'].map(t => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            padding: '7px 16px', borderRadius: '50px',
                            background: tab === t ? 'rgba(0,255,135,0.15)' : 'rgba(255,255,255,0.06)',
                            border: tab === t ? '1px solid rgba(0,255,135,0.4)' : '1px solid rgba(255,255,255,0.1)',
                            color: tab === t ? '#00ff87' : 'rgba(255,255,255,0.6)',
                            fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer'
                        }}>
                            {t.charAt(0).toUpperCase() + t.slice(1)} ({matches.filter(m => m.status === t).length})
                        </button>
                    ))}
                </div>

                {loading ? <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading...</p> : filtered.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px 0' }}>No {tab} matches</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {filtered.map(m => (
                            <div key={m._id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>{m.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                            {m.league && `${m.league} · `}
                                            {new Date(m.matchDate).toLocaleString('en-IN')} · {m.entries?.length || 0} predictions
                                        </div>
                                        {m.status === 'finished' && (
                                            <div style={{ fontSize: '0.9rem', marginTop: '6px', color: '#FFD700', fontWeight: '700' }}>
                                                Result: {m.resultScoreA} — {m.resultScoreB}
                                                {m.winnersProcessed && <span style={{ marginLeft: '10px', color: '#00ff87', fontSize: '0.75rem' }}>✅ Winners processed</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {m.status !== 'finished' && (
                                            <button onClick={() => setResultMatch(m)} style={{
                                                background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)',
                                                color: '#FFD700', fontWeight: '600', fontSize: '0.8rem',
                                                padding: '7px 14px', borderRadius: '8px', cursor: 'pointer'
                                            }}>Enter Result</button>
                                        )}
                                        <button onClick={() => deleteMatch(m._id)} style={{
                                            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                                            color: '#ff4444', fontWeight: '600', fontSize: '0.8rem',
                                            padding: '7px 14px', borderRadius: '8px', cursor: 'pointer'
                                        }}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
