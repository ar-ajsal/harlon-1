import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiMove, FiFilter } from 'react-icons/fi'
import { useProducts } from '../../context/ProductContext'
import ImageUploader from '../../components/ImageUploader'
import AdminLayout from '../../components/AdminLayout'
import { toast } from 'react-toastify'
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
                            {product.soldOut && <span style={{ fontSize: '10px', color: '#dc2626', marginLeft: '6px', border: '1px solid #dc2626', padding: '1px 4px', borderRadius: '4px', background: '#fff1f1' }}>Sold Out</span>}
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

// Sortable Mobile Card Component
function SortableMobileCard({ product, onEdit, onVisibilityToggle }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: product._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="mobile-card"
        >
            <div
                {...attributes}
                {...listeners}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '8px',
                    transform: 'translateY(-50%)',
                    cursor: 'grab',
                    padding: '8px',
                    color: '#999',
                    touchAction: 'none',
                }}
            >
                <FiMove size={20} />
            </div>
            <div onClick={() => onEdit(product)} style={{ paddingLeft: '36px' }}>
                <img
                    src={product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="mobile-card-image"
                />
                <div className="mobile-card-content">
                    <div className="mobile-card-title">
                        {product.name}
                        {product.soldOut && <span style={{ fontSize: '10px', color: '#dc2626', marginLeft: '6px', border: '1px solid #dc2626', padding: '1px 4px', borderRadius: '4px', background: '#fff1f1' }}>Sold Out</span>}
                    </div>
                    <div className="mobile-card-subtitle">{product.category}</div>
                    <div className="mobile-card-price">₹{product.price}</div>
                    <label onClick={e => e.stopPropagation()} className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={product.isVisible !== false}
                            onChange={() => onVisibilityToggle(product)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>
        </div>
    );
}


function ProductsManager() {
    const { products, categories, addProduct, updateProduct, deleteProduct, reorderProducts } = useProducts()

    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        costPrice: '',
        originalPrice: '',
        description: '',
        category: '',
        sizes: [],
        images: [],
        featured: false,
        bestSeller: false,
        isVisible: true,
        soldOut: false
    })

    const openAddModal = () => {
        setEditingProduct(null)
        setFormData({
            name: '',
            price: '',
            costPrice: '',
            originalPrice: '',
            description: '',
            category: categories[0]?.name || '',
            sizes: ['S', 'M', 'L', 'XL'],
            images: [],
            featured: false,
            bestSeller: false,
            isVisible: true,
            soldOut: false
        })
        setShowModal(true)
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            price: product.price.toString(),
            costPrice: product.costPrice?.toString() || '',
            originalPrice: product.originalPrice?.toString() || '',
            description: product.description,
            category: product.category,
            sizes: product.sizes || [],
            images: product.images || [],
            featured: product.featured,
            bestSeller: product.bestSeller || false,
            isVisible: product.isVisible !== false, // Default to true if undefined
            soldOut: product.soldOut || false
        })
        setShowModal(true)
    }

    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        // --- Client-side validation ---
        const name = formData.name.trim()
        if (!name) { toast.error('Product name is required'); return }

        const price = parseFloat(formData.price)
        if (!formData.price || isNaN(price) || price <= 0) { toast.error('Enter a valid selling price'); return }

        if (!formData.category) { toast.error('Please select a category'); return }

        if (!formData.sizes || formData.sizes.length === 0) { toast.error('Select at least one size'); return }

        if (!formData.images || formData.images.length === 0) { toast.error('Upload at least one product image'); return }

        const productData = {
            ...formData,
            name,
            price,
            costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null
        }

        setSubmitting(true)
        try {
            if (editingProduct) {
                await updateProduct(editingProduct._id, productData)
                toast.success('Product updated successfully!')
            } else {
                await addProduct(productData)
                toast.success('Product added successfully!')
            }
            setShowModal(false)
        } catch (err) {
            toast.error(err.message || 'Failed to save product. Please try again.')
            // Modal stays open so admin can fix and retry
        } finally {
            setSubmitting(false)
        }
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
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag (prevents accidental drags)
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,      // 200ms press before drag starts
                tolerance: 5,    // 5px movement tolerance during delay
            },
        }),
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
        <AdminLayout
            title="Products"
            subtitle="Manage your inventory and catalog"
            headerRight={
                <button className="btn btn-primary" onClick={openAddModal}>
                    <FiPlus /> Add New Product
                </button>
            }
        >

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
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={filteredProducts.map(p => p._id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {filteredProducts.map(product => (
                                        <SortableMobileCard
                                            key={product._id}
                                            product={product}
                                            onEdit={openEditModal}
                                            onVisibilityToggle={handleVisibilityToggle}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
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

                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <select
                                            className="form-select"
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

                                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Cost Price (₹)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.costPrice}
                                                onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                                                placeholder="Buying Price"
                                            />
                                            <small style={{ color: '#666', fontSize: '11px' }}>What you pay (Buying Price)</small>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Selling Price (₹) *</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                placeholder="Selling Price"
                                                required
                                            />
                                            <small style={{ color: '#666', fontSize: '11px' }}>What customers pay</small>
                                        </div>
                                    </div>

                                    {/* Profit Calculator Display */}
                                    {formData.price && formData.costPrice && (
                                        <div style={{
                                            padding: '12px',
                                            background: 'var(--success-light)',
                                            border: '1px solid var(--success)',
                                            borderRadius: '8px',
                                            marginBottom: '16px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>Estimated Profit</div>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--success)' }}>
                                                    ₹{(parseFloat(formData.price) - parseFloat(formData.costPrice)).toLocaleString()}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '12px', color: '#666' }}>Margin</div>
                                                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--noir-80)' }}>
                                                    {Math.round(((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100)}%
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label className="form-label">Original Price / MRP (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.originalPrice}
                                            onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                                            placeholder="Market Price (shown struck-through)"
                                        />
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

                                        <label className="switch-label" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.soldOut}
                                                onChange={e => setFormData({ ...formData, soldOut: e.target.checked })}
                                                style={{ marginTop: '4px', width: '18px', height: '18px', cursor: 'pointer', accentColor: '#dc2626' }}
                                            />
                                            <span className="switch-text">
                                                <span className="switch-title" style={{ display: 'block', fontWeight: '600', color: formData.soldOut ? '#dc2626' : '#1a1a1a' }}>Sold Out</span>
                                                <span className="switch-desc" style={{ display: 'block', fontSize: '13px', color: '#666', marginTop: '2px' }}>Block purchases — shows "Sold Out" badge to customers</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}

export default ProductsManager
