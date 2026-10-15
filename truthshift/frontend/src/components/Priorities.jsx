import { t } from '../i18n'
import { Badge } from './ui'

const PRESETS = {
  '🍁 Buy Canadian': { canadian: 5, local: 4, fairTrade: 1, animal: 1, environment: 1, packaging: 1, price: 2 },
  '💲 Tight budget': { canadian: 2, local: 1, fairTrade: 1, animal: 1, environment: 1, packaging: 1, price: 5 },
  '🌱 Low waste & green': { canadian: 1, local: 2, fairTrade: 2, animal: 2, environment: 5, packaging: 5, price: 2 },
  '🤝 Fair labour': { canadian: 1, local: 1, fairTrade: 5, animal: 3, environment: 2, packaging: 1, price: 2 },
}

export default function Priorities({ lang, meta, weights, setWeights }) {
  const c = meta.counts
  return (
    <section>
      <h2>{t(lang, 'prio_h')}</h2>
      <p className="muted">{t(lang, 'prio_p')}</p>
      <div className="stats">
        <span>{c.products} products</span>
        <span>{c.synthetic} demo · {c.openfoodfacts} real (Open Food Facts)</span>
        <span>{c.categories} categories</span>
        <span>{c.stores} Regina stores</span>
      </div>

      <div className="sliders">
        {Object.entries(meta.factors).map(([key, f]) => (
          <div className="slider" key={key}>
            <label htmlFor={`w-${key}`}>{f.icon} {f.label}</label>
            <input id={`w-${key}`} type="range" min="0" max="5" step="1" value={weights[key] ?? 0}
                   onChange={e => setWeights({ ...weights, [key]: Number(e.target.value) })} />
            <b>{weights[key] ?? 0}</b>
          </div>
        ))}
      </div>

      <div className="presets">
        <span className="muted">{t(lang, 'presets')}</span>
        {Object.entries(PRESETS).map(([name, w]) => <button key={name} onClick={() => setWeights(w)}>{name}</button>)}
        <button onClick={() => setWeights(meta.defaultWeights)}>↺ Default</button>
      </div>

      <div className="legend card">
        <h3>{t(lang, 'legend_h')}</h3>
        <p><Badge status="verified" /> confirmed by a certifier, government or registry.</p>
        <p><Badge status="claimed" /> stated by the business or a community database, not independently confirmed. Counts for less.</p>
        <p><Badge status="unknown" /> we couldn't find it. <b>Not counted against the product</b>; it lowers our <i>confidence</i> instead.</p>
        <p><Badge status="na" /> doesn't apply (for example, animal welfare for pasta).</p>
        <p><span className="chip">Limited data</span> fewer than 40% of the facts you care about are known, so treat the score with caution.</p>
      </div>
    </section>
  )
}
