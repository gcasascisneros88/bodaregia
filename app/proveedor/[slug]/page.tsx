import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bodaregia.com'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data: proveedor } = await supabase
    .from('proveedores')
    .select('nombre, municipio')
    .eq('slug', slug)
    .single()

  if (!proveedor) return {}

  const title = `${proveedor.nombre} — Reseñas y opiniones`
  const description = `Lee reseñas verificadas de ${proveedor.nombre}${proveedor.municipio ? `, ${proveedor.municipio}` : ''}. Opiniones reales de novias en BodaRegia.`

  return {
    title,
    description,
    alternates: { canonical: `/proveedor/${slug}` },
    openGraph: { title, description, url: `/proveedor/${slug}` },
  }
}

export default async function ProveedorPage({ params }: Props) {
  const { slug } = await params

  const [{ data: proveedor }, ] = await Promise.all([
    supabase.from('proveedores').select('*').eq('slug', slug).single(),
  ])

  if (!proveedor) notFound()

  const [{ data: scores }, { data: comentarios }, { data: categorias }] = await Promise.all([
    supabase.from('scores').select('*').eq('proveedor_id', proveedor.id).single(),
    supabase.from('comentarios')
      .select('*')
      .eq('proveedor_id', proveedor.id)
      .order('fecha_publicacion', { ascending: false })
      .limit(20),
    supabase
      .from('categorias_proveedor')
      .select('categorias(nombre)')
      .eq('proveedor_id', proveedor.id),
  ])

  const score = scores as any
  const cats = (categorias as any[])?.map((r: any) => r.categorias?.nombre).filter(Boolean) ?? []

  const pctPos = score?.pct_positivo ?? 0
  const pctNeg = score?.menciones_negativas && score?.total_menciones
    ? Math.round((score.menciones_negativas / score.total_menciones) * 100)
    : 0
  const pctNeu = Math.max(0, 100 - pctPos - pctNeg)

  const sentimientoColor: Record<string, string> = {
    positivo: '#22c55e',
    negativo: '#ef4444',
    neutro: '#94a3b8',
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* Navbar */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--cream-dark)',
        padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(196,118,58,0.08)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68,
        }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, color: 'var(--foreground)' }}>
              Boda<span style={{ color: 'var(--gold)' }}>Regia</span>
            </span>
          </a>
          <a href="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: 14 }}>← Volver</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr min(320px, 100%)', gap: 32, alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div>

          {/* Header card */}
          <div style={{ background: 'white', borderRadius: 20, padding: '32px 36px', marginBottom: 24, border: '1.5px solid var(--cream-dark)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                    {proveedor.nombre}
                  </h1>
                  {proveedor.verificado && (
                    <span style={{
                      background: '#FFF3E8', color: 'var(--gold)', border: '1.5px solid var(--gold)',
                      borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                    }}>✓ Verificado</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                  {cats.map((c: string) => (
                    <span key={c} style={{ background: 'var(--cream-dark)', borderRadius: 12, padding: '4px 12px', fontSize: 13, color: 'var(--foreground)', opacity: 0.8 }}>{c}</span>
                  ))}
                  {proveedor.municipio && (
                    <span style={{ fontSize: 14, color: '#888' }}>📍 {proveedor.municipio}{proveedor.colonia ? `, ${proveedor.colonia}` : ''}</span>
                  )}
                </div>

                {/* Score */}
                {score && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <div style={{
                      background: 'var(--gold)', color: 'white',
                      borderRadius: 12, padding: '8px 16px',
                      fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700,
                    }}>
                      {score.score_total?.toFixed(1) ?? '—'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: '#888' }}>Score BodaRegia</div>
                      <div style={{ fontSize: 13, color: '#555' }}>{score.total_menciones ?? 0} menciones analizadas</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sentimiento */}
          {score && (
            <div style={{ background: 'white', borderRadius: 20, padding: '28px 36px', marginBottom: 24, border: '1.5px solid var(--cream-dark)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--foreground)' }}>
                Distribución de sentimiento
              </h2>

              {[
                { label: 'Positivo', pct: Math.round(pctPos), color: '#22c55e', bg: '#f0fdf4' },
                { label: 'Negativo', pct: pctNeg, color: '#ef4444', bg: '#fef2f2' },
                { label: 'Neutro', pct: pctNeu, color: '#94a3b8', bg: '#f8fafc' },
              ].map(({ label, pct, color, bg }) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{label}</span>
                    <span style={{ color, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ background: '#F0EAE2', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 99, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}

              {score.tiene_alertas && (
                <div style={{ marginTop: 16, background: '#FFF3CD', border: '1px solid #F0AD4E', borderRadius: 10, padding: '10px 16px', fontSize: 13, color: '#856404' }}>
                  ⚠️ Este proveedor tiene alertas de advertencia en algunos comentarios.
                </div>
              )}
            </div>
          )}

          {/* Comentarios */}
          <div style={{ background: 'white', borderRadius: 20, padding: '28px 36px', border: '1.5px solid var(--cream-dark)' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--foreground)' }}>
              Comentarios ({comentarios?.length ?? 0})
            </h2>

            {!comentarios?.length ? (
              <p style={{ color: '#888', fontSize: 15 }}>Aún no hay comentarios analizados para este proveedor.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {comentarios.map((c: any) => (
                  <div key={c.id} style={{
                    border: '1.5px solid var(--cream-dark)', borderRadius: 14, padding: '18px 22px',
                    borderLeft: `4px solid ${sentimientoColor[c.sentimiento] ?? '#94a3b8'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                        color: sentimientoColor[c.sentimiento] ?? '#94a3b8',
                        background: '#f8fafc', borderRadius: 8, padding: '2px 10px',
                      }}>{c.sentimiento ?? 'sin análisis'}</span>
                      {c.fecha_publicacion && (
                        <span style={{ fontSize: 12, color: '#aaa' }}>
                          {new Date(c.fecha_publicacion).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--foreground)' }}>
                      {c.contenido_original}
                    </p>
                    {c.es_advertencia && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#856404' }}>⚠️ Contiene advertencia</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN — contacto */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '28px 28px', border: '1.5px solid var(--cream-dark)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--foreground)' }}>
              Contactar proveedor
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {proveedor.whatsapp && (
                <a href={`https://wa.me/${proveedor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#25D366', color: 'white', borderRadius: 12,
                    padding: '14px 20px', textDecoration: 'none', fontWeight: 600, fontSize: 15,
                  }}>
                  <span style={{ fontSize: 20 }}>💬</span> WhatsApp
                </a>
              )}

              {proveedor.instagram_url && (
                <a href={proveedor.instagram_url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                    color: 'white', borderRadius: 12,
                    padding: '14px 20px', textDecoration: 'none', fontWeight: 600, fontSize: 15,
                  }}>
                  <span style={{ fontSize: 20 }}>📸</span> Instagram
                </a>
              )}

              {proveedor.facebook_url && (
                <a href={proveedor.facebook_url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#1877F2', color: 'white', borderRadius: 12,
                    padding: '14px 20px', textDecoration: 'none', fontWeight: 600, fontSize: 15,
                  }}>
                  <span style={{ fontSize: 20 }}>📘</span> Facebook
                </a>
              )}

              {proveedor.google_maps_url && (
                <a href={proveedor.google_maps_url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: '#EA4335', color: 'white', borderRadius: 12,
                    padding: '14px 20px', textDecoration: 'none', fontWeight: 600, fontSize: 15,
                  }}>
                  <span style={{ fontSize: 20 }}>📍</span> Ver en Maps
                </a>
              )}

              {proveedor.telefono && (
                <a href={`tel:${proveedor.telefono}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--cream-dark)', color: 'var(--foreground)', borderRadius: 12,
                    padding: '14px 20px', textDecoration: 'none', fontWeight: 600, fontSize: 15,
                  }}>
                  <span style={{ fontSize: 20 }}>📞</span> {proveedor.telefono}
                </a>
              )}

              {!proveedor.whatsapp && !proveedor.instagram_url && !proveedor.facebook_url && !proveedor.telefono && (
                <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', margin: 0 }}>Sin datos de contacto disponibles.</p>
              )}
            </div>

            {proveedor.plan === 'premium' && (
              <div style={{ marginTop: 20, padding: '10px 14px', background: '#FFF3E8', borderRadius: 10, fontSize: 12, color: 'var(--gold)', fontWeight: 600, textAlign: 'center' }}>
                ⭐ Proveedor Premium
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#2C1A0E', color: 'rgba(255,255,255,0.55)', textAlign: 'center', padding: '32px 24px', fontSize: 14, marginTop: 40 }}>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontSize: 20, marginBottom: 8, fontWeight: 600 }}>BodaRegia</p>
        <p>© {new Date().getFullYear()} BodaRegia · Monterrey, México</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: proveedor.nombre,
          url: `${BASE_URL}/proveedor/${proveedor.slug}`,
          ...(proveedor.municipio && {
            address: {
              '@type': 'PostalAddress',
              addressLocality: proveedor.municipio,
              addressRegion: 'Nuevo León',
              addressCountry: 'MX',
            },
          }),
          ...(proveedor.telefono && { telephone: proveedor.telefono }),
          ...(proveedor.instagram_url && { sameAs: [proveedor.instagram_url] }),
          ...(score && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: score.score_total?.toFixed(1),
              bestRating: '10',
              worstRating: '0',
              reviewCount: score.total_menciones ?? 0,
            },
          }),
        })}}
      />
    </div>
  )
}
