// Copies the backend dataset into public/data for the online demo build.
import { cpSync, mkdirSync } from 'node:fs'

const from = new URL('../../backend/data/', import.meta.url)
const to = new URL('../public/data/', import.meta.url)
mkdirSync(to, { recursive: true })
for (const f of ['reference.json', 'stores.json', 'products_synthetic.json', 'products_off.json']) cpSync(new URL(f, from), new URL(f, to))
console.log('Copied dataset to public/data/')
