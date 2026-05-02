import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'BuyGoods Monitor',
        short_name: 'BuyGoods',
        description: 'Monitor suas vendas na BuyGoods em tempo real',
        theme_color: '#0f0f1a',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
  server: {
    host: true,
    proxy: {
      '/api/buygoods': {
        target: 'https://api.buygoods.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/buygoods/, '/affiliates/api/v1'),
      },
      '/api/clickcrm': {
        target: 'https://api.clickcrm.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/clickcrm/, '/affiliates/v1'),
      }
    }
  }
})
