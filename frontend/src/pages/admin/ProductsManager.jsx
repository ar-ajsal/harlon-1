import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiHome, FiPackage, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiX, FiShoppingBag, FiLayers, FiSearch, FiFilter, FiMenu, FiFileText, FiTrendingUp, FiMove } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import ImageUploader from '../../components/ImageUploader'
import AdminBottomNav from '../../components/AdminBottomNav'
import '../../styles/admin-responsive.css'



function SortableRow({ product, onEdit, onDelete, onVisibilityToggle }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: product._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tr ref={setNodeRef} style={style}>
            <td>
                <div className="product-cell">
                    <button {...attributes} {...listeners} className="drag-handle" style={{ cursor: 'grab', marginRight: '10px', background: 'none', border: 'none', color: '#999' }}>
                        <FiMove />
                    </button>
                    <img
                        src={product.images?.[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        className="table-image"
                    />
                    <div className="product-cell-info">
                        <span className="product-cell-name">
                            {product.name}
                            {product.isVisible === false && <span style={{ fontSize: '10px', color: 'var(--error)', marginLeft: '6px', border: '1px solid var(--error)', padding: '1px 4px', borderRadius: '4px' }}>Hidden</span>}
                        </span>
                        {product.featured && <span className="badge badge-accent">Featured</span>}
                        {product.bestSeller && <span className="badge badge-primary">Best Seller</span>}
                    </div>
                </div>
            </td>
            <td>{product.category}</td>
            <td>₹{product.price}</td>
            <td>
                <label onClick={e => e.stopPropagation()} className="toggle-switch">
                    <input
                        type="checkbox"
                        checked={product.isVisible !== false}
                        onChange={() => onVisibilityToggle(product)}
                    />
                    <span className="toggle-slider"></span>
                </label>
            </td>
            <td>
                <div className="action-buttons">
                    <button
                        className="btn-icon"
                        onClick={() => onEdit(product)}
                    >
                        <FiEdit2 />
                    </button>
                    <button
                        className="btn-icon delete-btn"
                        onClick={() => onDelete(product._id)}
                    >
                        <FiTrash2 />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ProductsManager() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { products, categories, addProduct, updateProduct, deleteProduct, reorderProducts } = useProducts()

    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        costPrice: '',
        description: '',
        category: '',
        sizes: [],
        images: [],
        featured: false,
        bestSeller: false,
        isVisible: true
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
            costPrice: '',
            description: '',
            category: categories[0]?.name || '',
            sizes: ['S', 'M', 'L', 'XL'],
            images: [],
            featured: false,
            bestSeller: false,
            isVisible: true
        })
        setShowModal(true)
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            price: product.price.toString(),
            originalPrice: product.originalPrice?.toString() || '',
            costPrice: product.costPrice?.toString() || '',
            description: product.description,
            category: product.category,
            sizes: product.sizes || [],
            images: product.images || [],
            featured: product.featured,
            bestSeller: product.bestSeller || false,
            isVisible: product.isVisible !== false // Default to true if undefined
        })
        setShowModal(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const productData = {
            ...formData,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0
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

    const handleVisibilityToggle = async (product) => {
        try {
            await updateProduct(product._id, { isVisible: !product.isVisible })
        } catch (error) {
            console.error('Error toggling visibility:', error)
            alert('Failed to update visibility')
        }
    }

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = products.findIndex((p) => p._id === active.id);
            const newIndex = products.findIndex((p) => p._id === over.id);

            const newOrder = arrayMove(products, oldIndex, newIndex);
            reorderProducts(newOrder);
        }
    };

    return (
        <div className="admin-layout">
            <button
                className="sidebar-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle Sidebar"
            >
                <FiMenu size={24} />
            </button>

            {/* Mobile Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-logo">harlon</div>
                <div className="sidebar-scroll">
                    <nav className="admin-nav">
                        <NavLink
                            to="/admin/dashboard"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiHome /> Dashboard
                        </NavLink>
                        <NavLink
                            to="/admin/products"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiPackage /> Products
                        </NavLink>
                        <NavLink
                            to="/admin/categories"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiLayers /> Categories
                        </NavLink>
                        <NavLink
                            to="/admin/orders"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiFileText /> Invoices
                        </NavLink>
                        <NavLink
                            to="/admin/reports"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiTrendingUp /> Reports
                        </NavLink>

                        <div className="nav-divider" />

                        <Link to="/" className="admin-nav-link" target="_blank">
                            <FiShoppingBag /> View Store
                        </Link>
                        <button onClick={handleLogout} className="admin-nav-link logout-btn">
                            <FiLogOut /> Logout
                        </button>
                    </nav>
                </div>
            </aside>

            <main className="admin-content">
                <header className="page-header">
                    <div>
                        <h1 className="admin-title">Products</h1>
                        <p className="admin-subtitle">Manage your inventory and catalog</p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FiPlus /> Add New Product
                    </button>
                </header>

                <div className="content-card">
                    <div className="table-actions">
                        <div className="search-bar">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-outline" style={{ display: 'none' }}>
                            <FiFilter /> Filter
                        </button>
                    </div>

                    {/* Mobile Search Bar */}
                    <div className="mobile-search-container">
                        <FiSearch className="mobile-search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mobile-search-input"
                        />
                    </div>

                    {/* Mobile Floating Action Button */}
                    <button className="fab-btn" onClick={openAddModal} aria-label="Add Product">
                        <FiPlus />
                    </button>

                    {filteredProducts.length === 0 ? (
                        <div className="empty-state">
                            <FiPackage />
                            <h3>No products found</h3>
                            <p>Try adjusting your search or add a new product.</p>
                        </div>
                    ) : (
                        <div className="products-list-container">
                            {/* Mobile Card View */}
                            <div className="mobile-card-list">
                                {filteredProducts.map(product => (
                                    <div key={product._id} className="mobile-card" onClick={() => openEditModal(product)}>
                                        <img
                                            src={product.images?.[0] || '/images/placeholder.jpg'}
                                            alt={product.name}
                                            className="mobile-card-image"
                                        />
                                        <div className="mobile-card-content">
                                            <div className="mobile-card-title">{product.name}</div>
                                            <div className="mobile-card-subtitle">{product.category}</div>
                                            <div className="mobile-card-price">₹{product.price}</div>
                                            <label onClick={e => e.stopPropagation()} className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={product.isVisible !== false}
                                                    onChange={() => handleVisibilityToggle(product)}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="table-responsive desktop-only">
                                <table className="admin-table desktop-only">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Category</th>
                                            <th>Price</th>
                                            <th>Visibility</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={products.map(p => p._id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {filteredProducts.map(product => (
                                                    <SortableRow
                                                        key={product._id}
                                                        product={product}
                                                        onEdit={openEditModal}
                                                        onDelete={handleDelete}
                                                        onVisibilityToggle={handleVisibilityToggle}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <AdminBottomNav />

            {/* Premium Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content modal-lg">
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <p className="modal-subtitle">Fill in the details below to update your catalog</p>
                            </div>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body-grid">
                                {/* Left Column: Basic Info */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Basic Information</h3>

                                    <div className="form-group">
                                        <label className="form-label">Product Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., AC Milan Retro Jersey 2007"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Selling Price (₹) *</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="0.00"
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
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Cost Price (₹)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.costPrice}
                                                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                                placeholder="What you paid to buy this"
                                            />
                                            <small style={{ color: 'var(--noir-60)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                                Amount paid to supplier/seller
                                            </small>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Profit per Item</label>
                                            <div style={{
                                                padding: '12px 16px',
                                                background: formData.price && formData.costPrice && (parseFloat(formData.price) - parseFloat(formData.costPrice)) > 0
                                                    ? 'rgba(34, 197, 94, 0.1)'
                                                    : 'rgba(239, 68, 68, 0.1)',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                color: formData.price && formData.costPrice && (parseFloat(formData.price) - parseFloat(formData.costPrice)) > 0
                                                    ? 'var(--success)'
                                                    : 'var(--error)'
                                            }}>
                                                ₹{formData.price && formData.costPrice
                                                    ? (parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)
                                                    : '0.00'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            rows="4"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Enter product description..."
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <select
                                            className="form-select"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {Array.isArray(categories) && categories.map(cat => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Right Column: Inventory & Stats */}
                                <div className="form-section">
                                    <h3 className="form-section-title">Inventory & Media</h3>

                                    <div className="form-group">
                                        <label className="form-label">Available Sizes</label>
                                        <div className="size-selector">
                                            {availableSizes.map(size => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    className={`size-chip ${formData.sizes.includes(size) ? 'active' : ''}`}
                                                    onClick={() => toggleSize(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Product Images</label>
                                        <div className="image-uploader-wrapper">
                                            <ImageUploader
                                                images={formData.images}
                                                onImagesChange={handleImagesChange}
                                                maxImages={5}
                                            />
                                        </div>
                                    </div>

                                    <div className="switches-container" style={{
                                        display: 'grid',
                                        gap: '16px',
                                        background: '#f8f9fa',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        marginTop: '24px'
                                    }}>
                                        <label className="switch-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.featured}
                                                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                                                style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span className="switch-text">
                                                <span className="switch-title" style={{ display: 'block', fontWeight: '600', color: '#1a1a1a' }}>Featured</span>
                                                <span className="switch-desc" style={{ display: 'block', fontSize: '13px', color: '#666', marginTop: '2px' }}>Show on homepage hero/featured</span>
                                            </span>
                                        </label>

                                        <label className="switch-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.bestSeller}
                                                onChange={e => setFormData({ ...formData, bestSeller: e.target.checked })}
                                                style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span className="switch-text">
                                                <span className="switch-title" style={{ display: 'block', fontWeight: '600', color: '#1a1a1a' }}>Best Seller</span>
                                                <span className="switch-desc" style={{ display: 'block', fontSize: '13px', color: '#666', marginTop: '2px' }}>Mark with gold badge</span>
                                            </span>
                                        </label>

                                        <div style={{ borderTop: '1px solid #e1e1e1', margin: '8px 0' }}></div>

                                        <label className="switch-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isVisible}
                                                onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                                style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer', accentColor: '#2563eb' }}
                                            />
                                            <span className="switch-text">
                                                <span className="switch-title" style={{ display: 'block', fontWeight: '600', color: '#1a1a1a' }}>Visible to User</span>
                                                <span className="switch-desc" style={{ display: 'block', fontSize: '13px', color: '#666', marginTop: '2px' }}>Show this product in store</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Save Changes' : 'Create Product'}
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
