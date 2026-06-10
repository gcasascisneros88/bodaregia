import { supabaseAdmin } from '@/lib/supabase-admin'
import { extraerComentariosFacebook, extraerComentariosInstagram } from '@/lib/apify'

async function enviarAlPipeline(comentarios) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bodaregia.com'
  const res = await fetch(`${baseUrl}/api/pipeline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PIPELINE_TOKEN}`,
    },
    body: JSON.stringify({ comentarios }),
  })
  return res.json()
}

export async function GET(request) {
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.PIPELINE_TOKEN}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: fuentes, error } = await supabaseAdmin
    .from('fuentes')
    .select('id, nombre, url, tipo, max_posts')
    .eq('activo', true)
    .in('tipo', ['facebook', 'instagram'])

  if (error) {
    return Response.json({ error: 'Error al obtener fuentes', detalle: error.message }, { status: 500 })
  }

  if (!fuentes?.length) {
    return Response.json({ mensaje: 'No hay fuentes activas', procesadas: 0 })
  }

  const resumen = { fuentes_procesadas: 0, comentarios_enviados: 0, errores: [] }

  for (const fuente of fuentes) {
    if (!fuente.url) {
      resumen.errores.push({ fuente: fuente.nombre, error: 'Sin URL configurada' })
      continue
    }

    try {
      let comentarios = []

      if (fuente.tipo === 'facebook') {
        comentarios = await extraerComentariosFacebook(fuente.url, fuente.max_posts ?? 50)
      } else if (fuente.tipo === 'instagram') {
        comentarios = await extraerComentariosInstagram(fuente.url, fuente.max_posts ?? 50)
      }

      resumen.fuentes_procesadas++

      if (!comentarios.length) continue

      const resultado = await enviarAlPipeline(comentarios)
      resumen.comentarios_enviados += resultado.insertados ?? 0
    } catch (err) {
      resumen.errores.push({ fuente: fuente.nombre, error: err.message })
    }
  }

  return Response.json(resumen)
}
