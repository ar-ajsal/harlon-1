import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function AdminLogin() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()

    // Redirect if already logged in
    if (isAuthenticated) {
        navigate('/admin/dashboard', { replace: true })
        return null
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await login(password)
            if (result.success) {
                navigate('/admin/dashboard')
            } else {
                setError(result.error || 'Invalid password. Please try again.')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="admin-login">
            <div className="login-card">
                <h1 className="login-title">Admin Login</h1>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '30px'
                }}>
                    <img src="/images/logo.png" alt="Harlon" style={{ height: '60px', marginBottom: '15px' }} />
                    <h2 style={{ color: 'var(--text-secondary)' }}>Harlon Dashboard</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            color: 'var(--error-color)',
                            fontSize: '0.9rem',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    marginTop: '30px'
                }}>
                    Default password: admin123
                </p>
            </div>
        </div>
    )
}

export default AdminLogin
