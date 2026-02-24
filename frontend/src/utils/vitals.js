/**
 * Web Vitals RUM — sends Core Web Vitals to /api/vitals for production monitoring
 * Install: npm install web-vitals
 */

function sendToAnalytics({ name, value, id, navigationType }) {
    if (import.meta.env.DEV) {
        console.log(`[Vitals] ${name}: ${Math.round(value)}${name === 'CLS' ? '' : 'ms'}`)
        return
    }

    // Send to our own backend — free, no 3rd party needed
    const baseUrl = import.meta.env.VITE_API_URL || '/api'
    fetch(`${baseUrl}/vitals`, {
        method: 'POST',
        body: JSON.stringify({
            name,
            value: Math.round(value),
            id,
            navigationType,
            url: location.pathname,
            ua: navigator.userAgent,
        }),
        headers: { 'Content-Type': 'application/json' },
        // Never let vitals reporting block or error the app
        keepalive: true,
    }).catch(() => { })
}

export function reportWebVitals() {
    // Dynamic import so web-vitals doesn't block initial load
    import('web-vitals').then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
        onCLS(sendToAnalytics)
        onINP(sendToAnalytics)
        onLCP(sendToAnalytics)
        onFCP(sendToAnalytics)
        onTTFB(sendToAnalytics)
    }).catch(() => {
        // web-vitals not installed yet — silent fail
    })
}
