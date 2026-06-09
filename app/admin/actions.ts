'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'bodaregia_admin_ok'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Contraseña incorrecta' }
  }
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })
  redirect('/admin')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/admin')
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE
}

export async function toggleVerificado(id: string, actual: boolean) {
  await supabaseAdmin.from('proveedores').update({ verificado: !actual }).eq('id', id)
}

export async function toggleActivo(id: string, actual: boolean) {
  await supabaseAdmin.from('proveedores').update({ activo: !actual }).eq('id', id)
}

export async function agregarProveedor(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const slug = formData.get('slug') as string
  const municipio = formData.get('municipio') as string
  const whatsapp = formData.get('whatsapp') as string
  const categoria_id = formData.get('categoria_id') as string

  const { data: proveedor, error } = await supabaseAdmin
    .from('proveedores')
    .insert({ nombre, slug, municipio, whatsapp, activo: true, verificado: false, plan: 'basico' })
    .select('id')
    .single()

  if (error) return { error: error.message }

  if (categoria_id && proveedor) {
    await supabaseAdmin.from('categorias_proveedor').insert({
      proveedor_id: proveedor.id,
      categoria_id,
    })
  }

  return { ok: true }
}
