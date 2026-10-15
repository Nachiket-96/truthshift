// All calls to the FastAPI backend. In development Vite forwards /api to http://localhost:8000.
// The online demo (GitHub Pages, built with VITE_STATIC=1) has no backend and uses localApi instead.
import { localApi } from './localApi'

async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `Request failed (${res.status})`)
  }
  return res.json()
}

const serverApi = {
  meta: () => request('/api/meta'),
  stores: () => request('/api/stores'),
  score: (weights, filters = {}) => request('/api/score', { method: 'POST', body: { weights, ...filters } }),
  product: (id, weights) => request(`/api/products/${encodeURIComponent(id)}`, { method: 'POST', body: { weights } }),
  barcode: code => request(`/api/barcode/${encodeURIComponent(code)}`),
  ask: (question, weights, lang) => request('/api/ask', { method: 'POST', body: { question, weights, lang } }),
}

export const IS_STATIC = import.meta.env.VITE_STATIC === '1'
export const api = IS_STATIC ? localApi : serverApi
