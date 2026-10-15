import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// /api calls are forwarded to the FastAPI backend on port 8000.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: { '/api': 'http://localhost:8000' },
  },
})
