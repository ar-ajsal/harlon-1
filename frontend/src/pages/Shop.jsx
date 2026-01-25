import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'

function Shop() {
    const { products, categories, loading } = useProducts()
    const [searchParams, setSearchParams] = useSearchParams()
    // Initial category from URL or 'all'
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all')
    const [searchQuery, setSearchQuery] = useState('')

    // Update URL when category changes
    const handleCategoryChange = (categorySlug) => {
        setActiveCategory(categorySlug)
        if (categorySlug === 'all') {
            searchParams.delete('category')
        } else {
            searchParams.set('category', categorySlug)
        }
        setSearchParams(searchParams)
    }

    // Update active category if URL changes externally
    useEffect(() => {
        const categoryParam = searchParams.get('category')
        if (categoryParam && categoryParam !== activeCategory) {
            setActiveCategory(categoryParam)
        } else if (!categoryParam && activeCategory !== 'all') {
            setActiveCategory('all')
        }
    }, [searchParams])

    const activeCategoryName = activeCategory === 'all'
        ? 'all'
        : categories.find(c => c.slug === activeCategory)?.name || activeCategory;

    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === 'all' ||
            product.category.toLowerCase() === activeCategoryName.toLowerCase()
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="shop-page">
            <div className="container">
                <div className="shop-header">
                    <h1 className="section-title">Shop All Jerseys</h1>

                    {/* Search */}
                    <div style={{ maxWidth: '400px', margin: '0 auto 30px' }}>
                        <input
                            type="text"
                            placeholder="Search jerseys..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ textAlign: 'center' }}
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="category-filters">
                        <button
                            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => handleCategoryChange('all')}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`category-btn ${activeCategory === category.slug ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(category.slug)}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                            No products found. Try a different search or category.
                        </p>
                    </div>
                )}

                {/* Results Count */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '40px',
                    color: 'var(--text-muted)'
                }}>
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </div>
        </div>
    )
}

export default Shop
