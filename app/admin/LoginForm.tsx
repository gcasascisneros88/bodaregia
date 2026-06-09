'use client'

import { useActionState } from 'react'
import { login } from './actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState(
    async (_: any, formData: FormData) => login(formData),
    null,
  )

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--cream)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{
        background: 'white', borderRadius: 20, padding: '48px 40px',
        border: '1.5px solid var(--cream-dark)', width: '100%', maxWidth: 380,
        boxShadow: '0 4px 24px rgba(196,118,58,0.1)',
      }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: 'var(--foreground)' }}>
          Boda<span style={{ color: 'var(--gold)' }}>Regia</span>
        </p>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 14, marginBottom: 32 }}>Panel de administración</p>

        <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            style={{
              border: '1.5px solid var(--cream-dark)', borderRadius: 10,
              padding: '12px 16px', fontSize: 15, outline: 'none',
              fontFamily: 'var(--font-sans)', color: 'var(--foreground)',
              background: 'var(--cream)',
            }}
          />
          {state?.error && (
            <p style={{ color: '#ef4444', fontSize: 13, margin: 0 }}>{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            style={{
              background: 'var(--gold)', color: 'white', border: 'none',
              borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600,
              cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.7 : 1,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {pending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
