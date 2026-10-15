// Screen text in each language. To add a language: copy the `en` block, translate it, add it to LANGS.
export const LANGS = { en: 'English', fr: 'Français', gu: 'ગુજરાતી' }

const STRINGS = {
  en: {
    title: 'TruthShift',
    tab_priorities: 'My priorities', tab_scan: 'Scan & search', tab_compare: 'Compare', tab_ask: 'Ask TruthShift', tab_map: 'Nearby',
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
  gu: {
    title: 'TruthShift',
    tab_priorities: 'મારી પ્રાથમિકતા', tab_scan: 'સ્કેન અને શોધ', tab_compare: 'સરખામણી', tab_ask: 'પૂછો', tab_map: 'નજીકમાં',
    prio_h: 'તમારા માટે શું મહત્વનું છે?',
    prio_p: 'દરેક વ્યક્તિ માટે "નૈતિક"નો અર્થ જુદો છે. દરેક મુદ્દો કેટલો મહત્વનો છે તે પસંદ કરો (0 = બિલકુલ નહીં, 5 = ખૂબ મહત્વનું).',
    presets: 'ઝડપી પસંદગી:', legend_h: 'માહિતી કેવી રીતે વાંચવી',
    search_ph: 'પ્રોડક્ટ અથવા બ્રાન્ડ શોધો, અથવા બારકોડ લખી Enter દબાવો',
    scan_btn: 'બારકોડ સ્કેન', stop_scan: 'કેમેરા બંધ', upload: 'કેમેરા નથી? બારકોડનો ફોટો અપલોડ કરો:',
    category: 'શ્રેણી', ask_h: 'TruthShift ને પૂછો', ask_p: 'સાદા શબ્દોમાં પૂછો. જવાબ ફક્ત અમારા ડેટામાંથી આવે છે.',
    ask_btn: 'પૂછો', use_loc: 'મારું સ્થાન', pick_area: 'અથવા તમારો વિસ્તાર પસંદ કરો',
    why: 'આ સ્કોર કેમ?', better: 'તમારી પ્રાથમિકતા મુજબ વધુ સારા વિકલ્પ', best: 'તમારી પ્રાથમિકતા મુજબ આ શ્રેણીમાં આ જ શ્રેષ્ઠ છે.',
    available: 'અહીં મળે છે', show_map: 'નકશા પર જુઓ', in_regina: 'રેજાઇનામાં', confidence: 'વિશ્વાસ', owner: 'માલિક',
    backend_down: 'બેકએન્ડ ચાલુ નથી. backend ફોલ્ડરમાં ચલાવો: uvicorn app.main:app --port 8000',
  },
}

export const t = (lang, key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
