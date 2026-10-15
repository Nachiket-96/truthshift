import { useState } from 'react'
import { api } from '../api'
import { t } from '../i18n'
import { money } from './ui'

const EXAMPLES = [
  'I want to buy Canadian, avoid plastic, and support fair labour. Which coffee?',
  'Cheapest eggs with good animal welfare',
  'Chocolate under $5 with fair trade',
  'Support Regina businesses. Which tea?',
  'Which rice should I buy if I care about the environment?',
]

export default function Ask({ lang, meta, weights, onOpen }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  async function ask(text) {
    const qText = (text ?? question).trim()
    if (!qText) return
    setQuestion(qText)
    setBusy(true); setError(null)
    try { setAnswer(await api.ask(qText, weights, lang)) } catch (e) { setError(e.message) } finally { setBusy(false) }
  }

  const u = answer?.understood
  return (
    <section>
      <h2>{t(lang, 'ask_h')}</h2>
      <p className="muted">{t(lang, 'ask_p')}</p>
      <div className="examples">
        {EXAMPLES.map(ex => <button key={ex} className="ex" onClick={() => ask(ex)}>{ex}</button>)}
      </div>
      <form className="scanbar" onSubmit={e => { e.preventDefault(); ask() }}>
        <input id="askInput" value={question} onChange={e => setQuestion(e.target.value)}
               placeholder="e.g. Canadian peanut butter without plastic under $6" />
        <button className="primary" type="submit" disabled={busy}>{busy ? 'Thinking…' : t(lang, 'ask_btn')}</button>
      </form>
      {error && <div className="banner">{error}</div>}

      {answer && (
        <>
          {answer.ai.status === 'ok' && (
            <div className="card ai" style={{ marginBottom: 10 }}>
              <div className="tag">Claude's answer</div>
              <div className="ai-text">{answer.ai.text}</div>
            </div>
          )}
          {answer.ai.status === 'error' && <p className="muted small">{answer.ai.text}</p>}
          {answer.ai.status === 'static' && (
            <p className="muted small">This online demo ranks products with our scoring engine. AI-written answers run in the full app with the backend.</p>
          )}
          {answer.ai.status === 'no_credentials' && (
            <p className="muted small">AI answers are off: set ANTHROPIC_API_KEY before starting the backend to turn them on. The ranking below works without it.</p>
          )}

          <div className="card answer">
            <div className="small muted">Quick ranking from our scoring engine</div>
            <p>
              {u.usingProfile
                ? <>I used <b>your saved priorities</b>.</>
                : <>I focused on: <b>{u.detected.map(k => `${meta.factors[k].icon} ${meta.factors[k].label}`).join(', ')}</b>.</>}
              {u.category && <> Category: <b>{u.category}</b>.</>}
              {u.budget != null && <> Budget: <b>≤ ${u.budget}</b>.</>}
            </p>
            {answer.results.length ? (
              <ol>
                {answer.results.map(({ product: p, result: r }) => (
                  <li key={p.id}>
                    <button className="link" onClick={() => onOpen(p.id)}><b>{p.emoji} {p.name}</b></button>
                    {' '}— {money(p.price)}, fit <b>{r.score}/100</b>, {r.confidenceLabel.toLowerCase()} confidence
                    <div className="small muted">{r.summary}</div>
                  </li>
                ))}
              </ol>
            ) : <p>No product in our dataset matches those filters. Try a higher budget or another category.</p>}
            <p className="small muted">Ranking favours products we have more verified information about. Unknown information is never counted as bad.</p>
          </div>
        </>
      )}
    </section>
  )
}
