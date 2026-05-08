
// frontend/vite.config.js
import { defineConfig }    from 'vite';
import react               from '@vitejs/plugin-react';
import tailwindcss         from '@tailwindcss/vite';   // ← NEW
import { VitePWA }         from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),    // ← ADD before react
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name:             'Community Waste Management Tracker',
        short_name:       'WasteTracker',
        description:      'Report garbage issues and track waste collection',
        theme_color:      '#166534',
        background_color: '#f0fdf4',
        display:          'standalone',
        orientation:      'portrait',
        scope:            '/',
        start_url:        '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/localhost:5000\/api\/.*/i,
            handler:    'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true, type: 'module' },
    }),
  ],
  optimizeDeps: {
    include: ['recharts', 'react-is'],
  },
});