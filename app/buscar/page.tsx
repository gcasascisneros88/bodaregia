import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'

export default async function BuscarPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const term = q?.trim() ?? ''

  let proveedores: any[] = []

  if (term) {
    const { data } = await supabase
      .from('proveedores')
      .select('id, nombre, slug, municipio, colonia, verificado, plan')
      .eq('activo', true)
      .or(`nombre.ilike.%${term}%,municipio.ilike.%${term}%`)
      .order('nombre')
      .limit(30)

    proveedores = data ?? []
  }

  // Scores para los resultados
  const ids = proveedores.map((p) => p.id)
  const { data: scores } = ids.length
    ? await supabase.from('scores').select('proveedor_id, score_total, total_menciones, pct_positivo').in('proveedor_id', ids)
    : { data: [] }

  const scoreMap = Object.fromEntries((scores ?? []).map((s: any) => [s.proveedor_id, s]))

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* Navbar */}
      <nav style={{
        background: 'white', borderBottom: '1px solid var(--cream-dark)',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(196,118,58,0.08)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, color: 'var(--foreground)' }}>
              Boda<span style={{ color: 'var(--gold)' }}>Regia</span>
            </span>
          </a>
          <a href="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: 14 }}>← Inicio</a>
        </div>
      </nav>

      {/* Search header */}
      <section style={{
        background: 'linear-gradient(135deg, #2C1A0E 0%, #4A2C14 60%, #6B3F1E 100%)',
        padding: '40px 24px 48px',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          {term && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 16 }}>
              {proveedores.length} resultado{proveedores.length !== 1 ? 's' : ''} para{' '}
              <span style={{ color: 'var(--gold)', fontWeight: 600 }}>"{term}"</span>
            </p>
          )}
          <SearchBar initialValue={term} />
        </div>
      </section>

      {/* Resultados */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        {!term ? (
          <p style={{ color: '#888', textAlign: 'center', fontSize: 16 }}>Escribe algo para buscar proveedores.</p>
        ) : proveedores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--foreground)', marginBottom: 8 }}>
              No encontramos proveedores para tu búsqueda
            </p>
            <p style={{ fontSize: 15, color: '#888' }}>Intenta con otro término o explora por categoría.</p>
            <a href="/" style={{ display: 'inline-block', marginTop: 24, color: 'var(--gold)', fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>
              ← Ver todas las categorías
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {proveedores.map((p: any) => {
              const s = scoreMap[p.id]
              return (
                <a key={p.id} href={`/proveedor/${p.slug}`} className="proveedor-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>
                          {p.nombre}
                        </span>
                        {p.verificado && (
                          <span style={{ background: '#FFF3E8', color: 'var(--gold)', border: '1.5px solid var(--gold)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                            ✓ Verificado
                          </span>
                        )}
                        {p.plan === 'premium' && (
                          <span style={{ background: 'var(--gold)', color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                            ⭐ Premium
                          </span>
                        )}
                      </div>
                      {p.municipio && (
                        <span style={{ fontSize: 14, color: '#888' }}>
                          📍 {p.municipio}{p.colonia ? `, ${p.colonia}` : ''}
                        </span>
                      )}
                      {s && (
                        <div style={{ marginTop: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ background: '#F0EAE2', borderRadius: 99, height: 6, width: 140, overflow: 'hidden' }}>
                              <div style={{ width: `${Math.round(s.pct_positivo ?? 0)}%`, background: '#22c55e', height: '100%', borderRadius: 99 }} />
                            </div>
                            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{Math.round(s.pct_positivo ?? 0)}% positivo</span>
                          </div>
                          <span style={{ fontSize: 12, color: '#aaa', marginTop: 4, display: 'block' }}>{s.total_menciones} menciones analizadas</span>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      {s ? (
                        <>
                          <div style={{ background: 'var(--gold)', color: 'white', borderRadius: 14, padding: '10px 18px', fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                            {s.score_total?.toFixed(1)}
                          </div>
                          <span style={{ fontSize: 11, color: '#aaa' }}>Score</span>
                        </>
                      ) : (
                        <div style={{ color: '#ccc', fontSize: 13 }}>Sin score</div>
                      )}
                      <span style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600, marginTop: 4 }}>Ver perfil →</span>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background: '#2C1A0E', color: 'rgba(255,255,255,0.55)', textAlign: 'center', padding: '32px 24px', fontSize: 14, marginTop: 40 }}>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontSize: 20, marginBottom: 8, fontWeight: 600 }}>BodaRegia</p>
        <p>© {new Date().getFullYear()} BodaRegia · Monterrey, México</p>
      </footer>
    </div>
  )
}
