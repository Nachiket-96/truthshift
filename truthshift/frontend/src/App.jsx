import { useEffect, useState } from 'react'
import { api } from './api'
import { LANGS, t } from './i18n'
import Priorities from './components/Priorities'
import ScanSearch from './components/ScanSearch'
import Compare from './components/Compare'
import Ask from './components/Ask'
import Nearby from './components/Nearby'

const TABS = [
  ['priorities', '⚖️', 'tab_priorities'],
  ['scan', '📷', 'tab_scan'],
  ['compare', '📊', 'tab_compare'],
  ['ask', '💬', 'tab_ask'],
  ['map', '📍', 'tab_map'],
]

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* private mode */ } }

export default function App() {
  const [meta, setMeta] = useState(null)
  const [stores, setStores] = useState([])
  const [weights, setWeights] = useState(() => load('weights', null))
  const [lang, setLang] = useState(() => load('lang', 'en'))
  const [tab, setTab] = useState('priorities')
  const [scored, setScored] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [mapProduct, setMapProduct] = useState(null)
  const [refresh, setRefresh] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([api.meta(), api.stores()])
      .then(([m, s]) => { setMeta(m); setStores(s); setWeights(w => w ?? m.defaultWeights) })
      .catch(() => setError('backend'))
  }, [])

  // Re-score everything when priorities change (debounced so sliders stay smooth).
  useEffect(() => {
    if (!weights) return
    save('weights', weights)
    const id = setTimeout(() => api.score(weights).then(setScored).catch(() => setError('backend')), 120)
    return () => clearTimeout(id)
  }, [weights, refresh])

  useEffect(() => { save('lang', lang); document.documentElement.lang = lang }, [lang])

  const openProduct = id => { setSelectedId(id); setTab('scan') }
  const showOnMap = product => { setMapProduct(product); setTab('map') }

  return (
    <>
      <header className="topbar">
        <div className="brand">🧭 {t(lang, 'title')}</div>
        <select id="lang" aria-label="Language" value={lang} onChange={e => setLang(e.target.value)}>
          {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </header>

      <nav className="tabs">
        {TABS.map(([key, icon, label]) => (
          <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>
            <span className="tab-icon" aria-hidden="true">{icon}</span> <span className="tab-label tab-long">{t(lang, label)}</span><span className="tab-label tab-short">{t(lang, label.replace("tab_", "short_"))}</span>
          </button>
        ))}
      </nav>

      <main>
        {error && <div className="banner">{t(lang, 'backend_down')}</div>}
        {meta && weights && (
          <>
            {tab === 'priorities' && <Priorities lang={lang} meta={meta} weights={weights} setWeights={setWeights} />}
            {tab === 'scan' && (
              <ScanSearch lang={lang} meta={meta} weights={weights} scored={scored} selectedId={selectedId}
                          onOpen={setSelectedId} onShowMap={showOnMap} onNewProduct={() => setRefresh(n => n + 1)} />
            )}
            {tab === 'compare' && <Compare lang={lang} meta={meta} scored={scored} onOpen={openProduct} />}
            {tab === 'ask' && <Ask lang={lang} meta={meta} weights={weights} onOpen={openProduct} />}
            {tab === 'map' && (
              <Nearby lang={lang} stores={stores} scored={scored} product={mapProduct} clearProduct={() => setMapProduct(null)} onOpen={openProduct} />
            )}
          </>
        )}
      </main>

      <footer className="muted small">
        Prototype for the RODS Tech Skills Showcase 2026. Products marked "Demo data" are fictional; products marked
        "Real · Open Food Facts" come from a community database. Unknown ≠ unethical.
      </footer>
    </>
  )
}
