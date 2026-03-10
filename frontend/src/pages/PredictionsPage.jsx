import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import './PredictionsPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function MatchCard({ match }) {
    const [form, setForm] = useState({ name: '', phone: '', predictedScoreA: 0, predictedScoreB: 0 })
    const [submitted, setSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)
    const isExpired = new Date() > new Date(match.matchDate) || match.status === 'finished'
    const isLive = match.status === 'live'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.phone) { toast.error('Name and phone are required'); return }
        setLoading(true)
        try {
            const res = await fetch(`${API}/predictions/${match._id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (data.success) {
                toast.success('⚽ Prediction submitted!')
                setSubmitted(true)
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Failed to submit prediction')
        } finally {
            setLoading(false)
        }
    }

    const matchDate = new Date(match.matchDate)

    return (
        <div className={`match-card ${isLive ? 'match-live' : ''} ${match.status === 'finished' ? 'match-finished' : ''}`}>
            {isLive && <div className="match-live-badge"><span className="live-dot" />LIVE</div>}
            {match.status === 'finished' && <div className="match-finished-badge">FINISHED</div>}

            <div className="match-league">{match.league || 'Football'}</div>
            <div className="match-teams">
                <div className="match-team">
                    <div className="team-logo">{match.teamALogo ? <img src={match.teamALogo} alt={match.teamA} /> : <span>{match.teamA?.[0]}</span>}</div>
                    <div className="team-name">{match.teamA}</div>
                </div>
                <div className="match-vs-section">
                    {match.status === 'finished' ? (
                        <div className="match-result">{match.resultScoreA} — {match.resultScoreB}</div>
                    ) : (
                        <>
                            <div className="match-vs">VS</div>
                            <div className="match-date">
                                {matchDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                <br />
                                {matchDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </>
                    )}
                    <div className="match-prize">🏆 {match.prize || '10% coupon for winner'}</div>
                </div>
                <div className="match-team">
                    <div className="team-logo">{match.teamBLogo ? <img src={match.teamBLogo} alt={match.teamB} /> : <span>{match.teamB?.[0]}</span>}</div>
                    <div className="team-name">{match.teamB}</div>
                </div>
            </div>

            {!isExpired && !submitted && (
                <form className="predict-form" onSubmit={handleSubmit}>
                    <p className="predict-label">Your Prediction</p>
                    <div className="score-inputs">
                        <div className="score-input-wrap">
                            <label>{match.teamA}</label>
                            <div className="score-stepper">
                                <button type="button" onClick={() => setForm(f => ({ ...f, predictedScoreA: Math.max(0, f.predictedScoreA - 1) }))}>−</button>
                                <span>{form.predictedScoreA}</span>
                                <button type="button" onClick={() => setForm(f => ({ ...f, predictedScoreA: f.predictedScoreA + 1 }))}>+</button>
                            </div>
                        </div>
                        <div className="score-dash">—</div>
                        <div className="score-input-wrap">
                            <label>{match.teamB}</label>
                            <div className="score-stepper">
                                <button type="button" onClick={() => setForm(f => ({ ...f, predictedScoreB: Math.max(0, f.predictedScoreB - 1) }))}>−</button>
                                <span>{form.predictedScoreB}</span>
                                <button type="button" onClick={() => setForm(f => ({ ...f, predictedScoreB: f.predictedScoreB + 1 }))}>+</button>
                            </div>
                        </div>
                    </div>
                    <div className="predict-user-inputs">
                        <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        <input type="tel" placeholder="WhatsApp number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required />
                    </div>
                    <button type="submit" className="predict-submit-btn" disabled={loading}>
                        {loading ? 'Submitting...' : '⚽ Submit Prediction'}
                    </button>
                </form>
            )}
            {submitted && (
                <div className="predict-success">
                    <span>✅</span> Prediction submitted! We'll notify you via WhatsApp if you win.
                </div>
            )}
            {isExpired && !submitted && (
                <div className="predict-closed">
                    🔒 Prediction window closed · {match.entries?.length || 0} entries
                </div>
            )}
        </div>
    )
}

function Leaderboard() {
    const [leaders, setLeaders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API}/predictions/leaderboard`)
            .then(r => r.json())
            .then(d => { if (d.success) setLeaders(d.data) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const share = async () => {
        const text = `⚽ Football Prediction Leaderboard!\n\n${leaders.slice(0, 5).map((l, i) => `${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]} ${l.name} — ${l.totalPoints} pts`).join('\n')}\n\nPlay at harlon.shop`
        if (navigator.share) {
            await navigator.share({ title: 'Prediction Leaderboard', text })
        } else {
            await navigator.clipboard.writeText(text)
            toast.success('Leaderboard copied!')
        }
    }

    return (
        <div className="leaderboard">
            <div className="leaderboard-header">
                <h2>🏆 Leaderboard</h2>
                <button className="share-btn" onClick={share}>Share 📤</button>
            </div>
            {loading ? <div className="lb-loading">Loading...</div> : leaders.length === 0 ? (
                <div className="lb-empty">No predictions yet — be the first!</div>
            ) : (
                <div className="lb-table">
                    <div className="lb-row lb-head">
                        <span>#</span><span>Name</span><span>Predictions</span><span>Points</span>
                    </div>
                    {leaders.map((l, i) => (
                        <div key={i} className={`lb-row ${i < 3 ? 'lb-top' : ''}`}>
                            <span className="lb-rank">{['🥇', '🥈', '🥉'][i] || i + 1}</span>
                            <span className="lb-name">{l.name}</span>
                            <span className="lb-predictions">{l.predictions}</span>
                            <span className="lb-points">{l.totalPoints} pts</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function PredictionsPage() {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('upcoming')

    useEffect(() => {
        fetch(`${API}/predictions`)
            .then(r => r.json())
            .then(d => { if (d.success) setMatches(d.data) })
            .catch(() => toast.error('Failed to load matches'))
            .finally(() => setLoading(false))
    }, [])

    const filtered = matches.filter(m => {
        if (tab === 'upcoming') return m.status === 'upcoming'
        if (tab === 'live') return m.status === 'live'
        return m.status === 'finished'
    })

    return (
        <div className="predictions-page">
            <div className="predictions-hero">
                <div className="ph-badge">⚽ PREDICT & WIN</div>
                <h1>Football<br /><span className="ph-accent">Predictions</span></h1>
                <p>Predict match scores. Top predictors win exclusive discount coupons.</p>
            </div>

            <div className="predictions-body">
                <div className="predictions-layout">
                    <div className="predictions-main">
                        <div className="pred-tabs">
                            {['upcoming', 'live', 'finished'].map(t => (
                                <button key={t} className={`pred-tab ${tab === t ? 'pred-tab-active' : ''}`} onClick={() => setTab(t)}>
                                    {t === 'live' && <span className="live-dot" />}
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="pred-loading">
                                {[1, 2].map(i => <div key={i} className="pred-skeleton shimmer" />)}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="pred-empty">
                                <div className="pred-empty-icon">⚽</div>
                                <p>No {tab} matches yet. Check back soon!</p>
                            </div>
                        ) : (
                            <div className="matches-list">
                                {filtered.map(m => <MatchCard key={m._id} match={m} />)}
                            </div>
                        )}
                    </div>
                    <div className="predictions-sidebar">
                        <Leaderboard />
                        <div className="scoring-guide">
                            <h3>Scoring</h3>
                            <div className="guide-row"><span>🎯 Exact score</span><span className="pts gold">10 pts + Coupon</span></div>
                            <div className="guide-row"><span>✅ Correct outcome</span><span className="pts">3 pts</span></div>
                            <div className="guide-row"><span>❌ Wrong outcome</span><span className="pts dim">0 pts</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
