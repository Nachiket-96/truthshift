import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https (with a local certificate) so phones on the same Wi-Fi can use the camera scanner.
// /api calls are forwarded to the FastAPI backend on port 8000.
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    port: 5173,
    proxy: { '/api': 'http://localhost:8000' },
  },
})
