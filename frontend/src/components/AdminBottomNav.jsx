import { NavLink } from 'react-router-dom'
import { FiHome, FiPackage, FiLayers, FiFileText, FiTrendingUp } from 'react-icons/fi'
import '../styles/admin-bottom-nav.css'

function AdminBottomNav() {
    return (
        <div className="admin-bottom-nav">
            <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <FiHome />
                <span>Home</span>
            </NavLink>
            <NavLink
                to="/admin/products"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <FiPackage />
                <span>Products</span>
            </NavLink>
            <NavLink
                to="/admin/orders"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <FiFileText />
                <span>Orders</span>
            </NavLink>
            <NavLink
                to="/admin/categories"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <FiLayers />
                <span>Cats</span>
            </NavLink>
            <NavLink
                to="/admin/reports"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
                <FiTrendingUp />
                <span>Reports</span>
            </NavLink>
        </div>
    )
}

export default AdminBottomNav
