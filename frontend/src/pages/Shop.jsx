import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'

function Shop() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { products, categories, loading } = useProducts()
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
    const [filteredProducts, setFilteredProducts] = useState([])

    useEffect(() => {
        const visibleProducts = products.filter(p => p.isVisible !== false)

        let result = visibleProducts

        // Filter by Category
        if (selectedCategory !== 'all') {
            result = result.filter(p =>
                p.category.toLowerCase() === selectedCategory.toLowerCase()
            )
        }

        // Filter by Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term) ||
                (p.description && p.description.toLowerCase().includes(term))
            )
        }

        setFilteredProducts(result)
    }, [selectedCategory, searchTerm, products])

    useEffect(() => {
        const categoryParam = searchParams.get('category')
        if (categoryParam) {
            setSelectedCategory(categoryParam)
        }

        const searchParam = searchParams.get('search')
        if (searchParam) {
            setSearchTerm(searchParam)
        } else if (!categoryParam) { // Only clear if no params at all, or preserve if just switching cat
            // Actually better to keep sync with URL. 
            // If URL has no search, but we have state, we should probably respect URL?
            // But typing in input should update state.
        }
    }, [searchParams])

    const handleSearchChange = (e) => {
        const term = e.target.value
        setSearchTerm(term)

        // Update URL
        const newParams = new URLSearchParams(searchParams)
        if (term) {
            newParams.set('search', term)
        } else {
            newParams.delete('search')
        }
        setSearchParams(newParams, { replace: true })
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="shop-page">
            <section className="section">
                <div className="container">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="shop-header"
                    >
                        <h1 className="shop-title">Premium Jersey Collection</h1>
                        <p className="shop-subtitle">
                            Authentic retro football jerseys crafted with quality and passion
                        </p>
                    </motion.div>

                    {/* Search & Filter Section */}
                    <div className="shop-controls">
                        {/* Search Input */}
                        <div className="shop-search">
                            <input
                                type="text"
                                placeholder="Search jerseys..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="shop-search-input"
                            />
                        </div>

                        {/* Category Filters */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="category-filters"
                        >
                            <button
                                className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => {
                                    setSelectedCategory('all')
                                    const newParams = new URLSearchParams(searchParams)
                                    newParams.set('category', 'all')
                                    setSearchParams(newParams)
                                }}
                            >
                                All Products
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category._id}
                                    className={`filter-pill ${selectedCategory === category.slug ||
                                        selectedCategory === category.name.toLowerCase()
                                        ? 'active'
                                        : ''
                                        }`}
                                    onClick={() => {
                                        const cat = category.name.toLowerCase()
                                        setSelectedCategory(cat)
                                        const newParams = new URLSearchParams(searchParams)
                                        newParams.set('category', cat)
                                        setSearchParams(newParams)
                                    }}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </motion.div>
                    </div>

                    {/* Product Count */}
                    <div className="product-count">
                        <span>
                            {filteredProducts.length}
                            {filteredProducts.length === 1 ? 'Product' : 'Products'}
                            {searchTerm && ` found for "${searchTerm}"`}
                        </span>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <div className="products-grid">
                            {filteredProducts.map((product, index) => (
                                <div key={product._id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="no-products"
                        >
                            <p>No products found in this category.</p>
                            <Link to="/shop" onClick={() => setSelectedCategory('all')} className="btn btn-primary">
                                View All Products
                            </Link>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default Shop
