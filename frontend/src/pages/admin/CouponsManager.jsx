import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FiHome, FiPackage, FiLogOut, FiPlus, FiEdit2, FiTrash2, FiX, FiShoppingBag, FiLayers, FiMenu, FiTrendingUp, FiFileText, FiGift, FiToggleLeft, FiToggleRight, FiBriefcase } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import { couponsApi } from '../../api/coupons.api'
import AdminBottomNav from '../../components/AdminBottomNav'
import '../../styles/admin-responsive.css'

function CouponsManager() {
    const navigate = useNavigate()
    const { logout } = useAuth()

    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        targetSales: 5,
        rewardDescription: '1 Free Jersey',
        discountType: 'none',
        discountValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        isActive: true
    })

    const handleLogout = () => {
        logout()
        navigate('/admin')
    }

    useEffect(() => {
        fetchCoupons()
    }, [])

    const fetchCoupons = async () => {
        try {
            setLoading(true)
            const response = await couponsApi.getAll()
            // Backend returns: { success: true, data: { data: [...coupons], pagination: {...} } }
            const couponsData = response.data?.data || response.data || []
            setCoupons(Array.isArray(couponsData) ? couponsData : [])
        } catch (error) {
            console.error('Error fetching coupons:', error)
            toast.error('Failed to load coupons')
        } finally {
            setLoading(false)
        }
    }

    const openAddModal = () => {
        setEditingCoupon(null)
        setFormData({
            code: '',
            name: '',
            targetSales: 5,
            rewardDescription: '1 Free Jersey',
            discountType: 'none',
            discountValue: 0,
            startDate: new Date().toISOString().split('T')[0],
            expiryDate: '',
            isActive: true
        })
        setShowModal(true)
    }

    const openEditModal = (coupon) => {
        setEditingCoupon(coupon)
        setFormData({
            code: coupon.code,
            name: coupon.name,
            targetSales: coupon.targetSales,
            rewardDescription: coupon.rewardDescription,
            discountType: coupon.discountType || 'none',
            discountValue: coupon.discountValue || 0,
            startDate: coupon.startDate?.split('T')[0] || '',
            expiryDate: coupon.expiryDate?.split('T')[0] || '',
            isActive: coupon.isActive
        })
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (editingCoupon) {
                await couponsApi.update(editingCoupon._id, formData)
                toast.success('Coupon updated successfully!')
            } else {
                await couponsApi.create(formData)
                toast.success('Coupon created successfully!')
            }
            setShowModal(false)
            fetchCoupons()
        } catch (error) {
            console.error('Error saving coupon:', error)
            toast.error(error.message || 'Failed to save coupon')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return

        try {
            await couponsApi.delete(id)
            toast.success('Coupon deleted successfully!')
            fetchCoupons()
        } catch (error) {
            console.error('Error deleting coupon:', error)
            toast.error(error.message || 'Failed to delete coupon')
        }
    }

    const toggleActive = async (coupon) => {
        try {
            await couponsApi.update(coupon._id, { isActive: !coupon.isActive })
            toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}!`)
            fetchCoupons()
        } catch (error) {
            console.error('Error toggling coupon:', error)
            toast.error('Failed to update coupon status')
        }
    }

    const generateCode = () => {
        const random = Math.random().toString(36).substr(2, 6).toUpperCase()
        setFormData({ ...formData, code: `REF-${random}` })
    }

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'var(--success)'
        if (percentage >= 60) return 'var(--gold)'
        return 'var(--primary-color)'
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
                            to="/admin/coupons"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiGift /> Coupons
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
                        <NavLink
                            to="/admin/stock"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiPackage /> Stock
                        </NavLink>
                        <NavLink
                            to="/admin/guest-orders"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiShoppingBag /> Guest Orders
                        </NavLink>
                        <NavLink
                            to="/admin/guest-inquiries"
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <FiBriefcase /> Inquiries
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
                        <h1 className="admin-title">Coupon Codes</h1>
                        <p className="admin-subtitle">Manage referral & affiliate coupons</p>
                    </div>
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <FiPlus />
                        Create Coupon
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                        Loading coupons...
                    </div>
                ) : (
                    <div className="content-card">
                        {/* Mobile Card View */}
                        <div className="mobile-card-list">
                            {coupons.map(coupon => {
                                const progress = Math.min(100, Math.round((coupon.currentSales / coupon.targetSales) * 100))
                                const isExpired = new Date() > new Date(coupon.expiryDate)

                                return (
                                    <div key={coupon._id} className="mobile-card" onClick={() => openEditModal(coupon)}>
                                        <div className="mobile-card-content">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div className="mobile-card-title" style={{ fontFamily: 'monospace', fontSize: '16px' }}>
                                                    {coupon.code}
                                                </div>
                                                <div className={`mobile-card-status ${coupon.isActive ? 'active' : 'inactive'}`}
                                                    style={{
                                                        background: coupon.isActive ? 'var(--success-light)' : 'var(--noir-10)',
                                                        color: coupon.isActive ? 'var(--success)' : 'var(--noir-60)'
                                                    }}>
                                                    {coupon.isActive ? 'Active' : 'Inactive'}
                                                </div>
                                            </div>

                                            <div className="mobile-card-subtitle">{coupon.name}</div>

                                            <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                                                    <span>Progress: {coupon.currentSales}/{coupon.targetSales}</span>
                                                    <span style={{ color: getProgressColor(progress) }}>{progress}%</span>
                                                </div>
                                                <div style={{ height: '4px', background: 'var(--surface-light)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${progress}%`, height: '100%', background: getProgressColor(progress) }} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                <span>Exp: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                                {isExpired && <span style={{ color: 'var(--error)' }}>Expired</span>}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                className="btn-icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleActive(coupon);
                                                }}
                                                style={{ color: coupon.isActive ? 'var(--success)' : 'var(--text-muted)' }}
                                            >
                                                {coupon.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                            </button>
                                            <button
                                                className="btn-icon delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(coupon._id);
                                                }}
                                                style={{ color: 'var(--error)' }}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="table-responsive desktop-only">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Progress</th>
                                        <th>Reward</th>
                                        <th>Expiry</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map(coupon => {
                                        const progress = Math.min(100, Math.round((coupon.currentSales / coupon.targetSales) * 100))
                                        const isExpired = new Date() > new Date(coupon.expiryDate)
                                        const isComplete = coupon.currentSales >= coupon.targetSales

                                        return (
                                            <tr key={coupon._id}>
                                                <td style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                                                    {coupon.code}
                                                </td>
                                                <td>{coupon.name}</td>
                                                <td>
                                                    <div style={{ minWidth: '180px' }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            marginBottom: '4px'
                                                        }}>
                                                            <span style={{ fontSize: '13px', fontWeight: '500' }}>
                                                                {coupon.currentSales}/{coupon.targetSales}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '11px',
                                                                color: getProgressColor(progress)
                                                            }}>
                                                                {progress}%
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            height: '6px',
                                                            background: 'var(--surface-light)',
                                                            borderRadius: '3px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${progress}%`,
                                                                height: '100%',
                                                                background: getProgressColor(progress),
                                                                transition: 'width 0.3s ease'
                                                            }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{coupon.rewardDescription}</td>
                                                <td>
                                                    {new Date(coupon.expiryDate).toLocaleDateString()}
                                                    {isExpired && (
                                                        <span style={{
                                                            marginLeft: '8px',
                                                            color: 'var(--error)',
                                                            fontSize: '11px'
                                                        }}>
                                                            Expired
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => toggleActive(coupon)}
                                                        style={{
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 10px',
                                                            borderRadius: '16px',
                                                            fontSize: '13px',
                                                            color: coupon.isActive ? 'var(--success)' : 'var(--text-muted)',
                                                            background: coupon.isActive ? 'var(--success)15' : 'var(--surface-light)'
                                                        }}
                                                    >
                                                        {coupon.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <Link
                                                            to={`/admin/coupons/${coupon._id}`}
                                                            className="action-btn edit"
                                                            title="View Details"
                                                        >
                                                            <FiFileText />
                                                        </Link>
                                                        <button
                                                            className="action-btn edit"
                                                            onClick={() => openEditModal(coupon)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            className="action-btn delete"
                                                            onClick={() => handleDelete(coupon._id)}
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {coupons.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                                No coupons found. Click "Create Coupon" to add one.
                            </div>
                        )}
                    </div>
                )}
            </main>

            <AdminBottomNav />

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                            </h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body-grid">
                                <div className="form-group">
                                    <label className="form-label">Coupon Code *</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.code}
                                            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g., FRIEND123"
                                            required
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={generateCode}
                                            style={{ whiteSpace: 'nowrap' }}
                                        >
                                            Generate
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Friend's Name *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., John Doe"
                                        required
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Target Sales *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.targetSales}
                                            onChange={e => setFormData({ ...formData, targetSales: parseInt(e.target.value) })}
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                                style={{ marginRight: '8px' }}
                                            />
                                            Active
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Reward Description *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.rewardDescription}
                                        onChange={e => setFormData({ ...formData, rewardDescription: e.target.value })}
                                        placeholder="e.g., 1 Free Jersey"
                                        required
                                    />
                                </div>

                                {/* Discount Fields */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Discount Type</label>
                                        <select
                                            className="form-input"
                                            value={formData.discountType}
                                            onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                        >
                                            <option value="none">No Discount</option>
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>

                                    {formData.discountType !== 'none' && (
                                        <div className="form-group">
                                            <label className="form-label">
                                                Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                                            </label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                value={formData.discountValue}
                                                onChange={e => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                                                min="0"
                                                max={formData.discountType === 'percentage' ? '100' : undefined}
                                                step={formData.discountType === 'percentage' ? '1' : '10'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Start Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.startDate}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Expiry Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.expiryDate}
                                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CouponsManager
