import { Link } from 'react-router-dom'
import { FaWhatsapp } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import { WHATSAPP_NUMBER } from '../config/constants'

function Home() {
    const { products, categories, loading } = useProducts()

    const featuredProducts = products.filter(p => p.featured).slice(0, 4)

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg-pattern"></div>
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Retro Footballs<br />
                            <span>Jerseys</span>
                        </h1>
                        <p className="hero-subtitle">
                            Premium collection of authentic retro football jerseys
                        </p>
                        <div className="hero-buttons">
                            <Link to="/shop" className="btn btn-primary">
                                Shop Now <FiArrowRight />
                            </Link>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-whatsapp"
                            >
                                <FaWhatsapp /> Order on WhatsApp
                            </a>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="hero-image-wrapper">
                            <img
                                src={products[0]?.images?.[0] || '/images/placeholder.jpg'}
                                alt="Featured Jersey"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            {categories.length > 0 && (
                <section className="section categories-section">
                    <div className="container">
                        <h2 className="section-title">Shop by Category</h2>
                        <div className="categories-grid">
                            {categories.map((category, index) => (
                                <Link
                                    key={category._id}
                                    to={`/shop?category=${category.slug}`}
                                    className="category-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="category-image">
                                        <img
                                            src={category.image || products.find(p => p.category === category.name)?.images?.[0] || '/images/placeholder.jpg'}
                                            alt={category.name}
                                        />
                                    </div>
                                    <div className="category-overlay">
                                        <h3>{category.name}</h3>
                                        <span>Shop Now <FiArrowRight /></span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Featured Jerseys</h2>
                            <Link to="/shop" className="view-all-link">
                                View All <FiArrowRight />
                            </Link>
                        </div>
                        <div className="products-grid">
                            {featuredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">All Jerseys</h2>
                        <Link to="/shop" className="view-all-link">
                            View All <FiArrowRight />
                        </Link>
                    </div>
                    <div className="products-grid">
                        {products.slice(0, 8).map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
