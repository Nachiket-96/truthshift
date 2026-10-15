import { useEffect, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { t } from '../i18n'

const AREAS = {
  Downtown: [50.4452, -104.6189],
  'Harbour Landing': [50.416, -104.68],
  'North Central / Rochdale': [50.495, -104.64],
  'East (Victoria Ave)': [50.445, -104.55],
  'Whitmore Park / University': [50.406, -104.598],
  Normanview: [50.46, -104.66],
}

function distKm(a, b) {
  const R = 6371, rad = d => (d * Math.PI) / 180
  const dLat = rad(b[0] - a[0]), dLng = rad(b[1] - a[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function FitTo({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 14 })
    else if (points.length === 1) map.setView(points[0], 13)
  }, [map, JSON.stringify(points)])
  return null
}

export default function Nearby({ lang, stores, scored, product, clearProduct, onOpen }) {
  const [area, setArea] = useState('Downtown')
  const [userPos, setUserPos] = useState(null)
  const [info, setInfo] = useState('')
  const from = userPos || AREAS[area]

  const visible = stores.filter(s => !product || product.stores.includes(s.id))
  const list = visible.map(s => ({ s, d: distKm(from, [s.lat, s.lng]) })).sort((a, b) => a.d - b.d)

  function locate() {
    if (!navigator.geolocation) return setInfo('Location isn\'t available here. Pick your area instead.')
    navigator.geolocation.getCurrentPosition(
      pos => { setUserPos([pos.coords.latitude, pos.coords.longitude]); setInfo('Distances from you.') },
      () => setInfo('Location isn\'t available. Pick your area instead.'))
  }

  const topPicks = storeId => scored
    .filter(x => x.product.stores.includes(storeId) && x.result.score != null)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 3)

  return (
    <section>
      <div className="row">
        <button onClick={locate}>📍 {t(lang, 'use_loc')}</button>
        <label htmlFor="area" className="muted">{t(lang, 'pick_area')}</label>
        <select id="area" value={area} onChange={e => { setArea(e.target.value); setUserPos(null); setInfo('') }}>
          {Object.keys(AREAS).map(a => <option key={a}>{a}</option>)}
        </select>
        {product && <span className="chip real">Showing stores for: {product.name} <button className="link" onClick={clearProduct}>show all</button></span>}
        {info && <span className="muted small">{info}</span>}
      </div>

      <MapContainer id="map" center={AREAS.Downtown} zoom={12} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
        <FitTo points={product ? visible.map(s => [s.lat, s.lng]) : [from]} />
        <CircleMarker center={from} radius={8} pathOptions={{ color: '#b7791f', fillOpacity: 0.8 }}>
          <Popup>{userPos ? 'You are here' : area}</Popup>
        </CircleMarker>
        {visible.map(s => (
          <CircleMarker key={s.id} center={[s.lat, s.lng]} radius={9} pathOptions={{ color: '#1f7a4d', fillOpacity: 0.7 }}>
            <Popup><b>{s.name}</b><br />{s.owner}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div>
        {list.map(({ s, d }) => (
          <div className="store" key={s.id}>
            <b>{s.name}</b> <span className="muted">· {d.toFixed(1)} km · {s.owner}</span>
            <div className="small muted">
              Top picks for you here:{' '}
              {topPicks(s.id).map((x, i) => (
                <span key={x.product.id}>{i > 0 && ', '}
                  <button className="link" onClick={() => onOpen(x.product.id)}>{x.product.emoji} {x.product.name}</button> ({x.result.score})
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="muted small">Store locations are approximate (demo).</p>
    </section>
  )
}
