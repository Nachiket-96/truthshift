import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { api } from '../api'
import { t } from '../i18n'
import { ProductCard } from './ui'
import ProductDetail from './ProductDetail'

export default function ScanSearch({ lang, meta, weights, scored, selectedId, onOpen, onShowMap, onNewProduct }) {
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')
  const [scanning, setScanning] = useState(false)
  const scanner = useRef(null)
  const detailRef = useRef(null)

  const query = q.trim().toLowerCase()
  const list = scored.filter(({ product: p }) =>
    !query || [p.name, p.brand, p.category, p.barcode].some(s => (s || '').toLowerCase().includes(query)))

  async function handleBarcode(code) {
    await stopScan()
    setMsg(`Looking up ${code}…`)
    try {
      const { product, from } = await api.barcode(code)
      setMsg(from === 'openfoodfacts-live'
        ? 'Loaded live from Open Food Facts (community data, shown as "claimed").'
        : `Found ${code} in our dataset.`)
      onNewProduct()
      open(product.id)
    } catch (e) {
      setMsg(e.message)
    }
  }

  function open(id) {
    onOpen(id)
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  async function startScan() {
    if (scanning) return stopScan()
    setScanning(true)
    setMsg('Point the camera at a barcode…')
    await new Promise(r => setTimeout(r, 0)) // let the #reader element render
    try {
      scanner.current = new Html5Qrcode('reader')
      await scanner.current.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 140 } },
        text => handleBarcode(text.trim()))
    } catch {
      setMsg('Camera not available (phones need https or localhost). Type the barcode or upload a photo instead.')
      await stopScan()
    }
  }

  async function stopScan() {
    const s = scanner.current
    scanner.current = null
    setScanning(false)
    if (s) { try { await s.stop() } catch { /* not running */ } try { s.clear() } catch { /* already cleared */ } }
  }

  async function scanPhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setMsg('Reading barcode from photo…')
    try {
      const code = await new Html5Qrcode('photo-reader').scanFile(file, false)
      handleBarcode(code.trim())
    } catch {
      setMsg('Couldn\'t read a barcode in that photo. Try a closer, sharper photo, or type the number.')
    }
  }

  useEffect(() => () => { stopScan() }, [])

  return (
    <section>
      <form className="scanbar" onSubmit={e => { e.preventDefault(); if (/^\d{8,14}$/.test(q.trim())) handleBarcode(q.trim()) }}>
        <input id="search" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t(lang, 'search_ph')} />
        <button type="button" className="primary" onClick={startScan}>📷 {t(lang, scanning ? 'stop_scan' : 'scan_btn')}</button>
      </form>
      <label className="upload muted" htmlFor="scanFile">{t(lang, 'upload')} <input id="scanFile" type="file" accept="image/*" onChange={scanPhoto} /></label>
      {scanning && <div id="reader" />}
      <div id="photo-reader" hidden />
      {msg && <p className="muted">{msg}</p>}

      <div className="grid">
        {list.map(item => <ProductCard key={item.product.id} item={item} onOpen={open} />)}
      </div>
      {!list.length && <p className="muted">No match. Type a full barcode and press Enter to look it up on Open Food Facts.</p>}

      <div ref={detailRef} style={{ marginTop: 16 }}>
        {selectedId && <ProductDetail lang={lang} meta={meta} id={selectedId} weights={weights} onOpen={open} onShowMap={onShowMap} />}
      </div>
    </section>
  )
}
