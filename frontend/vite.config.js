import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      // Force immediate SW activation — prevents old SW from serving stale chunks
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        // Use NetworkFirst for JS/CSS so new deploys are never blocked by cached chunks
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.+\.(js|css)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'harlon-assets-v2',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Harlon',
        short_name: 'Harlon',
        description: 'Retro Football Jerseys',
        theme_color: '#ffffff',
        display: 'standalone',
        background_color: '#ffffff',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],

  build: {
    target: 'es2020',
    cssCodeSplit: true,
    // Raise limit so we see accurate warnings without noise
    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // NOTE: React must NOT be split into its own chunk — it causes a
          // "cannot read createContext of undefined" crash because the router
          // chunk loads before react-core initialises. React stays in vendor.

          // ── Router ──
          if (id.includes('react-router-dom') || id.includes('@remix-run')) {
            return 'router'
          }
          // ── Framer Motion — customer pages only (not admin) ──
          if (id.includes('framer-motion')) {
            return 'motion'
          }
          // ── Recharts + D3 — Admin Dashboard ONLY ──
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
            return 'charts'
          }
          // ── DnD Kit — Admin Products ONLY ──
          if (id.includes('@dnd-kit')) {
            return 'dnd'
          }
          // ── React Icons ──
          if (id.includes('react-icons')) {
            return 'icons'
          }
          // ── Image tools — Admin only ──
          if (id.includes('react-image-crop')) {
            return 'image-tools'
          }
          // ── Everything else in node_modules ──
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },

  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
