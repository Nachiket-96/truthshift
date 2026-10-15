import { useEffect, useState } from 'react'
import { api } from '../api'
import { t } from '../i18n'
import { Badge, ConfidenceBar, ScorePill, SourceChip, money, scoreClass } from './ui'

export default function ProductDetail({ lang, meta, id, weights, onOpen, onShowMap }) {
  const [d, setD] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let live = true
    api.product(id, weights).then(x => live && (setD(x), setError(null))).catch(e => live && setError(e.message))
    return () => { live = false }
  }, [id, weights])

  if (error) return <div className="banner">{error}</div>
  if (!d) return <p className="muted">Loading…</p>

  const { product: p, result: r, alternatives, stores } = d
  const tier = meta.originTiers[p.originTier] || meta.originTiers.unknown

  return (
    <div className="card">
      <div className="detail-head">
        <ScorePill result={r} big />
        <div style={{ flex: 1, minWidth: 220 }}>
          <h2>{p.emoji} {p.name}</h2>
          <div className="muted">{p.brand} · {p.size} · {money(p.price)} · barcode {p.barcode}</div>
          <div style={{ marginTop: 6 }}>{t(lang, 'owner')}: <b>{p.owner.name}</b> <Badge status={p.owner.status} /> <SourceChip product={p} /></div>
          <div style={{ marginTop: 8 }}><ConfidenceBar result={r} /></div>
        </div>
      </div>

      <div className="summary">{r.summary || 'Set some priorities to see a personal score.'}</div>
      <p><span className={`tier ${tier.tone}`}>🍁 {tier.label}</span> <span className="small muted">{tier.explain}</span></p>

      <h3 style={{ marginTop: 14 }}>{t(lang, 'why')}</h3>
      {r.breakdown.map(b => {
        const f = meta.factors[b.key]
        return (
          <div className="factor" key={b.key}>
            <div><b>{f.icon} {f.label}</b><div className="small muted">your weight: {b.weight}/5</div></div>
            <div>
              <Badge status={b.status} />{b.score != null && <> <b>{b.score}</b></>}
              {b.score != null && b.status !== 'na' && (
                <div className="bar"><div className={scoreClass(b.score)} style={{ width: `${b.score}%` }} /></div>
              )}
            </div>
            <div>{b.note}{b.source && <div className="src">Source: {b.source}</div>}</div>
          </div>
        )
      })}

      <p style={{ marginTop: 12 }}>♻️ <b>{t(lang, 'in_regina')}:</b> {p.recycling}</p>
      {p.sourceUrl && <p className="small"><a href={p.sourceUrl} target="_blank" rel="noreferrer">View this product on Open Food Facts</a></p>}
      {stores.length > 0 && (
        <p>📍 <b>{t(lang, 'available')}:</b> {stores.map(s => s.name).join(' · ')}{' '}
          <button className="small" onClick={() => onShowMap(p)}>{t(lang, 'show_map')}</button></p>
      )}

      <h3 style={{ marginTop: 14 }}>{alternatives.length ? t(lang, 'better') : t(lang, 'best')}</h3>
      <div className="alts">
        {alternatives.map(a => (
          <div className="alt" key={a.product.id} role="button" tabIndex={0} onClick={() => onOpen(a.product.id)}
               onKeyDown={e => e.key === 'Enter' && onOpen(a.product.id)}>
            <ScorePill result={a.result} />
            <div>
              <b>{a.product.name}</b>
              <div className="small muted">
                {money(a.product.price)}
                {p.price != null && a.product.price != null &&
                  ` (${a.product.price >= p.price ? '+' : '−'}$${Math.abs(a.product.price - p.price).toFixed(2)})`}
                {' · '}{a.result.confidenceLabel} confidence
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
