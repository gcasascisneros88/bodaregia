'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toggleVerificado, toggleActivo, agregarProveedor, logout } from './actions'

type Proveedor = {
  id: string
  nombre: string
  municipio: string | null
  verificado: boolean
  activo: boolean
  score_total?: number | null
  categoria?: string | null
}

type Categoria = { id: string; nombre: string }

export default function AdminPanel({
  proveedores: initial,
  categorias,
  comentariosPendientes,
}: {
  proveedores: Proveedor[]
  categorias: Categoria[]
  comentariosPendientes: number
}) {
  const router = useRouter()
  const [proveedores, setProveedores] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleToggleVerificado = (id: string, actual: boolean) => {
    startTransition(async () => {
      await toggleVerificado(id, actual)
      setProveedores(ps => ps.map(p => p.id === id ? { ...p, verificado: !actual } : p))
    })
  }

  const handleToggleActivo = (id: string, actual: boolean) => {
    startTransition(async () => {
      await toggleActivo(id, actual)
      setProveedores(ps => ps.map(p => p.id === id ? { ...p, activo: !actual } : p))
    })
  }

  const handleAgregarProveedor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    const formData = new FormData(e.currentTarget)
    const result = await agregarProveedor(formData)
    if (result?.error) {
      setFormError(result.error)
    } else {
      setShowForm(false)
      router.refresh()
    }
  }

  const badge = (text: string, color: string, bg: string) => (
    <span style={{ background: bg, color, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{text}</span>
  )

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>

      {/* Navbar */}
      <nav style={{
        background: 'white', borderBottom: '1px solid var(--cream-dark)',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 8px rgba(196,118,58,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>
            Boda<span style={{ color: 'var(--gold)' }}>Regia</span>
            <span style={{ fontSize: 13, fontWeight: 400, color: '#888', marginLeft: 10 }}>Admin</span>
          </span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <a href="/" style={{ color: '#888', textDecoration: 'none', fontSize: 14 }}>← Ver sitio</a>
            <form action={logout}>
              <button type="submit" style={{ background: 'none', border: '1.5px solid var(--cream-dark)', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#666' }}>
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total proveedores', value: proveedores.length },
            { label: 'Verificados', value: proveedores.filter(p => p.verificado).length },
            { label: 'Activos', value: proveedores.filter(p => p.activo).length },
            { label: 'Comentarios pendientes', value: comentariosPendientes, alert: comentariosPendientes > 0 },
          ].map(({ label, value, alert }) => (
            <div key={label} style={{
              background: 'white', borderRadius: 14, padding: '20px 24px',
              border: `1.5px solid ${alert ? '#FFC107' : 'var(--cream-dark)'}`,
            }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 700, color: alert ? '#C4763A' : 'var(--gold)' }}>{value}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Header + botón agregar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
            Proveedores
          </h2>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              background: 'var(--gold)', color: 'white', border: 'none',
              borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            {showForm ? '✕ Cancelar' : '+ Agregar proveedor'}
          </button>
        </div>

        {/* Formulario agregar */}
        {showForm && (
          <form onSubmit={handleAgregarProveedor} style={{
            background: 'white', borderRadius: 16, padding: '28px 28px',
            border: '1.5px solid var(--cream-dark)', marginBottom: 24,
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16,
          }}>
            {[
              { name: 'nombre', placeholder: 'Nombre del negocio', required: true },
              { name: 'slug', placeholder: 'slug-url (ej: foto-monterrey)', required: true },
              { name: 'municipio', placeholder: 'Municipio', required: false },
              { name: 'whatsapp', placeholder: 'WhatsApp (10 dígitos)', required: false },
            ].map(({ name, placeholder, required }) => (
              <input
                key={name}
                name={name}
                placeholder={placeholder}
                required={required}
                style={{
                  border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                  padding: '10px 14px', fontSize: 14, outline: 'none',
                  fontFamily: 'var(--font-sans)', color: 'var(--foreground)',
                }}
              />
            ))}
            <select
              name="categoria_id"
              style={{
                border: '1.5px solid var(--cream-dark)', borderRadius: 8,
                padding: '10px 14px', fontSize: 14, outline: 'none',
                fontFamily: 'var(--font-sans)', color: 'var(--foreground)', background: 'white',
              }}
            >
              <option value="">Sin categoría</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {formError && <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{formError}</p>}
              <button
                type="submit"
                style={{
                  background: 'var(--gold)', color: 'white', border: 'none',
                  borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                }}
              >
                Guardar proveedor
              </button>
            </div>
          </form>
        )}

        {/* Tabla */}
        <div style={{ background: 'white', borderRadius: 16, border: '1.5px solid var(--cream-dark)', overflow: 'hidden' }}>
          {proveedores.length === 0 ? (
            <p style={{ padding: '40px', textAlign: 'center', color: '#888' }}>No hay proveedores aún.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid var(--cream-dark)', background: 'var(--cream)' }}>
                    {['Nombre', 'Categoría', 'Municipio', 'Score', 'Verificado', 'Activo', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#555', fontSize: 13 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < proveedores.length - 1 ? '1px solid var(--cream-dark)' : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--foreground)' }}>
                        <a href={`/proveedor/${p.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{p.nombre}</a>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#666' }}>{p.categoria ?? '—'}</td>
                      <td style={{ padding: '14px 16px', color: '#666' }}>{p.municipio ?? '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.score_total != null
                          ? <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--gold)', fontSize: 16 }}>{p.score_total.toFixed(1)}</span>
                          : <span style={{ color: '#ccc' }}>—</span>
                        }
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.verificado ? badge('✓ Sí', '#C4763A', '#FFF3E8') : badge('No', '#888', '#f5f5f5')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {p.activo ? badge('Activo', '#15803d', '#f0fdf4') : badge('Inactivo', '#ef4444', '#fef2f2')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            disabled={isPending}
                            onClick={() => handleToggleVerificado(p.id, p.verificado)}
                            style={{
                              border: '1.5px solid var(--cream-dark)', borderRadius: 7,
                              padding: '5px 10px', fontSize: 12, cursor: 'pointer',
                              background: 'white', color: 'var(--foreground)', fontFamily: 'var(--font-sans)',
                            }}
                          >
                            {p.verificado ? 'Desverificar' : 'Verificar'}
                          </button>
                          <button
                            disabled={isPending}
                            onClick={() => handleToggleActivo(p.id, p.activo)}
                            style={{
                              border: '1.5px solid var(--cream-dark)', borderRadius: 7,
                              padding: '5px 10px', fontSize: 12, cursor: 'pointer',
                              background: 'white', color: p.activo ? '#ef4444' : '#15803d', fontFamily: 'var(--font-sans)',
                            }}
                          >
                            {p.activo ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
