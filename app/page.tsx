import { supabase } from '@/lib/supabase'
import SearchBar from '@/components/SearchBar'

const categoryIcons: Record<string, string> = {
  'Salones de eventos': '🏛️',
  'Fotografía': '📷',
  'Video': '🎥',
  'Florería': '💐',
  'Pastelería': '🎂',
  'DJ y música': '🎵',
  'Vestidos de novia': '👗',
  'Coordinadoras': '📋',
  'Catering': '🍽️',
  'Maquillaje y peinado': '💄',
  'Invitaciones': '✉️',
  'Viaje de luna de miel': '✈️',
}

export default async function Home() {
  const [
    { data: categorias },
    { count: totalProveedores },
    { count: totalComentarios },
    { count: totalCategorias },
  ] = await Promise.all([
    supabase.from('categorias').select('*'),
    supabase.from('proveedores').select('*', { count: 'exact', head: true }),
    supabase.from('comentarios').select('*', { count: 'exact', head: true }),
    supabase.from('categorias').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* Navbar */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid var(--cream-dark)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 8px rgba(196,118,58,0.08)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 68,
        }}>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--foreground)',
            letterSpacing: '-0.5px',
          }}>
            Boda<span style={{ color: 'var(--gold)' }}>Regia</span>
          </span>
          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <a href="#categorias" style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: 15, opacity: 0.75 }}>Categorías</a>
            <a href="#" style={{ color: 'var(--foreground)', textDecoration: 'none', fontSize: 15, opacity: 0.75 }}>Proveedores</a>
            <a href="#" style={{
              background: 'var(--gold)',
              color: 'white',
              padding: '8px 20px',
              borderRadius: 24,
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 600,
            }}>Publicar negocio</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #2C1A0E 0%, #4A2C14 50%, #6B3F1E 100%)',
        padding: '80px 24px 96px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(196,118,58,0.12)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -40,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(196,118,58,0.08)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--gold)',
            fontSize: 15,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            Monterrey &amp; Área Metropolitana
          </p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: 20,
          }}>
            Tu boda perfecta<br />
            <span style={{ color: 'var(--gold)' }}>comienza aquí</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.72)',
            fontSize: 18,
            marginBottom: 40,
            lineHeight: 1.6,
          }}>
            Encuentra y compara los mejores proveedores de bodas en Monterrey.
            Reseñas reales, precios transparentes.
          </p>

          <SearchBar />
        </div>
      </section>

      {/* Stats bar */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid var(--cream-dark)',
        padding: '20px 24px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', justifyContent: 'center',
          gap: 'clamp(24px, 6vw, 80px)',
          flexWrap: 'wrap',
        }}>
          {[
            { n: totalProveedores ?? 0, label: 'Proveedores verificados' },
            { n: totalCategorias ?? 0, label: 'Categorías' },
            { n: totalComentarios ?? 0, label: 'Reseñas reales' },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 700, color: 'var(--gold)' }}>{n}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categorías */}
      <section id="categorias" style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--gold)',
            fontSize: 13,
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>Explora por categoría</p>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 700,
            color: 'var(--foreground)',
            margin: 0,
          }}>
            Todo lo que necesitas para tu boda
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 20,
        }}>
          {categorias?.map((cat: any) => (
            <a
              key={cat.id}
              href={`/categoria/${cat.slug ?? cat.id}`}
              className="categoria-card"
            >
              <div style={{ fontSize: 40, marginBottom: 14 }}>
                {categoryIcons[cat.nombre] ?? '✨'}
              </div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1.3,
                color: 'var(--foreground)',
              }}>
                {cat.nombre}
              </div>
              <div style={{
                marginTop: 8,
                fontSize: 13,
                color: 'var(--gold)',
                fontWeight: 600,
              }}>
                Ver proveedores →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#2C1A0E',
        color: 'rgba(255,255,255,0.55)',
        textAlign: 'center',
        padding: '32px 24px',
        fontSize: 14,
        marginTop: 'auto',
      }}>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)', fontSize: 20, marginBottom: 8, fontWeight: 600 }}>
          BodaRegia
        </p>
        <p>© {new Date().getFullYear()} BodaRegia · Monterrey, México</p>
      </footer>
    </div>
  )
}
