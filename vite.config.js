import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

// Archivos de uso exclusivo del panel admin: sus cambios no deben pedir
// actualización a los usuarios del flujo principal.
const ADMIN_ONLY = [
  'src/components/admin',
  'src/pages/AdminLogin.jsx',
  'src/pages/Admin.module.css',
  'src/hooks/usePermissions.js',
  'src/services/users.service.js',
  'src/services/schedules.service.js',
  'src/public-version.js',
]

function hashPublicSources() {
  const hash = crypto.createHash('sha256')
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const full = path.join(dir, entry.name)
      const rel = full.split(path.sep).join('/')
      if (ADMIN_ONLY.some((p) => rel.startsWith(p))) continue
      if (entry.isDirectory()) walk(full)
      else {
        hash.update(rel)
        hash.update(fs.readFileSync(full))
      }
    }
  }
  walk('src')
  return hash.digest('hex').slice(0, 12)
}

function publicVersionPlugin() {
  return {
    name: 'public-version',
    configResolved(config) {
      const version = config.command === 'build' ? hashPublicSources() : 'dev'
      fs.writeFileSync(
        path.resolve('src/public-version.js'),
        `export const PUBLIC_VERSION = '${version}';\n`
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    publicVersionPlugin(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['logo192x192.png', 'logo512x512.png', 'logo32x32.png', 'bus-logo.svg', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'BusPronto',
        short_name: 'BusPronto',
        description: 'BusPronto le ayuda a encontrar el próximo bus UCR en tiempo real.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/bus-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
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
