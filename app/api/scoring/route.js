import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request) {
  // Auth
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.PIPELINE_TOKEN}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const ahora = new Date()
  const hace90 = new Date(ahora - 90 * 24 * 60 * 60 * 1000).toISOString()
  const hace30 = new Date(ahora - 30 * 24 * 60 * 60 * 1000).toISOString()

  // Proveedores activos
  const { data: proveedores, error: errProv } = await supabaseAdmin
    .from('proveedores')
    .select('id, nombre')
    .eq('activo', true)

  if (errProv) return Response.json({ error: errProv.message }, { status: 500 })
  if (!proveedores?.length) return Response.json({ procesados: 0, mensaje: 'Sin proveedores activos' })

  const resumen = { procesados: 0, actualizados: 0, sin_comentarios: 0, errores: 0, detalles: [] }

  for (const proveedor of proveedores) {
    try {
      // Comentarios últimos 90 días
      const { data: comentarios } = await supabaseAdmin
        .from('comentarios')
        .select('sentimiento, es_advertencia, procesado_en')
        .eq('proveedor_id', proveedor.id)
        .gte('procesado_en', hace90)

      resumen.procesados++

      if (!comentarios?.length) {
        resumen.sin_comentarios++
        resumen.detalles.push({ nombre: proveedor.nombre, status: 'sin_comentarios' })
        continue
      }

      const total = comentarios.length
      const positivos = comentarios.filter(c => c.sentimiento === 'positivo').length
      const negativos = comentarios.filter(c => c.sentimiento === 'negativo').length
      const neutros   = comentarios.filter(c => c.sentimiento === 'neutro').length
      const recientes = comentarios.filter(c => c.procesado_en >= hace30).length
      const alertas   = comentarios.filter(c => c.es_advertencia === true).length

      const pct_positivo    = positivos / total
      const factor_volumen  = Math.min(total / 50, 1.0)
      const factor_recencia = 0.5 + (recientes / total) * 0.5
      const penalizacion    = alertas * 0.15

      const score_raw = (pct_positivo * 0.50) + (factor_volumen * 0.30) + (factor_recencia * 0.20) - penalizacion
      const score_total = Math.max(0, Math.min(1, score_raw)) * 10

      const { error: upsertErr } = await supabaseAdmin
        .from('scores')
        .upsert({
          proveedor_id:        proveedor.id,
          score_total:         Math.round(score_total * 10) / 10,
          total_menciones:     total,
          menciones_positivas: positivos,
          menciones_negativas: negativos,
          menciones_neutras:   neutros,
          pct_positivo:        Math.round(pct_positivo * 100),
          tiene_alertas:       alertas > 0,
          calculado_en:        ahora.toISOString(),
        }, { onConflict: 'proveedor_id' })

      if (upsertErr) throw new Error(upsertErr.message)

      resumen.actualizados++
      resumen.detalles.push({
        nombre: proveedor.nombre,
        score_total: Math.round(score_total * 10) / 10,
        total,
        positivos,
        negativos,
        alertas,
        status: 'actualizado',
      })
    } catch (err) {
      resumen.errores++
      resumen.detalles.push({ nombre: proveedor.nombre, error: err.message })
    }
  }

  return Response.json(resumen)
}
