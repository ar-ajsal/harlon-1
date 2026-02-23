import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from './components/Header'
import Footer from './components/Footer'
import MobileNav from './components/MobileNav'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Checkout from './pages/Checkout'
import TrackOrder from './pages/TrackOrder'
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
import GuestOrders from './pages/admin/GuestOrders'
import InquiriesManager from './pages/admin/InquiriesManager'
import StockManager from './pages/admin/StockManager'
import ProtectedRoute from './components/ProtectedRoute'

function AdminFallback() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="spinner" />
        </div>
    )
}


function App() {
    return (
        <div className="app">
            <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <Dashboard />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <ProductsManager />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/categories" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <CategoriesManager />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/coupons" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <CouponsManager />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/coupons/:id" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <CouponDetails />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <OrdersManager />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders/new" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <CreateOrder />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders/:id/edit" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <EditOrder />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/orders/:id" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <OrderDetail />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <Reports />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/guest-orders" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <GuestOrders />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/guest-inquiries" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <InquiriesManager />
                        </Suspense>
                    </ProtectedRoute>
                } />
                <Route path="/admin/stock" element={
                    <ProtectedRoute>
                        <Suspense fallback={<AdminFallback />}>
                            <StockManager />
                        </Suspense>
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
                                <Route path="/checkout" element={<Checkout />} />
                                <Route path="/track-order" element={<TrackOrder />} />
                                <Route path="/t/:token" element={<TrackOrder />} />
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

