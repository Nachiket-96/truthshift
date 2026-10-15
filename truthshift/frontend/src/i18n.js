// Screen text in each language. To add a language: copy the `en` block, translate it, add it to LANGS.
export const LANGS = { en: 'English', fr: 'Français' }

const STRINGS = {
  en: {
    title: 'TruthShift',
    tab_priorities: 'My priorities', tab_scan: 'Scan & search', tab_compare: 'Compare', tab_ask: 'Ask TruthShift', tab_map: 'Nearby',
    short_priorities: 'Priorities', short_scan: 'Scan', short_compare: 'Compare', short_ask: 'Ask', short_map: 'Nearby',
    prio_h: 'What matters to you?',
    prio_p: 'Everyone defines "ethical" differently. Set how much each issue matters (0 = not at all, 5 = very important). Scores everywhere update instantly.',
    presets: 'Quick presets:', legend_h: 'How to read our information',
    search_ph: 'Search a product or brand, or type a barcode and press Enter',
    scan_btn: 'Scan barcode', stop_scan: 'Stop camera', upload: 'No camera? Upload a photo of the barcode:',
    category: 'Category', ask_h: 'Ask TruthShift', ask_p: 'Ask in plain words. Answers only use our product data.',
    ask_btn: 'Ask', use_loc: 'Use my location', pick_area: 'or pick your area',
    why: 'Why this score?', better: 'Better matches for your priorities', best: 'This is the best match in its category for your priorities.',
    available: 'Available at', show_map: 'Show on map', in_regina: 'In Regina', confidence: 'Confidence', owner: 'Owner',
    backend_down: 'Can\'t reach the backend. Start it with: uvicorn app.main:app --port 8000 (in the backend folder).',
  },
  fr: {
    title: 'TruthShift',
    tab_priorities: 'Mes priorités', tab_scan: 'Scanner et chercher', tab_compare: 'Comparer', tab_ask: 'Demander', tab_map: 'À proximité',
    short_priorities: 'Priorités', short_scan: 'Scanner', short_compare: 'Comparer', short_ask: 'Demander', short_map: 'Proximité',
    prio_h: 'Qu\'est-ce qui compte pour vous ?',
    prio_p: 'Chacun définit « éthique » différemment. Indiquez l\'importance de chaque enjeu (0 = pas du tout, 5 = très important).',
    presets: 'Préréglages :', legend_h: 'Comment lire nos informations',
    search_ph: 'Cherchez un produit ou une marque, ou tapez un code-barres puis Entrée',
    scan_btn: 'Scanner', stop_scan: 'Arrêter la caméra', upload: 'Pas de caméra ? Téléversez une photo du code-barres :',
    category: 'Catégorie', ask_h: 'Demandez à TruthShift', ask_p: 'Posez votre question simplement. Les réponses utilisent seulement nos données.',
    ask_btn: 'Demander', use_loc: 'Ma position', pick_area: 'ou choisissez votre quartier',
    why: 'Pourquoi ce score ?', better: 'Meilleurs choix selon vos priorités', best: 'C\'est le meilleur choix de sa catégorie selon vos priorités.',
    available: 'Disponible chez', show_map: 'Voir sur la carte', in_regina: 'À Regina', confidence: 'Confiance', owner: 'Propriétaire',
    backend_down: 'Le serveur ne répond pas. Lancez-le avec : uvicorn app.main:app --port 8000',
  },
}

export const t = (lang, key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
