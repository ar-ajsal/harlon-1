import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileNav from './components/MobileNav'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import ProductsManager from './pages/admin/ProductsManager'
import CategoriesManager from './pages/admin/CategoriesManager'
import OrdersManager from './pages/admin/OrdersManager'
import CreateOrder from './pages/admin/CreateOrder'
import EditOrder from './pages/admin/EditOrder'
import OrderDetail from './pages/admin/OrderDetail'
import Reports from './pages/admin/Reports'
import CouponsManager from './pages/admin/CouponsManager'
import CouponDetails from './pages/admin/CouponDetails'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    return (
        <div className="app">
            <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                    <ProtectedRoute>
                        <ProductsManager />
                    </ProtectedRoute>
                } />
                <Route path="/admin/categories" element={
                    <ProtectedRoute>
                        <CategoriesManager />
                    </ProtectedRoute>
                } />
                <Route path="/admin/coupons" element={
                    <ProtectedRoute>
                        <CouponsManager />
                    </ProtectedRoute>
                } />
                <Route path="/admin/coupons/:id" element={
                    <ProtectedRoute>
                        <CouponDetails />
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                    <ProtectedRoute>
                        <OrdersManager />
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders/new" element={
                    <ProtectedRoute>
                        <CreateOrder />
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders/:id/edit" element={
                    <ProtectedRoute>
                        <EditOrder />
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders/:id" element={
                    <ProtectedRoute>
                        <OrderDetail />
                    </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                    <ProtectedRoute>
                        <Reports />
                    </ProtectedRoute>
                } />

                {/* Customer Routes */}
                <Route path="/*" element={
                    <>
                        <Header />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/shop" element={<Shop />} />
                                <Route path="/product/:id" element={<ProductDetail />} />
                            </Routes>
                        </main>
                        <Footer />
                        <MobileNav />
                    </>
                } />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    )
}

export default App

