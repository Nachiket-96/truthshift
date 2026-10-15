// Small shared pieces: score pill, evidence badges, confidence bar, product card.

export const BADGE_TEXT = { verified: '✔ Verified', claimed: '⚠ Claimed', unknown: '? Unknown', na: '— N/A' }
export const ICON = { verified: '✔', claimed: '⚠', unknown: '?', na: '—' }

export const scoreClass = s => (s == null ? 'unknown' : s >= 70 ? 'good' : s >= 45 ? 'mid' : 'low')
export const money = v => (v == null ? 'price n/a' : `$${v.toFixed(2)}`)

export function Badge({ status }) {
  return <span className={`badge ${status}`}>{BADGE_TEXT[status] || BADGE_TEXT.unknown}</span>
}

export function ScorePill({ result, big = false }) {
  const cls = scoreClass(result.score)
  return (
    <div className={`pill ${cls} ${big ? 'big' : ''} ${result.limitedData ? 'limited' : ''}`}
         title={result.limitedData ? 'Limited data: most facts are unknown' : undefined}>
      {result.score ?? '?'}<small>/100</small>
    </div>
  )
}

export function ConfidenceBar({ result }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span className="small">Confidence: <b>{result.confidenceLabel}</b></span>
      <div className="conf"><div style={{ width: `${Math.round(result.confidence * 100)}%` }} /></div>
      {result.limitedData && <span className="chip">Limited data</span>}
    </div>
  )
}

export function SourceChip({ product }) {
  return product.source === 'synthetic'
    ? <span className="chip" title="Fictional demo product">Demo data</span>
    : <span className="chip real" title="Real product from Open Food Facts">Real · Open Food Facts</span>
}

export function ProductCard({ item, onOpen }) {
  const { product: p, result: r } = item
  return (
    <div className="pcard" role="button" tabIndex={0} onClick={() => onOpen(p.id)}
         onKeyDown={e => e.key === 'Enter' && onOpen(p.id)}>
      <div className="emoji">{p.emoji}</div>
      <div className="meta">
        <div className="name">{p.name}</div>
        <div className="sub">{p.category} · {money(p.price)} · {r.confidenceLabel} confidence</div>
        <div style={{ marginTop: 4 }}><SourceChip product={p} /></div>
      </div>
      <ScorePill result={r} />
    </div>
  )
}
