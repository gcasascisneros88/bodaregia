import { supabaseAdmin } from '@/lib/supabase-admin'
import { extraerReseñasProveedor } from '@/lib/google-places'

export async function GET(request) {
  const auth = request.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.PIPELINE_TOKEN}`) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: proveedores, error } = await supabaseAdmin
    .from('proveedores')
    .select('id, nombre, place_id, google_maps_url')
    .eq('activo', true)
    .not('place_id', 'is', null)

  if (error) {
    return Response.json({ error: 'Error al obtener proveedores', detalle: error.message }, { status: 500 })
  }

  if (!proveedores?.length) {
    return Response.json({ mensaje: 'No hay proveedores con place_id', proveedores_procesados: 0 })
  }

  const resumen = { proveedores_procesados: 0, reseñas_enviadas: 0, errores: [] }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bodaregia.com'

  for (const proveedor of proveedores) {
    const placeRef = proveedor.place_id

    try {
      const reseñas = await extraerReseñasProveedor(placeRef, 5)
      resumen.proveedores_procesados++

      if (!reseñas.length) continue

      // Inyectar proveedor_id — las reseñas de Google no mencionan el negocio por nombre
      const reseñasConId = reseñas.map(r => ({ ...r, proveedor_id: proveedor.id }))

      const res = await fetch(`${baseUrl}/api/pipeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.PIPELINE_TOKEN}`,
        },
        body: JSON.stringify({ comentarios: reseñasConId }),
      })

      const resultado = await res.json()
      resumen.reseñas_enviadas += resultado.insertados ?? 0
    } catch (err) {
      resumen.errores.push({ proveedor: proveedor.nombre, error: err.message })
    }
  }

  return Response.json(resumen)
}
