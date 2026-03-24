import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false
      },
      includeAssets: ['logo192x192.png', 'logo512x512.png', 'logo32x32.png', 'robots.txt', 'sitemap.xml', 'icons.svg'],
      manifest: {
        name: 'BusPronto',
        short_name: 'BusPronto',
        description: 'BusPronto le ayuda a encontrar el próximo bus UCR en tiempo real.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
