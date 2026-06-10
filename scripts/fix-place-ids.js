// node scripts/fix-place-ids.js
// Busca el place_id real (ChIJ...) de cada proveedor usando Find Place API
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map((p, i) => (i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim())))
)

const PLACES_KEY = env.GOOGLE_PLACES_API_KEY
const supabase   = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

if (!PLACES_KEY) { console.error('Falta GOOGLE_PLACES_API_KEY en .env.local'); process.exit(1) }

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function findPlaceId(nombre, municipio) {
  const input = municipio ? `${nombre} ${municipio} Nuevo León México` : `${nombre} Monterrey México`
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json')
  url.searchParams.set('input', input)
  url.searchParams.set('inputtype', 'textquery')
  url.searchParams.set('fields', 'place_id')
  url.searchParams.set('locationbias', 'circle:50000@25.6866,-100.3161')
  url.searchParams.set('key', PLACES_KEY)

  const res  = await fetch(url)
  const data = await res.json()

  if (data.status === 'OK' && data.candidates?.[0]?.place_id) {
    return data.candidates[0].place_id
  }
  return null
}

async function main() {
  console.log('🔍 Buscando place_id para cada proveedor...\n')

  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('id, nombre, municipio, place_id')
    .is('place_id', null)
    .eq('activo', true)

  console.log(`Proveedores sin place_id: ${proveedores.length}`)

  const stats = { ok: 0, nulo: 0, errores: 0 }

  for (const p of proveedores) {
    try {
      await sleep(150) // ~6 req/s — bien dentro del límite de Places API
      const placeId = await findPlaceId(p.nombre, p.municipio)

      if (placeId) {
        await supabase.from('proveedores').update({ place_id: placeId }).eq('id', p.id)
        process.stdout.write('+')
        stats.ok++
      } else {
        process.stdout.write('·')
        stats.nulo++
      }
    } catch (err) {
      process.stdout.write('x')
      stats.errores++
    }
  }

  console.log('\n')
  console.log('─'.repeat(40))
  console.log(`✅ Con place_id  : ${stats.ok}`)
  console.log(`⚠️  Sin resultado : ${stats.nulo}`)
  console.log(`❌ Errores        : ${stats.errores}`)
}

main().catch(e => { console.error(e); process.exit(1) })
