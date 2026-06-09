import NotifyForm from '@/components/NotifyForm'

const cats = [
  { label: 'Salones de eventos', featured: true },
  { label: 'Fotógrafos',         featured: true },
  { label: 'Floristas',          featured: false },
  { label: 'Pastelerías',        featured: false },
  { label: 'DJ y grupos musicales', featured: false },
  { label: 'Vestidos de novia',  featured: false },
  { label: 'Coordinadoras',      featured: false },
  { label: 'Viajes de luna de miel', featured: false },
  { label: 'Catering',           featured: false },
  { label: 'Maquillaje y peinado', featured: false },
  { label: 'Invitaciones',       featured: false },
  { label: 'Video',              featured: false },
]

export default function Home() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--cream)', color: 'var(--ink)', minHeight: '100vh' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '18px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(251,248,243,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 600, letterSpacing: '0.5px', color: 'var(--ink)' }}>
          Boda<span style={{ color: 'var(--gold)' }}>Regia</span>
        </div>
        <a href="#aviso" style={{
          padding: '8px 20px', borderRadius: 6,
          background: 'var(--ink)', color: 'var(--cream)',
          fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
          textDecoration: 'none', letterSpacing: '0.3px',
        }}>
          Avísame cuando abra
        </a>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '100px 24px 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Anillos decorativos */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700, borderRadius: '50%',
          border: '1px solid rgba(184,131,42,0.08)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500, height: 500, borderRadius: '50%',
          border: '1px solid rgba(184,131,42,0.12)', pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontSize: 11, fontWeight: 500, letterSpacing: 2,
          textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 24,
        }}>
          <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold-lt)' }} />
          Nuevo León · Próximamente
          <span style={{ display: 'block', width: 28, height: 1, background: 'var(--gold-lt)' }} />
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(44px, 8vw, 80px)',
          fontWeight: 400, lineHeight: 1.05,
          letterSpacing: '-1px', color: 'var(--ink)',
          maxWidth: 760, marginBottom: 8,
        }}>
          El ranking de bodas<br />
          que <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>Monterrey</em> necesitaba
        </h1>

        <p style={{
          fontSize: 16, fontWeight: 300, color: 'var(--muted)',
          maxWidth: 440, lineHeight: 1.7, margin: '20px auto 40px',
        }}>
          El ranking más honesto de proveedores nupciales de Nuevo León. Sin reseñas pagadas, sin publicidad disfrazada.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#aviso" style={{
            padding: '14px 32px', background: 'var(--ink)', color: 'var(--cream)',
            border: 'none', borderRadius: 6, fontFamily: 'var(--font-sans)',
            fontSize: 14, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.3px',
          }}>
            Quiero ser de los primeros
          </a>
        </div>

        <div style={{
          marginTop: 48,
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '10px 20px',
          background: 'var(--parchment)', border: '1px solid var(--border)',
          borderRadius: 40, fontSize: 13, color: 'var(--muted)',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: 'var(--gold)',
            animation: 'pulse 2s ease-in-out infinite', display: 'inline-block',
          }} />
          Lanzamiento · Septiembre 2026
        </div>
      </section>

      <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }} />

      {/* CATEGORÍAS */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--parchment)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 400, marginBottom: 40, color: 'var(--ink)',
          }}>
            Todos los proveedores que necesitas,<br />en un solo lugar
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {cats.map(({ label, featured }) => (
              <span key={label} style={{
                padding: '10px 22px', borderRadius: 40,
                border: '1px solid var(--border)',
                background: featured ? 'var(--ink)' : 'var(--white)',
                color: featured ? 'var(--cream)' : 'var(--ink)',
                fontSize: 13, fontWeight: 400,
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* NOTIFY */}
      <section id="aviso" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 42px)',
          fontWeight: 400, lineHeight: 1.2,
          marginBottom: 12, color: 'var(--ink)',
        }}>
          Sé la primera en<br />
          <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>saber cuándo abrimos</em>
        </h2>
        <p style={{
          fontSize: 14, fontWeight: 300, color: 'var(--muted)',
          marginBottom: 32, lineHeight: 1.7,
        }}>
          Dejanos tu correo y te avisamos el día que BodaRegia abra sus puertas. Sin spam, solo una notificación.
        </p>
        <NotifyForm />
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: '24px 32px',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>
          Boda<span style={{ color: 'var(--gold)' }}>Regia</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>© 2026 BodaRegia · Monterrey, Nuevo León</p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Hecho con ♥ en Monterrey</p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @media (max-width: 600px) {
          nav { padding: 14px 20px !important; }
          footer { justify-content: center !important; text-align: center !important; }
        }
        a[href="#aviso"]:hover { background: var(--gold) !important; }
      `}</style>
    </div>
  )
}
