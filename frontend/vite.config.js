import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        secure: false, // Ignorar error de certificado self-signed del backend
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        secure: false
      }
    }
  }
})
