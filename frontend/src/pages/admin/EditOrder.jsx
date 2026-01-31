import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { FiHome, FiPackage, FiLayers, FiLogOut, FiShoppingBag, FiFileText, FiPlus, FiTrash2, FiArrowLeft, FiMenu } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { useProducts } from '../../context/ProductContext'
import { ordersAPI } from '../../api/orders.api'

function EditOrder() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { logout } = useAuth()
    const { products } = useProducts()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [invoiceNumber, setInvoiceNumber] = useState('')

    const [formData, setFormData] = useState({
        customer: {
            name: '',
            phone: '',
            address: ''
        },
        items: [],
        paymentMethod: 'WhatsApp',
        status: 'Pending',
        discount: 0,
        notes: ''
    })

    const [selectedProduct, setSelectedProduct] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [customPrice, setCustomPrice] = useState('')
    const [costPrice, setCostPrice] = useState('')

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            setInitialLoading(true)
            const response = await ordersAPI.getById(id)
            const order = response.data

            setInvoiceNumber(order.invoiceNumber)
            setFormData({
                customer: order.customer,
                items: order.items,
                paymentMethod: order.paymentMethod,
                status: order.status,
                discount: order.discount || 0,
                notes: order.notes || ''
            })
        } catch (err) {
            setError('Failed to load order')
            toast.error('Failed to load invoice details')
            console.error(err)
        } finally {
            setInitialLoading(false)
        }
    }

    const handleCustomerChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            customer: { ...prev.customer, [field]: value }
        }))
    }

    const addItem = () => {
        if (!selectedProduct) return

        const product = products.find(p => p._id === selectedProduct)
        if (!product) return

        const price = customPrice ? parseFloat(customPrice) : product.price
        // Use custom cost price or default to 0 (admin only field)
        const cost = costPrice ? parseFloat(costPrice) : 0

        const newItem = {
            product: product._id,
            name: product.name,
            price: price,
            costPrice: cost,
            quantity: parseInt(quantity),
            total: price * parseInt(quantity)
        }

        setFormData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }))

        // Reset selection
        setSelectedProduct('')
        setQuantity(1)
        setCustomPrice('')
        setCostPrice('')
    }

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
    }

    const updateItemQuantity = (index, newQty) => {
        if (newQty < 1) return
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => {
                if (i === index) {
                    return { ...item, quantity: newQty, total: item.price * newQty }
                }
                return item
            })
        }))
    }

    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0)
    const finalTotal = subtotal - (parseFloat(formData.discount) || 0)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.customer.name || !formData.customer.phone) {
            setError('Customer name and phone are required')
            toast.error('Customer name and phone are required')
            return
        }

        if (formData.items.length === 0) {
            setError('Please add at least one item')
            toast.error('Please add at least one item')
            return
        }

        try {
            setLoading(true)
            await ordersAPI.update(id, {
                customer: formData.customer,
                items: formData.items,
                discount: parseFloat(formData.discount) || 0,
                notes: formData.notes,
                paymentMethod: formData.paymentMethod,
                status: formData.status
            })

            toast.success('Invoice updated successfully')
            // Navigate to the order detail page
            navigate(`/admin/orders/${id}`)
        } catch (err) {
            setError(err.message || 'Failed to update order')
            toast.error(err.message || 'Failed to update invoice')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`
    }

    if (initialLoading) {
        return (
            <div className="admin-layout">
                <div className="loading-state">Loading order...</div>
            </div>
        )
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
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiHome /> Dashboard
                        </NavLink>
                        <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiPackage /> Products
                        </NavLink>
                        <NavLink to="/admin/categories" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiLayers /> Categories
                        </NavLink>
                        <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiFileText /> Invoices
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
                <header className="dashboard-header">
                    <div>
                        <Link to={`/admin/orders/${id}`} className="back-link">
                            <FiArrowLeft /> Back to Invoice
                        </Link>
                        <h1 className="admin-title">Edit Invoice {invoiceNumber}</h1>
                        <p className="admin-subtitle">Update order details and invoice information</p>
                    </div>
                </header>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="create-order-form">
                    <div className="form-grid">
                        {/* Customer Info Section */}
                        <div className="form-section">
                            <h3 className="section-heading">Customer Information</h3>
                            <div className="form-group">
                                <label>Customer Name *</label>
                                <input
                                    type="text"
                                    value={formData.customer.name}
                                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                                    placeholder="Enter customer name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    value={formData.customer.phone}
                                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Address (Optional)</label>
                                <textarea
                                    value={formData.customer.address}
                                    onChange={(e) => handleCustomerChange('address', e.target.value)}
                                    placeholder="Enter address"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Order Details Section */}
                        <div className="form-section">
                            <h3 className="section-heading">Order Details</h3>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                >
                                    <option value="WhatsApp">WhatsApp</option>
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Discount (₹)</label>
                                <input
                                    type="number"
                                    value={formData.discount}
                                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes (Optional)</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add any notes..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Items Section */}
                    <div className="form-section items-section">
                        <h3 className="section-heading">Edit Items</h3>
                        <div className="add-item-row">
                            <select
                                value={selectedProduct}
                                onChange={(e) => {
                                    setSelectedProduct(e.target.value)
                                    const product = products.find(p => p._id === e.target.value)
                                    if (product) setCustomPrice(product.price.toString())
                                }}
                                className="product-select"
                            >
                                <option value="">Select a product...</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} - ₹{product.price}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                placeholder="Qty"
                                className="qty-input"
                            />
                            <input
                                type="number"
                                value={customPrice}
                                onChange={(e) => setCustomPrice(e.target.value)}
                                placeholder="Sell Price"
                                className="price-input"
                            />
                            <input
                                type="number"
                                value={costPrice}
                                onChange={(e) => setCostPrice(e.target.value)}
                                placeholder="Cost (Admin)"
                                className="price-input"
                                style={{ borderColor: 'var(--gold)' }}
                                title="Cost Price (Admin Only - Not shown on invoice)"
                            />
                            <button type="button" onClick={addItem} className="btn btn-secondary add-item-btn">
                                <FiPlus /> Add
                            </button>
                        </div>

                        {/* Items List */}
                        {formData.items.length > 0 && (
                            <div className="items-list">
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Price</th>
                                            <th>Qty</th>
                                            <th>Total</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.items.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.name}</td>
                                                <td>{formatCurrency(item.price)}</td>
                                                <td>
                                                    <div className="qty-controls">
                                                        <button type="button" onClick={() => updateItemQuantity(index, item.quantity - 1)}>-</button>
                                                        <span>{item.quantity}</span>
                                                        <button type="button" onClick={() => updateItemQuantity(index, item.quantity + 1)}>+</button>
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(item.total)}</td>
                                                <td>
                                                    <button type="button" onClick={() => removeItem(index)} className="remove-btn">
                                                        <FiTrash2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="order-totals">
                            <div className="total-row">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {formData.discount > 0 && (
                                <div className="total-row discount">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(formData.discount)}</span>
                                </div>
                            )}
                            <div className="total-row final">
                                <span>Total</span>
                                <span>{formatCurrency(finalTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <Link to={`/admin/orders/${id}`} className="btn btn-secondary">Cancel</Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Invoice'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default EditOrder
