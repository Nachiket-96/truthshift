import { useState } from 'react'
import { t } from '../i18n'
import { ICON, money, scoreClass } from './ui'

export default function Compare({ lang, meta, scored, onOpen }) {
  const [category, setCategory] = useState(meta.categories[0])
  const keys = Object.keys(meta.factors)
  const rows = scored
    .filter(x => x.product.category === category)
    // Well-documented products first; "Limited data" products last so a few known facts can't top the list.
    .sort((a, b) => (a.result.limitedData - b.result.limitedData) || ((b.result.score ?? -1) - (a.result.score ?? -1)))

  return (
    <section>
      <div className="row">
        <label htmlFor="compareCat">{t(lang, 'category')}</label>
        <select id="compareCat" value={category} onChange={e => setCategory(e.target.value)}>
          {meta.categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th><th>Your score</th><th>Confidence</th><th>Price</th>
              {keys.map(k => <th key={k} title={meta.factors[k].label}>{meta.factors[k].icon}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product: p, result: r }) => (
              <tr key={p.id}>
                <td><button className="link" onClick={() => onOpen(p.id)}>{p.emoji} {p.name}</button></td>
                <td><b>{r.score ?? '?'}</b>{r.limitedData && <div className="chip">Limited data</div>}</td>
                <td>{r.confidenceLabel}</td>
                <td>{money(p.price)}</td>
                {r.breakdown.map(b => (
                  <td key={b.key} className={`c-${b.status === 'na' ? 'na' : scoreClass(b.score)}`} title={b.note}>
                    {ICON[b.status] || '?'} {b.score ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted small">Sorted by <b>your</b> personal score; products with limited data are listed last. Cell icons: ✔ verified · ⚠ claimed · ? unknown · — not applicable. Hover a cell for the evidence.</p>
    </section>
  )
}
