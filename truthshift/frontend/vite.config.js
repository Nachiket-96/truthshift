import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// Dev server: https (local certificate) so phones on the same Wi-Fi can use the camera scanner,
// and /api calls are forwarded to the FastAPI backend on port 8000.
// `npm run build:pages` builds the online demo for https://nachiket-96.github.io/truthshift/.
export default defineConfig(({ command, mode }) => ({
  base: mode === 'pages' ? '/truthshift/' : '/',
  plugins: [react(), ...(command === 'serve' ? [basicSsl()] : [])],
  server: {
    host: true,
    port: 5173,
    proxy: { '/api': 'http://localhost:8000' },
  },
}))
