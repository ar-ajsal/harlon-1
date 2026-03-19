import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.+\.(js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'harlon-assets-v3',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/products') ||
              url.pathname.startsWith('/api/categories'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'harlon-api-v1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 2,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /res\.cloudinary\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'harlon-images-v1',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
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
    // Keep all node_modules in one vendor chunk.
    // Splitting react, recharts, framer-motion into separate chunks caused a
    // load-order bug: those libs ran before React was initialized, resulting in
    // "Cannot read properties of undefined (reading 'useLayoutEffect')" → blank
    // white page on production.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
    sourcemap: false,
    minify: 'esbuild',
  },

  optimizeDeps: {
    include: ['react-instantsearch', 'algoliasearch/lite'],
    force: true // Force dependency optimization to clear corrupted cache
  },

  server: {
    port: 5173,
    host: true,
    open: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
