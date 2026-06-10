import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    outDir: 'build',
    // Revert to esbuild for faster and more stable builds while maintaining production quality
    minify: 'esbuild',
    // Remove console logs and debuggers from production build
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // More robust chunking strategy to prevent "Object.defineProperty" errors
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['react-icons', 'emoji-picker-react', 'react-hot-toast'],
          'vendor-utils': ['axios', 'moment']
        }
      }
    },
    // Enable source maps only if needed
    sourcemap: false,
    // Optimize CSS handling
    cssCodeSplit: true,
    cssMinify: true,
    assetsInlineLimit: 4096 // 4kb
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: []
  },
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'FinRace',
        short_name: 'FinRace',
        description: 'Track your income and expenses with AI-powered insights.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Optimize caching and performance
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        runtimeCaching: [
          {
            // API calls - Network first with cache fallback
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400 // 1 day
              },
              // API call caching - removing status 0 to prevent caching failed/opaque requests
              cacheableResponse: {
                statuses: [200]
              },
              networkTimeoutSeconds: 10
            }
          },
          {
            // Static assets - Cache first
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            // Fonts - Cache first
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
              }
            }
          },
          {
            // CSS and JS - Stale while revalidate
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
              }
            }
          }
        ],
        // Skip waiting and claim clients immediately
        skipWaiting: true,
        clientsClaim: true
      }
    })
  ],
  // Server configuration for development
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    open: false
  }
})
