import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ProductProvider } from './context/ProductContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import './styles/index.css'
import './styles/design-system.css'
import './styles/coupon.css'
import './styles/features.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

async function bootstrap() {
  if (import.meta.env.VITE_MSW === 'true') {
    const { worker } = await import('./mocks/browser.js')
    await worker.start({ onUnhandledRequest: 'bypass', quiet: true })
  }
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <ProductProvider>
                <WishlistProvider>
                  <App />
                </WishlistProvider>
              </ProductProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  )
}

bootstrap().catch(err => {
  console.error('Fatal startup error:', err);
  document.getElementById('root').innerHTML = `
    <div style="padding:20px;color:red;font-family:monospace">
      <h1>App failed to start</h1>
      <pre>${err?.message || err}</pre>
    </div>`;
});
