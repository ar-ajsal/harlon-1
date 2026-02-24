import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ── Always-loaded: layout shells only (tiny) ────────────────────────────────
import Header from './components/Header'
import Footer from './components/Footer'
import MobileNav from './components/MobileNav'
import ProtectedRoute from './components/ProtectedRoute'

// ── Customer pages — lazy (route-split) ─────────────────────────────────────
const Home = lazy(() => import('./pages/Home'))
const Shop = lazy(() => import('./pages/Shop'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Checkout = lazy(() => import('./pages/Checkout'))
const TrackOrder = lazy(() => import('./pages/TrackOrder'))

// ── Admin pages — lazy, separate chunk group ─────────────────────────────────
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'))
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'))
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'))
const CreateOrder = lazy(() => import('./pages/admin/CreateOrder'))
const EditOrder = lazy(() => import('./pages/admin/EditOrder'))
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const CouponsManager = lazy(() => import('./pages/admin/CouponsManager'))
const CouponDetails = lazy(() => import('./pages/admin/CouponDetails'))
const GuestOrders = lazy(() => import('./pages/admin/GuestOrders'))
const InquiriesManager = lazy(() => import('./pages/admin/InquiriesManager'))
const StockManager = lazy(() => import('./pages/admin/StockManager'))

function AdminFallback() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <div className="spinner" />
        </div>
    )
}

function CustomerFallback() {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
            <div className="spinner" />
        </div>
    )
}

// Wrapper that forces full remount when product ID changes
function ProductDetailPage() {
    const { id } = useParams()
    return <ProductDetail key={id} />
}

// Warm up Render backend on app load (mitigates cold start delay)
function useBackendWarmup() {
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        fetch(`${apiUrl.replace('/api', '')}/health`, {
            signal: AbortSignal.timeout(5000),
        }).catch(() => { }) // silently ignore
    }, [])
}

function App() {
    useBackendWarmup()

    return (
        <div className="app">
            <Routes>
                {/* ── Admin Routes ─────────────────────────────────────── */}
                <Route path="/admin" element={
                    <Suspense fallback={<AdminFallback />}>
                        <AdminLogin />
                    </Suspense>
                } />
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

                {/* ── Customer Routes ───────────────────────────────────── */}
                <Route path="/*" element={
                    <>
                        <Header />
                        <main className="main-content">
                            <Routes>
                                <Route path="/" element={
                                    <Suspense fallback={<CustomerFallback />}><Home /></Suspense>
                                } />
                                <Route path="/shop" element={
                                    <Suspense fallback={<CustomerFallback />}><Shop /></Suspense>
                                } />
                                <Route path="/product/:id" element={
                                    <Suspense fallback={<CustomerFallback />}><ProductDetailPage /></Suspense>
                                } />
                                <Route path="/checkout" element={
                                    <Suspense fallback={<CustomerFallback />}><Checkout /></Suspense>
                                } />
                                <Route path="/track-order" element={
                                    <Suspense fallback={<CustomerFallback />}><TrackOrder /></Suspense>
                                } />
                                <Route path="/t/:token" element={
                                    <Suspense fallback={<CustomerFallback />}><TrackOrder /></Suspense>
                                } />
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
