// node scripts/fix-categorias.js
// Vincula los proveedores ya insertados con sus categorías correctas
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map((p, i) => (i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim())))
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// Slug correcto de cada categoría → palabras clave en el nombre del proveedor
const REGLAS = [
  { categoria: 'salones',    keywords: ['salón', 'salon', 'eventos', 'terraza', 'hacienda', 'jardin', 'jardín', 'capitolio', 'garden', 'palace', 'palazzo', 'lomas', 'casona', 'lux', 'atrium', 'espacio', 'rouse', 'condesa'] },
  { categoria: 'fotografia', keywords: ['foto', 'fotograf', 'studio', 'estudio', 'imagen', 'cinema', 'wedding', 'vibes', 'pictórica', 'pictori', 'chic foto', 'creando', 'cárdenas', 'sandoval', 'mantecón', 'carol', 'adriana foto', 'bohemian', 'ramiro', 'haione', 'atelier', 'e.l.', 'zaz', 'guerra', 'boox'] },
  { categoria: 'floreria',   keywords: ['flor', 'florería', 'floreria', 'fleur', 'palacio floral', 'violetera', 'chagar', 'camelia', 'florrey', 'semihita', 'ava garden', 'daniel moreno', 'luiper'] },
  { categoria: 'pasteleria', keywords: ['pastel', 'repostería', 'reposteria', 'bakeren', 'merengue', 'mille', 'cachito', 'bubarú', 'bubaru', 'allegro', 'delirium', 'nom nom', 'fancy', 'catalina', 'laura', 'caty', 'fondant', 'denisse', 'mónica villarreal', 'monica villarreal'] },
  { categoria: 'dj-musica',  keywords: ['dj', 'd.j.', 'music', 'sonido', 'producciones', 'audio', 'beat', 'sunrise', 'blacktie', 'gamboa', 'brown', 'daddy', 'omar', 'sound', 'latino music', 'house of', 'monsivais', '360 sky', 'cirilomanzano', 'sonluck', 'ia eventos'] },
  { categoria: 'vestidos',   keywords: ['novia', 'novias', 'bridal', 'atelier', 'boutique', 'moda', 'vestido', 'bellaisabella', 'querida', 'catedral', 'belle mariee', 'carlotta', 'glam', 'narah', "nara'h", 'pronovias', 'preciosa', 'lizzeth', 'classy', 'jessica', 'esposa', 'erika', 'lucía', 'lucia', 'casa iza', 'lucy franco', 'bridenformal'] },
]

async function main() {
  console.log('🔗 Vinculando proveedores con categorías...\n')

  // Cargar categorías
  const { data: categorias } = await supabase.from('categorias').select('id, slug')
  const catMap = Object.fromEntries(categorias.map(c => [c.slug, c.id]))

  // Cargar todos los proveedores
  const { data: proveedores } = await supabase.from('proveedores').select('id, nombre')
  console.log(`Total proveedores: ${proveedores.length}`)

  let vinculados = 0, omitidos = 0

  for (const p of proveedores) {
    const nombreLower = p.nombre.toLowerCase()

    for (const { categoria, keywords } of REGLAS) {
      const match = keywords.some(k => nombreLower.includes(k.toLowerCase()))
      if (!match) continue

      const categoria_id = catMap[categoria]
      if (!categoria_id) continue

      const { error } = await supabase
        .from('categorias_proveedor')
        .upsert({ proveedor_id: p.id, categoria_id }, { onConflict: 'proveedor_id,categoria_id', ignoreDuplicates: true })

      if (!error) {
        process.stdout.write('+')
        vinculados++
      }
      break // un proveedor → una categoría principal
    }

    // Si no matcheó ninguna regla
    const matchAny = REGLAS.some(({ keywords }) => keywords.some(k => p.nombre.toLowerCase().includes(k.toLowerCase())))
    if (!matchAny) {
      process.stdout.write('?')
      omitidos++
    }
  }

  console.log('\n')
  console.log('─'.repeat(40))
  console.log(`✅ Vinculados : ${vinculados}`)
  console.log(`⚠️  Sin match  : ${omitidos}`)
}

main().catch(e => { console.error(e); process.exit(1) })
