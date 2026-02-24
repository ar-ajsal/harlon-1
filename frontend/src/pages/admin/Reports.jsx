import { useState, useEffect } from 'react'
import { FiDollarSign, FiTrendingUp, FiFileText, FiActivity } from 'react-icons/fi'
import { ordersAPI } from '../../api/orders.api'
import AdminLayout from '../../components/AdminLayout'
import '../../styles/admin-responsive.css'

function Reports() {
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState(null)

    const today = new Date()
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(today.getFullYear())


    useEffect(() => {
        fetchReport()
    }, [selectedMonth, selectedYear])

    const fetchReport = async () => {
        try {
            setLoading(true)
            const response = await ordersAPI.getMonthlyReport(selectedYear, selectedMonth)
            setReportData(response.data)
        } catch (error) {
            console.error('Error fetching report:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return `₹${(amount || 0).toLocaleString('en-IN')}`
    }

    const { summary, daily } = reportData || {}

    const headerRight = (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="form-input" style={{ height: '40px', width: 'auto' }}
            >
                {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                        {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                    </option>
                ))}
            </select>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="form-input" style={{ height: '40px', width: 'auto' }}
            >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
            </select>
        </div>
    )

    return (
        <AdminLayout
            title="Monthly Report"
            subtitle="Sales and profit analysis"
            headerRight={headerRight}
        >

            {loading ? (
                <div className="loading-state">Loading report...</div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ color: 'var(--gold)', background: 'hsla(38, 45%, 52%, 0.1)' }}>
                                <FiDollarSign />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{formatCurrency(summary?.totalRevenue)}</div>
                                <div className="stat-label">Total Revenue</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ color: 'var(--success)', background: 'hsla(142, 76%, 36%, 0.1)' }}>
                                <FiTrendingUp />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{formatCurrency(summary?.totalProfit)}</div>
                                <div className="stat-label">Total Profit</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ color: 'var(--noir-60)', background: 'var(--noir-10)' }}>
                                <FiActivity />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{formatCurrency(summary?.totalCost)}</div>
                                <div className="stat-label">Total Cost</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon-wrapper" style={{ color: 'var(--noir-100)', background: 'var(--noir-10)' }}>
                                <FiFileText />
                            </div>
                            <div className="stat-info">
                                <div className="stat-value">{summary?.totalOrders}</div>
                                <div className="stat-label">Total Orders</div>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="dashboard-grid-2" style={{ marginTop: '2rem' }}>
                        <div className="dashboard-card">
                            <h3>Order Status</h3>
                            <div className="quick-stats-row">
                                <div className="quick-stat">
                                    <span className="label">Paid Orders</span>
                                    <span className="value success">{summary?.paidCount}</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="label">Pending</span>
                                    <span className="value warning">{summary?.pendingCount}</span>
                                </div>
                                <div className="quick-stat">
                                    <span className="label">Cancelled</span>
                                    <span className="value error">{summary?.cancelledCount}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Daily Sales Table */}
                    <div className="orders-table-container" style={{ marginTop: '2rem', overflowX: 'auto' }}>
                        <div className="table-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--noir-10)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Daily Sales Breakdown</h3>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Orders Count</th>
                                    <th style={{ textAlign: 'right' }}>Sales Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {daily && daily.length > 0 ? (
                                    daily.map((day) => (
                                        <tr key={day._id}>
                                            <td>{new Date(day._id).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                            <td>{day.orders}</td>
                                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(day.sales)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>No sales data for this month</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </AdminLayout>
    )
}

export default Reports
