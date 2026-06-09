'use client'

import { useState } from 'react'

export default function NotifyForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(email.trim())) {
      setError(true)
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{
        textAlign: 'center', padding: '14px 20px',
        background: '#EAF3DE', border: '1px solid #97C459',
        borderRadius: 8, fontSize: 13, color: '#27500A',
        maxWidth: 420, margin: '0 auto',
      }}>
        ✓ Listo — te avisamos en septiembre. ¡Gracias!
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto 16px', flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="tu@correo.com"
          style={{
            flex: 1, minWidth: 0,
            padding: '12px 16px',
            border: `1px solid ${error ? '#A32D2D' : 'var(--border)'}`,
            borderRadius: 6,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 14,
            background: 'var(--white)',
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '12px 24px',
            background: 'var(--gold)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 6,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Avísame
        </button>
      </div>
      <p style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.3px', textAlign: 'center' }}>
        Sin spam. Solo un correo cuando abramos.
      </p>
    </>
  )
}
