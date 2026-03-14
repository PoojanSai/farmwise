import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,            // allows external access
        port: 5173,
        allowedHosts: true,   // allow ngrok domains
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            }
        }
    }
}
)
