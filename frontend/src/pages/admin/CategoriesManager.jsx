import { useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiEye, FiEyeOff } from 'react-icons/fi'
import { useProducts } from '../../context/ProductContext'
import ImageUploader from '../../components/ImageUploader'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

function CategoriesManager() {
    const { categories, products, addCategory, updateCategory, deleteCategory } = useProducts()

    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)
    const [formData, setFormData] = useState({ name: '', image: '', isVisible: true })

    const openAddModal = () => {
        setEditingCategory(null)
        setFormData({ name: '', image: '', isVisible: true })
        setShowModal(true)
    }

    const openEditModal = (category) => {
        setEditingCategory(category)
        setFormData({ name: category.name, image: category.image || '', isVisible: category.isVisible !== false })
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

    const handleToggleVisibility = async (category) => {
        await updateCategory(category._id, { ...category, isVisible: !category.isVisible })
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
        return products.filter(p =>
            p.category === categoryName ||
            (Array.isArray(p.categories) && p.categories.includes(categoryName))
        ).length
    }

    return (
        <AdminLayout
            title="Categories"
            subtitle="Manage product categories"
            headerRight={
                <button className="btn btn-primary" onClick={openAddModal}>
                    <FiPlus /> Add Category
                </button>
            }
        >

            <div className="content-card">
                {/* Mobile Card View */}
                <div className="mobile-card-list">
                    {categories.map(category => (
                        <div key={category._id} className="mobile-card" onClick={() => openEditModal(category)}>
                            <img
                                src={category.image || '/images/placeholder.jpg'}
                                alt={category.name}
                                className="mobile-card-image"
                                style={{ opacity: category.isVisible === false ? 0.4 : 1 }}
                            />
                            <div className="mobile-card-content">
                                <div className="mobile-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {category.name}
                                    {category.isVisible === false && (
                                        <span style={{ fontSize: '10px', color: 'var(--error)', border: '1px solid var(--error)', padding: '1px 5px', borderRadius: 4 }}>Hidden</span>
                                    )}
                                </div>
                                <div className="mobile-card-subtitle">{category.slug}</div>
                                <div className="mobile-card-subtitle" style={{ color: 'var(--primary-color)', fontSize: '12px' }}>
                                    {getProductCount(category.name)} products
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignSelf: 'flex-start', marginTop: '-4px' }}>
                                <button
                                    className="btn-icon"
                                    onClick={(e) => { e.stopPropagation(); handleToggleVisibility(category) }}
                                    title={category.isVisible === false ? 'Make visible' : 'Hide from shop'}
                                    style={{ color: category.isVisible === false ? 'var(--error)' : '#16a34a', padding: '8px' }}
                                >
                                    {category.isVisible === false ? <FiEyeOff /> : <FiEye />}
                                </button>
                                <button
                                    className="btn-icon delete-btn"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(category._id) }}
                                    style={{ padding: '8px', color: 'var(--error)' }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="table-responsive desktop-only">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Products</th>
                                <th>Visibility</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category._id} style={{ opacity: category.isVisible === false ? 0.6 : 1 }}>
                                    <td>
                                        <img
                                            src={category.image || '/images/placeholder.jpg'}
                                            alt={category.name}
                                            className="table-image"
                                        />
                                    </td>
                                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                                        {category.name}
                                        {category.isVisible === false && (
                                            <span style={{ fontSize: '10px', color: 'var(--error)', marginLeft: 6, border: '1px solid var(--error)', padding: '1px 5px', borderRadius: 4 }}>Hidden</span>
                                        )}
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{category.slug}</td>
                                    <td>
                                        <span style={{ background: 'var(--surface-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                                            {getProductCount(category.name)} products
                                        </span>
                                    </td>
                                    <td>
                                        <label onClick={e => e.stopPropagation()} className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={category.isVisible !== false}
                                                onChange={() => handleToggleVisibility(category)}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button className="action-btn edit" onClick={() => openEditModal(category)}>
                                                <FiEdit2 />
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDelete(category._id)}>
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

                                {/* Visibility Toggle */}
                                <div className="form-group">
                                    <div className="switch-label" style={{ alignItems: 'center', cursor: 'default' }}>
                                        <label className="toggle-switch" style={{ marginTop: 0 }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isVisible}
                                                onChange={e => setFormData({ ...formData, isVisible: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                        <span className="switch-text">
                                            <span className="switch-title">Visible in Shop</span>
                                            <span className="switch-desc">Show this category to customers</span>
                                        </span>
                                    </div>
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
        </AdminLayout>
    )
}

export default CategoriesManager
