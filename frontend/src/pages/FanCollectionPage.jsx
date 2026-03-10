import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import './FanCollectionPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Hook: load or create fan profile stored in localStorage
function useFanProfile() {
    const [username] = useState(() => localStorage.getItem('fan_username') || '')
    const setFanUsername = (u) => localStorage.setItem('fan_username', u)
    return { username, setFanUsername }
}

function JerseyCard({ jersey }) {
    const product = jersey.productId
    if (!product) return null
    return (
        <div className="fan-jersey-card">
            <div className="fan-jersey-img">
                <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} loading="lazy" />
            </div>
            <div className="fan-jersey-info">
                <span className="fan-jersey-cat">{product.category}</span>
                <h4 className="fan-jersey-name">{product.name}</h4>
                <p className="fan-jersey-price">₹{product.price?.toLocaleString()}</p>
                {jersey.note && <p className="fan-jersey-note">"{jersey.note}"</p>}
            </div>
            <Link to={`/product/${product._id}`} className="fan-jersey-view">View</Link>
        </div>
    )
}

function SetupModal({ onComplete }) {
    const [form, setForm] = useState({ username: '', displayName: '', bio: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username) { toast.error('Username is required'); return }
        setLoading(true)
        try {
            const res = await fetch(`${API}/fan/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await res.json()
            if (data.success) {
                onComplete(data.data)
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error('Failed to create profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="setup-overlay">
            <div className="setup-modal">
                <div className="setup-icon">🏟️</div>
                <h2>Create Your Fan Profile</h2>
                <p>Build your personal jersey collection wall</p>
                <form onSubmit={handleSubmit}>
                    <div className="setup-field">
                        <label>Username *</label>
                        <input
                            type="text"
                            placeholder="e.g. jersey_fanatic"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                            maxLength={20}
                            required
                        />
                        <span className="setup-hint">Letters, numbers, underscores only</span>
                    </div>
                    <div className="setup-field">
                        <label>Display Name</label>
                        <input type="text" placeholder="Your name" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
                    </div>
                    <div className="setup-field">
                        <label>Bio</label>
                        <textarea placeholder="Football fan since..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} maxLength={200} rows={2} />
                    </div>
                    <button type="submit" disabled={loading} className="setup-btn">
                        {loading ? 'Creating...' : 'Create Collection Wall 🚀'}
                    </button>
                </form>
            </div>
        </div>
    )
}

function Leaderboard() {
    const [leaders, setLeaders] = useState([])
    useEffect(() => {
        fetch(`${API}/fan/leaderboard`).then(r => r.json()).then(d => { if (d.success) setLeaders(d.data) }).catch(() => { })
    }, [])

    return (
        <div className="fan-leaderboard">
            <h3>🏆 Top Collectors</h3>
            {leaders.length === 0 ? (
                <p className="lb-empty">No collectors yet</p>
            ) : (
                leaders.slice(0, 10).map((l, i) => (
                    <Link key={i} to={`/fan/${l.username}`} className="fan-lb-row">
                        <span className="fan-lb-rank">{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</span>
                        <div className="fan-lb-info">
                            <span className="fan-lb-name">{l.displayName}</span>
                        </div>
                        <span className="fan-lb-count">{l.jerseyCount} jerseys</span>
                    </Link>
                ))
            )}
        </div>
    )
}

export default function FanCollectionPage() {
    const { username: paramUsername } = useParams()
    const navigate = useNavigate()
    const { username: myUsername, setFanUsername } = useFanProfile()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showSetup, setShowSetup] = useState(false)

    const targetUsername = paramUsername || myUsername

    useEffect(() => {
        if (!targetUsername) {
            setLoading(false)
            setShowSetup(true)
            return
        }
        fetch(`${API}/fan/${targetUsername}`)
            .then(r => r.json())
            .then(d => {
                if (d.success) setProfile(d.data)
                else setShowSetup(!paramUsername)
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [targetUsername, paramUsername])

    const handleSetupComplete = (profileData) => {
        setFanUsername(profileData.username)
        setProfile(profileData)
        setShowSetup(false)
        navigate(`/fan/${profileData.username}`)
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/fan/${profile.username}`
        if (navigator.share) {
            await navigator.share({ title: `${profile.displayName}'s Jersey Collection`, url })
        } else {
            await navigator.clipboard.writeText(url)
            toast.success('Collection link copied!')
        }
    }

    if (loading) return (
        <div className="fan-page">
            <div className="fan-loading">
                {[...Array(6)].map((_, i) => <div key={i} className="fan-skeleton shimmer" />)}
            </div>
        </div>
    )

    return (
        <div className="fan-page">
            {showSetup && <SetupModal onComplete={handleSetupComplete} />}

            {!profile && !showSetup && (
                <div className="fan-not-found">
                    <div className="fnf-icon">👕</div>
                    <h2>Profile not found</h2>
                    <p>This collection doesn't exist or is private.</p>
                    <Link to="/shop" className="fnf-btn">Browse Jerseys</Link>
                </div>
            )}

            {profile && (
                <>
                    <div className="fan-hero">
                        <div className="fan-hero-bg" />
                        <div className="fan-profile-header">
                            <div className="fan-avatar">
                                {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.displayName} /> : <span>{profile.displayName?.[0] || profile.username?.[0]}</span>}
                            </div>
                            <div className="fan-profile-info">
                                <h1>{profile.displayName || profile.username}</h1>
                                <p className="fan-username">@{profile.username}</p>
                                {profile.bio && <p className="fan-bio">{profile.bio}</p>}
                                <div className="fan-stats">
                                    <span><strong>{profile.jerseys?.length || 0}</strong> jerseys</span>
                                </div>
                            </div>
                            <div className="fan-profile-actions">
                                <button className="fan-share-btn" onClick={handleShare}>Share 📤</button>
                                {myUsername === profile.username && (
                                    <Link to="/shop" className="fan-add-btn">+ Add Jersey</Link>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="fan-body">
                        <div className="fan-layout">
                            <div className="fan-main">
                                <h2 className="fan-section-title">
                                    Jersey Collection
                                    <span className="fan-count-badge">{profile.jerseys?.length || 0}</span>
                                </h2>
                                {!profile.jerseys?.length ? (
                                    <div className="fan-empty">
                                        <div className="fan-empty-icon">👕</div>
                                        <p>No jerseys in collection yet</p>
                                        {myUsername === profile.username && (
                                            <Link to="/shop" className="fan-add-btn">Browse & Add Jerseys</Link>
                                        )}
                                    </div>
                                ) : (
                                    <div className="fan-jersey-grid">
                                        {profile.jerseys.map((j, i) => <JerseyCard key={i} jersey={j} />)}
                                    </div>
                                )}
                            </div>
                            <div className="fan-sidebar">
                                <Leaderboard />
                                {!myUsername && (
                                    <button className="fan-create-btn" onClick={() => setShowSetup(true)}>
                                        Create Your Collection 🚀
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
