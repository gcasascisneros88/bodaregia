const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

async function fetchConRetry(url, options, intentos = 3, delayMs = 2000) {
  for (let i = 0; i < intentos; i++) {
    const res = await fetch(url, options)
    if (res.status === 503 && i < intentos - 1) {
      await new Promise(r => setTimeout(r, delayMs * (i + 1)))
      continue
    }
    return res
  }
}

export async function analizarComentario(texto) {
  const prompt = `Analiza el siguiente comentario sobre un proveedor de bodas en Monterrey, México.
Responde SOLO con un objeto JSON válido, sin markdown, sin explicaciones.

Comentario: ${texto}

Responde con este formato exacto:
{
  "proveedor": "nombre del proveedor mencionado o null",
  "sentimiento": "positivo | negativo | neutro | advertencia",
  "confianza": 0.0 a 1.0,
  "categoria": "salon | fotografia | video | floreria | pasteleria | dj-musica | vestidos | coordinadora | catering | maquillaje | invitaciones | luna-de-miel | null",
  "zona": "municipio o colonia mencionada o null",
  "precio_mencionado": "precio o rango mencionado o null",
  "es_advertencia": true | false,
  "resumen": "resumen de 10 palabras máximo"
}`

  const res = await fetchConRetry(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, responseMimeType: 'application/json' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const json = await res.json()
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text

  if (!raw) throw new Error('Gemini no devolvió contenido')

  return JSON.parse(raw)
}
