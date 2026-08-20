import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // El certificado solo se necesita al abrir el servidor local.
  // Evita que la compilacion de Vercel intente instalar certificados.
  plugins: [react(), ...(command === 'serve' ? [mkcert()] : [])],
  server: {
    https: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        secure: false, // Ignorar error de certificado self-signed del backend
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        secure: false
      }
    }
  }
}))
