'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Route, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Login failed')
        return
      }
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <Route size={32} className="text-indigo-500" />
          <h1 className="font-display text-3xl font-bold text-slate-100">Hazard Hunters</h1>
        </div>
        <p className="text-center text-slate-400">Enter a username to start reporting</p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="roadrunner42"
          className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          required
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full font-display">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Entering…' : 'Enter'}
        </Button>
      </form>
    </div>
  )
}
