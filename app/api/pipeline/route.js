import { createHash } from 'crypto'
import { analizarComentario } from '@/lib/gemini'
import { supabaseAdmin } from '@/lib/supabase-admin'

function md5(texto) {
  return createHash('md5').update(texto).digest('hex')
}

function slugify(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function obtenerOCrearFuente(fuente) {
  const { data } = await supabaseAdmin
    .from('fuentes')
    .select('id')
    .eq('nombre', fuente)
    .single()

  if (data) return data.id

  const { data: nueva } = await supabaseAdmin
    .from('fuentes')
    .insert({ nombre: fuente })
    .select('id')
    .single()

  return nueva?.id ?? null
}

export async function POST(request) {
  // Auth
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.PIPELINE_TOKEN}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Body inválido' }, { status: 400 })
  }

  const { comentarios } = body
  if (!Array.isArray(comentarios) || comentarios.length === 0) {
    return Response.json({ error: 'Se requiere array comentarios no vacío' }, { status: 400 })
  }

  const resumen = { procesados: 0, insertados: 0, sin_match: 0, errores: 0, detalles: [] }

  for (const item of comentarios) {
    const { texto, fuente, url_origen, fecha_publicacion } = item

    if (!texto?.trim()) {
      resumen.errores++
      resumen.detalles.push({ texto: texto?.slice(0, 50), error: 'Texto vacío' })
      continue
    }

    const hash = md5(texto.trim())

    try {
      // 1. Deduplicación por hash
      const { data: existe } = await supabaseAdmin
        .from('comentarios')
        .select('id')
        .eq('hash', hash)
        .single()

      if (existe) {
        resumen.procesados++
        resumen.detalles.push({ hash, status: 'duplicado' })
        continue
      }

      // 2. Analizar con Gemini
      const analisis = await analizarComentario(texto)

      // 3. Buscar proveedor por similitud
      let proveedor_id = null

      if (analisis.proveedor) {
        const { data: matches } = await supabaseAdmin.rpc('buscar_proveedor_similar', {
          nombre_busqueda: analisis.proveedor,
          umbral: 0.3,
        })

        if (matches?.length > 0) {
          proveedor_id = matches[0].id
        } else {
          // 5. Crear proveedor provisional
          const slug = slugify(analisis.proveedor)
          const { data: nuevo } = await supabaseAdmin
            .from('proveedores')
            .insert({
              nombre: analisis.proveedor,
              slug: `${slug}-${hash.slice(0, 6)}`,
              municipio: analisis.zona ?? null,
              activo: false,
              verificado: false,
              plan: 'basico',
            })
            .select('id')
            .single()

          proveedor_id = nuevo?.id ?? null
          resumen.sin_match++
          resumen.detalles.push({ proveedor: analisis.proveedor, status: 'proveedor_provisional_creado' })
        }
      }

      // 4. Obtener fuente_id
      const fuente_id = fuente ? await obtenerOCrearFuente(fuente) : null

      // 4. Insertar comentario
      if (proveedor_id) {
        const { error: insertError } = await supabaseAdmin.from('comentarios').insert({
          proveedor_id,
          fuente_id,
          contenido_original: texto,
          url_origen: url_origen ?? null,
          sentimiento: analisis.sentimiento,
          confianza: analisis.confianza,
          entidad_detectada: analisis.proveedor ?? null,
          contexto: analisis.resumen ?? null,
          zona_mencionada: analisis.zona ?? null,
          precio_mencionado: analisis.precio_mencionado ?? null,
          es_advertencia: analisis.es_advertencia ?? false,
          fecha_publicacion: fecha_publicacion ?? null,
          procesado_en: new Date().toISOString(),
          hash,
        })

        if (insertError) throw new Error(insertError.message)
        resumen.insertados++
        resumen.detalles.push({ proveedor: analisis.proveedor, sentimiento: analisis.sentimiento, status: 'insertado' })
      } else {
        resumen.sin_match++
        resumen.detalles.push({ texto: texto.slice(0, 60), status: 'sin_proveedor_detectado' })
      }

      resumen.procesados++
    } catch (err) {
      resumen.errores++
      resumen.procesados++
      resumen.detalles.push({ texto: texto?.slice(0, 60), error: err.message })
    }
  }

  return Response.json(resumen)
}
