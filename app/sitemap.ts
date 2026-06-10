import type { MetadataRoute } from 'next'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bodaregia.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: categorias }, { data: proveedores }] = await Promise.all([
    supabaseAdmin.from('categorias').select('slug, updated_at'),
    supabaseAdmin.from('proveedores').select('slug, updated_at').eq('activo', true),
  ])

  const categoriasUrls: MetadataRoute.Sitemap = (categorias ?? []).map(c => ({
    url: `${BASE_URL}/categoria/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const proveedoresUrls: MetadataRoute.Sitemap = (proveedores ?? []).map(p => ({
    url: `${BASE_URL}/proveedor/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoriasUrls,
    ...proveedoresUrls,
  ]
}
