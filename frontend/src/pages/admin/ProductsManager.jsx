import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiX, FiShoppingBag, FiLayers } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import ImageUploader from '../../components/ImageUploader'

function ProductsManager() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { products, categories, addProduct, updateProduct, deleteProduct } = useProducts()

    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        description: '',
        category: '',
        sizes: [],
        images: [],
        inStock: true,
        featured: false,
        bestSeller: false
    })

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    const openAddModal = () => {
        setEditingProduct(null)
        setFormData({
            name: '',
            price: '',
            originalPrice: '',
            description: '',
            category: categories[0]?.name || '',
            sizes: ['S', 'M', 'L', 'XL'],
            images: [],
            inStock: true,
            featured: false,
            bestSeller: false
        })
        setShowModal(true)
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString() || '',
            description: product.description,
            category: product.category,
            sizes: product.sizes || [],
            images: product.images || [],
            inStock: product.inStock,
            featured: product.featured,
            bestSeller: product.bestSeller || false
        })
        setShowModal(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null
        }

        if (editingProduct) {
            updateProduct(editingProduct._id, productData)
        } else {
            addProduct(productData)
        }

        setShowModal(false)
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id)
        }
    }

    const handleImagesChange = (newImages) => {
        setFormData({ ...formData, images: newImages })
    }



    const toggleSize = (size) => {
        if (formData.sizes.includes(size)) {
            setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== size) })
        } else {
            setFormData({ ...formData, sizes: [...formData.sizes, size] })
        }
    }

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-logo">harlon</div>
                <nav className="admin-nav">
                    <NavLink
                        to="/admin/dashboard"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiHome />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/admin/products"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiPackage />
                        Products
                    </NavLink>
                    <NavLink
                        to="/admin/categories"
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <FiLayers />
                        Categories
                    </NavLink>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />
                    <Link to="/" className="admin-nav-link" target="_blank">
                        <FiShoppingBag />
                        View Store
                    </Link>
                    <button onClick={handleLogout} className="admin-nav-link" style={{ width: '100%', textAlign: 'left' }}>
                        <FiLogOut />
                        Logout
                    </button>
                </nav>
            </aside>

            <main className="admin-content">
                <div className="admin-header">
                    <h1 className="admin-title">Products</h1>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FiPlus />
                        Add Product
                    </button>
                </div>

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product._id}>
                                <td>
                                    <img
                                        src={product.images?.[0] || '/images/placeholder.jpg'}
                                        alt={product.name}
                                        className="table-image"
                                    />
                                </td>
                                <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                    {product.name}
                                    {product.featured && (
                                        <span style={{
                                            marginLeft: '8px',
                                            fontSize: '0.7rem',
                                            background: 'var(--accent-color)',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '10px'
                                        }}>
                                            Featured
                                        </span>
                                    )}
                                </td>
                                <td>{product.category}</td>
                                <td>
                                    <span style={{ color: 'var(--success-color)', fontWeight: '600' }}>
                                        ₹{product.price}
                                    </span>
                                    {product.originalPrice && (
                                        <span style={{
                                            marginLeft: '8px',
                                            textDecoration: 'line-through',
                                            color: 'var(--text-muted)'
                                        }}>
                                            ₹{product.originalPrice}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span style={{
                                        color: product.inStock ? 'var(--success-color)' : 'var(--error-color)'
                                    }}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="action-btn edit"
                                        onClick={() => openEditModal(product)}
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        onClick={() => handleDelete(product._id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                        No products found. Click "Add Product" to create one.
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Product Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., AC Milan Retro Jersey"
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price (₹) *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="799"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Original Price (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.originalPrice}
                                            onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                            placeholder="1299"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select
                                        className="form-input"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        required
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-input"
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Product description..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Available Sizes</label>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {availableSizes.map(size => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => toggleSize(size)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    background: formData.sizes.includes(size) ? 'var(--primary-color)' : 'var(--surface-light)',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Images</label>
                                    <ImageUploader
                                        images={formData.images}
                                        onImagesChange={handleImagesChange}
                                        maxImages={5}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.inStock}
                                            onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                                        />
                                        In Stock
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.featured}
                                            onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                        />
                                        Featured
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.bestSeller}
                                            onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })}
                                        />
                                        Best Seller
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductsManager
