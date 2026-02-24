import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
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
          // ── Core React (tiny, always cached) ──
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core'
          }
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
