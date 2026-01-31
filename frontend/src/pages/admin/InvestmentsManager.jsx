import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiLayers, FiFileText, FiTrendingUp, FiShoppingBag, FiLogOut, FiMenu, FiPlus, FiEdit2, FiTrash2, FiX, FiBriefcase, FiDollarSign } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { investmentsApi } from '../../services/api'
import AdminBottomNav from '../../components/AdminBottomNav'
import '../../styles/admin-responsive.css'
import { toast } from 'react-toastify'

function InvestmentsManager() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const [investments, setInvestments] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ total: 0, count: 0 })
    const [showModal, setShowModal] = useState(false)
    const [editingInvestment, setEditingInvestment] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: 'inventory',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    })

    const categories = [
        { id: 'inventory', label: 'Inventory' },
        { id: 'marketing', label: 'Marketing' },
        { id: 'equipment', label: 'Equipment' },
        { id: 'shipping', label: 'Shipping' },
        { id: 'other', label: 'Other' }
    ]

    useEffect(() => {
        fetchInvestments()
    }, [])

    const fetchInvestments = async () => {
        try {
            setLoading(true)
            const res = await investmentsApi.getAll()
            if (res.success) {
                setInvestments(res.data)
                // Calculate local stats
                const total = res.data.reduce((sum, inv) => sum + (inv.amount || 0), 0)
                setStats({ total, count: res.data.length })
            }
        } catch (error) {
            console.error("Failed to fetch investments", error)
            toast.error("Failed to load investments")
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    const openAddModal = () => {
        setEditingInvestment(null)
        setFormData({
            amount: '',
            description: '',
            category: 'inventory',
            notes: '',
            date: new Date().toISOString().split('T')[0]
        })
        setShowModal(true)
    }

    const openEditModal = (inv) => {
        setEditingInvestment(inv)
        setFormData({
            amount: inv.amount,
            description: inv.description,
            category: inv.category,
            notes: inv.notes || '',
            date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        })
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount)
            }

            if (editingInvestment) {
                await investmentsApi.update(editingInvestment._id, data)
                toast.success("Investment updated successfully")
            } else {
                await investmentsApi.create(data)
                toast.success("Investment created successfully")
            }

            setShowModal(false)
            fetchInvestments()
        } catch (error) {
            console.error("Error saving investment", error)
            toast.error("Failed to save investment")
        }
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this investment?")) {
            try {
                await investmentsApi.delete(id)
                toast.success("Investment deleted")
                fetchInvestments()
            } catch (error) {
                console.error("Error deleting investment", error)
                toast.error("Failed to delete investment")
            }
        }
    }

    // Helper to format currency
    const formatCurrency = (val) => `₹${(val || 0).toLocaleString('en-IN')}`

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
                            to="/admin/investments"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiBriefcase /> Investments
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
                        <h1 className="admin-title">Investments</h1>
                        <p className="admin-subtitle">Track and manage business expenses</p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FiPlus /> Add Investment
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="stats-grid" style={{ marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ color: 'var(--gold)', background: 'rgba(212, 163, 115, 0.1)' }}>
                            <FiDollarSign />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{formatCurrency(stats.total)}</div>
                            <div className="stat-label">Total Invested</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon-wrapper" style={{ color: 'var(--noir-100)', background: 'var(--noir-10)' }}>
                            <FiBriefcase />
                        </div>
                        <div className="stat-info">
                            <div className="stat-value">{stats.count}</div>
                            <div className="stat-label">Transactions</div>
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {investments.length > 0 ? (
                                    investments.map(inv => (
                                        <tr key={inv._id}>
                                            <td style={{ color: 'var(--noir-60)' }}>
                                                {new Date(inv.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td style={{ fontWeight: '500', color: 'var(--noir-100)' }}>
                                                {inv.description}
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    background: 'var(--noir-10)',
                                                    color: 'var(--noir-80)',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {inv.category}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '600', color: 'var(--noir-100)' }}>
                                                {formatCurrency(inv.amount)}
                                            </td>
                                            <td style={{ color: 'var(--noir-60)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {inv.notes || '-'}
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => openEditModal(inv)}
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(inv._id)}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--noir-60)' }}>
                                            No investments found. Add one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <AdminBottomNav />

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingInvestment ? 'Edit Investment' : 'Add Investment'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body-grid">
                                <div className="form-group">
                                    <label className="form-label">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date *</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Description *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="e.g. Bought new inventory, Shop rent"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select
                                        className="form-select"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Optional details..."
                                        rows="3"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default InvestmentsManager
