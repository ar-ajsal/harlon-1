import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { toast } from 'react-toastify'
import './OutfitBuilderPage.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Static sample bundles (in production these would be products with productType='bundle')
const SAMPLE_BUNDLES = [
    {
        id: 'bundle-1',
        name: 'FCB Ultimate Fan Kit',
        club: 'FC Barcelona',
        teamColor: '#a50044',
        items: ['Home Jersey', 'Club Scarf', 'Fan Cap'],
        icons: ['👕', '🧣', '🧢'],
        individualPrice: 4500,
        bundlePrice: 3299,
        badge: 'Most Popular',
        image: null
    },
    {
        id: 'bundle-2',
        name: 'Real Madrid Match Day',
        club: 'Real Madrid',
        teamColor: '#00529f',
        items: ['Away Jersey', 'Club Scarf', 'Training Shorts'],
        icons: ['👕', '🧣', '🩳'],
        individualPrice: 5000,
        bundlePrice: 3799,
        badge: 'Best Value',
        image: null
    },
    {
        id: 'bundle-3',
        name: 'Manchester United Collector',
        club: 'Manchester United',
        teamColor: '#da291c',
        items: ['Retro Jersey', 'Stadium Scarf', 'Keychain'],
        icons: ['👕', '🧣', '🔑'],
        individualPrice: 3800,
        bundlePrice: 2699,
        badge: 'Retro Edition',
        image: null
    },
    {
        id: 'bundle-4',
        name: 'Brazil National Kit',
        club: 'Brazil NT',
        teamColor: '#009c3b',
        items: ['Home Jersey', 'Yellow Scarf', 'Fan Flag'],
        icons: ['👕', '🧣', '🏳️'],
        individualPrice: 4200,
        bundlePrice: 3099,
        badge: 'World Cup Fan',
        image: null
    },
]

function BundleCard({ bundle }) {
    const { addToCart } = useCart()
    const [expanded, setExpanded] = useState(false)
    const saving = bundle.individualPrice - bundle.bundlePrice
    const savePercent = Math.round((saving / bundle.individualPrice) * 100)

    const handleAdd = () => {
        addToCart({
            _id: bundle.id,
            name: bundle.name,
            price: bundle.bundlePrice,
            originalPrice: bundle.individualPrice,
            images: [],
            category: 'Bundle'
        }, 1)
        toast.success(`🛒 ${bundle.name} added to cart!`)
    }

    return (
        <div className="bundle-card" style={{ '--team-color': bundle.teamColor }}>
            <div className="bundle-card-glow" />
            <div className="bundle-card-top">
                <div className="bundle-club-badge" style={{ background: bundle.teamColor }}>
                    {bundle.club}
                </div>
                {bundle.badge && <div className="bundle-tag">{bundle.badge}</div>}
            </div>

            <div className="bundle-preview">
                <div className="bundle-items-icons">
                    {bundle.items.map((item, i) => (
                        <div key={i} className="bundle-item-icon" style={{ animationDelay: `${i * 0.15}s` }}>
                            <span>{bundle.icons[i]}</span>
                        </div>
                    ))}
                </div>
                <div className="bundle-arrow">→</div>
                <div className="bundle-combo-label">Bundle Deal</div>
            </div>

            <h3 className="bundle-name">{bundle.name}</h3>

            <div className="bundle-items-list">
                {bundle.items.map((item, i) => (
                    <div key={i} className="bundle-item">
                        <span className="bundle-item-icon-sm">{bundle.icons[i]}</span>
                        <span>{item}</span>
                    </div>
                ))}
            </div>

            <div className="bundle-pricing">
                <div className="bundle-save-badge">Save {savePercent}% · ₹{saving.toLocaleString()} off</div>
                <div className="bundle-prices">
                    <span className="bundle-individual">₹{bundle.individualPrice.toLocaleString()} if separate</span>
                    <span className="bundle-price">₹{bundle.bundlePrice.toLocaleString()}</span>
                </div>
            </div>

            <div className="bundle-actions">
                <button className="bundle-btn-add" onClick={handleAdd}>
                    Add Bundle to Cart 🛒
                </button>
            </div>
        </div>
    )
}

export default function OutfitBuilderPage() {
    const [products, setProducts] = useState([])
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetch(`${API}/products?limit=4&featured=true`)
            .then(r => r.json())
            .then(d => { if (d.success) setProducts(d.products || d.data || []) })
            .catch(() => { })
    }, [])

    return (
        <div className="outfit-page">
            <div className="outfit-hero">
                <div className="outfit-hero-badge">👕 BUNDLE DEALS</div>
                <h1>Matchday<br /><span className="outfit-accent">Outfit Builder</span></h1>
                <p>Complete your matchday look. Bundle jersey + scarf + cap and save big.</p>
            </div>

            <div className="outfit-body">
                <div className="outfit-intro">
                    <div className="outfit-step">
                        <div className="outfit-step-icon">👕</div>
                        <span>Choose Your Jersey</span>
                    </div>
                    <div className="outfit-plus">+</div>
                    <div className="outfit-step">
                        <div className="outfit-step-icon">🧣</div>
                        <span>Match the Scarf</span>
                    </div>
                    <div className="outfit-plus">+</div>
                    <div className="outfit-step">
                        <div className="outfit-step-icon">🧢</div>
                        <span>Top it Off</span>
                    </div>
                    <div className="outfit-equals">=</div>
                    <div className="outfit-step outfit-step-result">
                        <div className="outfit-step-icon">🏆</div>
                        <span>Epic Matchday Look!</span>
                    </div>
                </div>

                <h2 className="outfit-section-title">Curated Bundle Deals</h2>
                <div className="bundles-grid">
                    {SAMPLE_BUNDLES.map(bundle => <BundleCard key={bundle.id} bundle={bundle} />)}
                </div>

                <div className="outfit-custom">
                    <div className="outfit-custom-content">
                        <h2>Build Your Own Bundle</h2>
                        <p>Can't find your club? Mix and match jerseys, accessories, and fan gear from our store for a custom bundle deal.</p>
                        <a href="/shop" className="outfit-custom-btn">Browse All Products →</a>
                    </div>
                    <div className="outfit-custom-emoji">
                        <span>⚽</span><span>👕</span><span>🏆</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
