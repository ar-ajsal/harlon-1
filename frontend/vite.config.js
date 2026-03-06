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
        // ✅ PERF: Cache API responses for product listing (stale-while-revalidate)
        runtimeCaching: [
          {
            // JS/CSS chunks — immutable (content-hashed filenames)
            urlPattern: /\/assets\/.+\.(js|css)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'harlon-assets-v3',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            // ✅ PERF: Public API — products, categories (stale-while-revalidate)
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api/products') ||
              url.pathname.startsWith('/api/categories'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'harlon-api-v1',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 2, // 2 hours
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // ✅ PERF: Cloudinary images — cache for 7 days
            urlPattern: /res\.cloudinary\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'harlon-images-v1',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
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
    // ✅ PERF: Manual chunk splitting — keeps vendor libs separate so a single
    //    component change doesn't bust every user's cache.
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Recharts is large (~500KB) — isolate to its own chunk
          if (id.includes('recharts') || id.includes('d3-')) {
            return 'recharts';
          }
          // Framer Motion — heavy animation lib, only used on some pages
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }
          // React core — never changes, long-term cacheable
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // React Router
          if (id.includes('react-router')) {
            return 'router';
          }
          // Icons — large but static
          if (id.includes('react-icons')) {
            return 'icons';
          }
          // Everything else in node_modules → 'vendor'
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600,
    // ✅ PERF: Enable source maps for production debugging without exposing source
    sourcemap: false,
    // ✅ PERF: Minify with esbuild (default, fastest)
    minify: 'esbuild',
  },

  server: {
    port: 5173,
    host: true,
    open: false, // don't auto-open every hot-reload
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
