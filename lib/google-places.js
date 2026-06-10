const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place'

/**
 * Extracts a place_id-compatible reference from a Google Maps URL.
 * Supports:
 *   - https://maps.google.com/?cid=1234           → cid:1234
 *   - https://maps.googleapis.com/...place_id=ChIJ → ChIJ...
 *   - https://maps.google.com/maps/place/...       → returns null (no id in URL)
 */
export function extraerPlaceRef(mapsUrl) {
  if (!mapsUrl) return null
  try {
    const url = new URL(mapsUrl)

    // CID format: ?cid=XXXXXXX
    const cid = url.searchParams.get('cid')
    if (cid) return `cid:${cid}`

    // Explicit place_id query param
    const pid = url.searchParams.get('place_id')
    if (pid) return pid
  } catch {
    // not a valid URL
  }
  return null
}

/**
 * Fetches reviews for a place from Google Places API.
 * Returns array of { texto, fuente, url_origen, fecha_publicacion }
 */
export async function extraerReseñasProveedor(placeRef, maxReviews = 5) {
  const url = new URL(`${PLACES_BASE}/details/json`)
  url.searchParams.set('place_id', placeRef)
  url.searchParams.set('fields', 'reviews,rating,url')
  url.searchParams.set('language', 'es')
  url.searchParams.set('key', process.env.GOOGLE_PLACES_API_KEY)

  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK') {
    throw new Error(`Places API ${data.status}: ${data.error_message ?? placeRef}`)
  }

  const placeUrl = data.result?.url ?? `https://maps.google.com/?${placeRef.startsWith('cid:') ? 'cid=' + placeRef.slice(4) : 'place_id=' + placeRef}`
  const reviews  = (data.result?.reviews ?? []).slice(0, maxReviews)

  return reviews
    .filter(r => r.text?.trim())
    .map(r => ({
      texto:             r.text.trim(),
      fuente:            'google_maps',
      url_origen:        placeUrl,
      fecha_publicacion: r.time
        ? new Date(r.time * 1000).toISOString().split('T')[0]
        : null,
    }))
}
