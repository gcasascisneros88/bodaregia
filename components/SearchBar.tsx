'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter()
  const [q, setQ] = useState(initialValue)

  const buscar = () => {
    const term = q.trim()
    if (term) router.push(`/buscar?q=${encodeURIComponent(term)}`)
  }

  return (
    <div style={{
      display: 'flex',
      background: 'white',
      borderRadius: 48,
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
      maxWidth: 580,
      margin: '0 auto',
    }}>
      <span style={{ padding: '0 16px 0 20px', display: 'flex', alignItems: 'center', fontSize: 20 }}>🔍</span>
      <input
        type="text"
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && buscar()}
        placeholder="Busca fotógrafos, salones, pastelerías..."
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: 15,
          color: 'var(--foreground)',
          padding: '16px 0',
          background: 'transparent',
          fontFamily: 'var(--font-sans)',
        }}
      />
      <button
        onClick={buscar}
        style={{
          background: 'var(--gold)',
          color: 'white',
          border: 'none',
          padding: '0 28px',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Buscar
      </button>
    </div>
  )
}
