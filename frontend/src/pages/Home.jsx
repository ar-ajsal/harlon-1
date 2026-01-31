import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa'
import { FiArrowRight } from 'react-icons/fi'
import { useProducts } from '../context/ProductContext'
import ProductCard from '../components/ProductCard'
import { WHATSAPP_NUMBER } from '../config/constants'

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
        }
    }
}

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

function Home() {
    const { products, categories, loading } = useProducts()

    const visibleProducts = products.filter(p => p.isVisible !== false)
    const featuredProducts = visibleProducts.filter(p => p.featured).slice(0, 4)

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
                <div className="container">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeInUp}
                        className="hero-content"
                    >
                        <h1 className="hero-title">
                            Premium Retro
                            <br />
                            <span>Jerseys</span>
                        </h1>
                        <p className="hero-subtitle">
                            Authentic quality, timeless style. Handpicked collection of legendary football jerseys.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/shop" className="btn btn-primary">
                                Explore Collection <FiArrowRight />
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
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hero-image"
                    >
                        <div className="hero-image-wrapper">
                            <img
                                src={products[0]?.images?.[0] || '/images/placeholder.jpg'}
                                alt="Featured Jersey"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories Section */}
            {categories.length > 0 && (
                <section className="section categories-section">
                    <div className="container">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.5 }}
                            className="section-title"
                        >
                            Shop by Category
                        </motion.h2>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            variants={staggerContainer}
                            className="categories-grid"
                        >
                            {Array.isArray(categories) && categories.map((category) => (
                                <motion.div key={category._id} variants={fadeInUp}>
                                    <Link
                                        to={`/shop?category=${category.slug}`}
                                        className="category-card"
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
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                className="section-title"
                            >
                                Featured Jerseys
                            </motion.h2>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <Link to="/shop" className="view-all-link">
                                    View All <FiArrowRight />
                                </Link>
                            </motion.div>
                        </div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            variants={staggerContainer}
                            className="products-grid"
                        >
                            {featuredProducts.map(product => (
                                <motion.div key={product._id} variants={fadeInUp}>
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* All Products */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="section-title"
                        >
                            All Jerseys
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link to="/shop" className="view-all-link">
                                View All <FiArrowRight />
                            </Link>
                        </motion.div>
                    </div>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        variants={staggerContainer}
                        className="products-grid"
                    >
                        {visibleProducts.slice(0, 8).map(product => (
                            <motion.div key={product._id} variants={fadeInUp}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </div>
    )
}

export default Home
