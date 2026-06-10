// node scripts/seed-proveedores.js
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// ── Cargar .env.local manualmente ───────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map((p, i) => (i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim())))
)

const PLACES_KEY    = env.GOOGLE_PLACES_API_KEY
const SUPABASE_URL  = env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY  = env.SUPABASE_SERVICE_ROLE_KEY

if (!PLACES_KEY)   { console.error('Falta GOOGLE_PLACES_API_KEY en .env.local'); process.exit(1) }
if (!SUPABASE_URL) { console.error('Falta NEXT_PUBLIC_SUPABASE_URL en .env.local'); process.exit(1) }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── Config ───────────────────────────────────────────────────────────────────
const CENTER   = { lat: 25.6866, lng: -100.3161 }
const RADIUS   = 50000 // metros

const QUERIES = [
  { query: 'salón de eventos bodas Monterrey',  categoria: 'salones' },
  { query: 'fotógrafo bodas Monterrey',         categoria: 'fotografia' },
  { query: 'florería bodas Monterrey',          categoria: 'floreria' },
  { query: 'pastelería bodas Monterrey',        categoria: 'pasteleria' },
  { query: 'DJ bodas Monterrey',                categoria: 'dj-musica' },
  { query: 'vestidos de novia Monterrey',       categoria: 'vestidos' },
]

// Municipios del AMM para extracción desde address
const MUNICIPIOS_NL = [
  'Monterrey', 'San Pedro Garza García', 'San Nicolás de los Garza',
  'Guadalupe', 'Apodaca', 'General Escobedo', 'Santa Catarina',
  'García', 'Juárez', 'San Sebastián Tepalcatepec', 'Cadereyta',
  'Santiago', 'Salinas Victoria', 'Linares', 'Montemorelos',
]

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extraerMunicipio(address) {
  if (!address) return null
  for (const m of MUNICIPIOS_NL) {
    if (address.includes(m)) return m
  }
  return null
}

async function textSearch(query) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json')
  url.searchParams.set('query', query)
  url.searchParams.set('location', `${CENTER.lat},${CENTER.lng}`)
  url.searchParams.set('radius', RADIUS)
  url.searchParams.set('language', 'es')
  url.searchParams.set('region', 'mx')
  url.searchParams.set('key', PLACES_KEY)

  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API error: ${data.status} — ${data.error_message ?? ''}`)
  }

  return data.results ?? []
}

async function placeDetails(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'name,formatted_address,formatted_phone_number,website,url')
  url.searchParams.set('language', 'es')
  url.searchParams.set('key', PLACES_KEY)

  const res = await fetch(url)
  const data = await res.json()

  if (data.status !== 'OK') return null
  return data.result
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── Obtener categoria_id ──────────────────────────────────────────────────────
async function getCategoriaId(slug) {
  const { data } = await supabase
    .from('categorias')
    .select('id')
    .eq('slug', slug)
    .single()
  return data?.id ?? null
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando seed de proveedores desde Google Places...\n')

  const stats = { consultados: 0, insertados: 0, duplicados: 0, errores: 0 }

  for (const { query, categoria: categoriaSlug } of QUERIES) {
    console.log(`\n🔍 Buscando: "${query}"`)

    let lugares
    try {
      lugares = await textSearch(query)
    } catch (err) {
      console.error(`  ❌ Error en búsqueda: ${err.message}`)
      stats.errores++
      continue
    }

    console.log(`   ${lugares.length} resultados encontrados`)
    const categoriaId = await getCategoriaId(categoriaSlug)

    for (const lugar of lugares) {
      stats.consultados++
      const slug = slugify(lugar.name)

      // Verificar duplicado por slug
      const { data: existe } = await supabase
        .from('proveedores')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existe) {
        process.stdout.write('·')
        stats.duplicados++
        continue
      }

      // Obtener detalles (teléfono, website)
      await sleep(200) // respetar rate limit de Places API
      const detalle = await placeDetails(lugar.place_id)

      const municipio = extraerMunicipio(
        detalle?.formatted_address ?? lugar.formatted_address
      )

      const { error } = await supabase.from('proveedores').insert({
        nombre:       lugar.name,
        slug,
        municipio,
        activo:       true,
        verificado:   false,
        plan:         'basico',
        telefono:     detalle?.formatted_phone_number ?? null,
        website:      detalle?.website ?? null,
        google_maps_url: detalle?.url ?? null,
      })

      if (error) {
        if (error.code === '23505') {
          // slug duplicado por race condition
          stats.duplicados++
          process.stdout.write('·')
        } else {
          console.error(`\n  ❌ Error insertando ${lugar.name}: ${error.message}`)
          stats.errores++
        }
        continue
      }

      // Vincular categoría
      if (categoriaId) {
        const { data: nuevo } = await supabase
          .from('proveedores')
          .select('id')
          .eq('slug', slug)
          .single()

        if (nuevo) {
          await supabase
            .from('categorias_proveedor')
            .insert({ proveedor_id: nuevo.id, categoria_id: categoriaId })
            .on('conflict', () => {}) // ignorar si ya existe
        }
      }

      process.stdout.write('+')
      stats.insertados++
    }

    console.log() // salto de línea tras los dots
    await sleep(500) // pausa entre queries
  }

  console.log('\n' + '─'.repeat(40))
  console.log(`✅ Seed completado:`)
  console.log(`   Consultados : ${stats.consultados}`)
  console.log(`   Insertados  : ${stats.insertados}`)
  console.log(`   Duplicados  : ${stats.duplicados}`)
  console.log(`   Errores     : ${stats.errores}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
