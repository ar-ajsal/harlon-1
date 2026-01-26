import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'

function Shop() {
    const [searchParams] = useSearchParams()
    const { products, categories, loading } = useProducts()
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
    const [filteredProducts, setFilteredProducts] = useState([])

    // Debug logging
    console.log('[Shop] products:', products)
    console.log('[Shop] products.length:', products.length)
    console.log('[Shop] selectedCategory:', selectedCategory)
    console.log('[Shop] filteredProducts:', filteredProducts)
    console.log('[Shop] loading:', loading)

    useEffect(() => {
        console.log('[Shop useEffect] Running filter logic')
        console.log('[Shop useEffect] selectedCategory:', selectedCategory)
        console.log('[Shop useEffect] products:', products)

        const visibleProducts = products.filter(p => p.isVisible !== false)

        if (selectedCategory === 'all') {
            setFilteredProducts(visibleProducts)
        } else {
            setFilteredProducts(
                visibleProducts.filter(p =>
                    p.category.toLowerCase() === selectedCategory.toLowerCase()
                )
            )
        }
    }, [selectedCategory, products])

    useEffect(() => {
        const categoryParam = searchParams.get('category')
        if (categoryParam) {
            setSelectedCategory(categoryParam)
        }
    }, [searchParams])

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

                    {/* Category Filters */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="category-filters"
                    >
                        <button
                            className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('all')}
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
                                onClick={() => setSelectedCategory(category.name.toLowerCase())}
                            >
                                {category.name}
                            </button>
                        ))}
                    </motion.div>

                    {/* Product Count */}
                    <div className="product-count">
                        <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}</span>
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
