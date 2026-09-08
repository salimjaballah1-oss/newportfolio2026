import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function proxyErrorHandler(proxy) {
  proxy.on('error', (err, req, res) => {
    console.error('[proxy error]', err.message, req.method, req.url)
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Proxy error', message: err.message }))
    }
  })
}

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/s3-upload': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3-upload/, ''),
        configure: proxyErrorHandler
      },
      '/api-dev': {
        target: 'https://api-dev.chazal.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-dev/, '/api'),
        configure: proxyErrorHandler
      },
      '/api': {
        target: 'https://api.chazal.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        cookieDomainRewrite: 'localhost',
        configure: proxyErrorHandler
      }
    }
  }
})
