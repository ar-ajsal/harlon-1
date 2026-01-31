import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiX, FiShoppingBag, FiLayers, FiMenu, FiTrendingUp, FiFileText } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import ImageUploader from '../../components/ImageUploader'
import AdminBottomNav from '../../components/AdminBottomNav'
import '../../styles/admin-responsive.css'

function CategoriesManager() {
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { categories, products, addCategory, updateCategory, deleteCategory } = useProducts()

    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({ name: '', image: '' })
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    const openAddModal = () => {
        setEditingCategory(null)
        setFormData({ name: '', image: '' })
        setShowModal(true)
    }

    const openEditModal = (category) => {
        setEditingCategory(category)
        setFormData({ name: category.name, image: category.image || '' })
        setShowModal(true)
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (editingCategory) {
            updateCategory(editingCategory._id, formData)
        } else {
            addCategory(formData)
        }

        setShowModal(false)
    }

    const handleDelete = (id) => {
        const productsInCategory = products.filter(p =>
            categories.find(c => c._id === id)?.name === p.category
        ).length

        if (productsInCategory > 0) {
            alert(`Cannot delete this category. It has ${productsInCategory} products.`)
            return
        }

        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategory(id)
        }
    }

    const getProductCount = (categoryName) => {
        return products.filter(p => p.category === categoryName).length
    }

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
                <div className="page-header">
                    <div>
                        <h1 className="admin-title">Categories</h1>
                        <p className="admin-subtitle">Manage product categories</p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FiPlus />
                        Add Category
                    </button>
                </div>

                <div className="content-card">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Products</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(categories) && categories.map(category => (
                                    <tr key={category._id}>
                                        <td>
                                            <img
                                                src={category.image || '/images/placeholder.jpg'}
                                                alt={category.name}
                                                className="table-image"
                                            />
                                        </td>
                                        <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                            {category.name}
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {category.slug}
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'var(--surface-light)',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.9rem'
                                            }}>
                                                {getProductCount(category.name)} products
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => openEditModal(category)}
                                                >
                                                    <FiEdit2 />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDelete(category._id)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {categories.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                            No categories found. Click "Add Category" to create one.
                        </div>
                    )}
                </div>
            </main>

            <AdminBottomNav />

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body-grid">
                                <div className="form-group">
                                    <label className="form-label">Category Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Retro, Classic, Polo"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category Image</label>
                                    <div className="image-uploader-wrapper">
                                        <ImageUploader
                                            images={formData.image ? [formData.image] : []}
                                            onImagesChange={(images) => setFormData({ ...formData, image: images[0] || '' })}
                                            maxImages={1}
                                            aspectRatio={1}
                                        />
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--primary-color)', marginTop: '8px' }}>
                                        Image will be cropped to square format
                                    </p>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Update' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CategoriesManager
