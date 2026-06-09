import { isAuthenticated } from './actions'
import LoginForm from './LoginForm'
import AdminPanel from './AdminPanel'
import { supabase } from '@/lib/supabase'

export default async function AdminPage() {
  const autenticado = await isAuthenticated()
  if (!autenticado) return <LoginForm />

  // Datos para el panel
  const [
    { data: proveedoresRaw },
    { data: categorias },
    { count: comentariosPendientes },
    { data: scores },
    { data: catProveedores },
  ] = await Promise.all([
    supabase.from('proveedores').select('id, nombre, slug, municipio, verificado, activo').order('nombre'),
    supabase.from('categorias').select('id, nombre').order('nombre'),
    supabase.from('comentarios').select('*', { count: 'exact', head: true }).eq('es_advertencia', true),
    supabase.from('scores').select('proveedor_id, score_total'),
    supabase.from('categorias_proveedor').select('proveedor_id, categorias(nombre)'),
  ])

  const scoreMap = Object.fromEntries((scores ?? []).map((s: any) => [s.proveedor_id, s.score_total]))
  const catMap = Object.fromEntries((catProveedores ?? []).map((r: any) => [r.proveedor_id, r.categorias?.nombre]))

  const proveedores = (proveedoresRaw ?? []).map((p: any) => ({
    ...p,
    score_total: scoreMap[p.id] ?? null,
    categoria: catMap[p.id] ?? null,
  }))

  return (
    <AdminPanel
      proveedores={proveedores}
      categorias={categorias ?? []}
      comentariosPendientes={comentariosPendientes ?? 0}
    />
  )
}
