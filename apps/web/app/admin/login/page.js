'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Credenciales hardcoded para demo
    if (username === 'admin' && password === 'admin') {
      localStorage.setItem('authenticated', 'true')
      router.push('/admin/tickets')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div
      className="relative min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #106069ff 0%, #074B54ff 25%, #0A323Bff 50%, #0B1C1Fff 75%, #000000 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22 seed=%221%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23000%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')",
          backgroundSize: '200px 200px',
        }}
      />

      <nav className="bg-black/70 backdrop-blur-md shadow-md fixed top-0 left-0 right-0 z-20 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <Link href="/" className="text-gray-400 hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">Libro</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-24 pb-10">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold mb-2 text-center text-gray-100 uppercase tracking-[0.2em]">Ingreso Admin</h1>
          <p className="text-center text-gray-300 text-xs tracking-[0.18em] uppercase mb-8">Panel de administración</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-200 text-xs tracking-[0.2em] uppercase mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                placeholder="Tu usuario"
                required
              />
            </div>

            <div>
              <label className="block text-gray-200 text-xs tracking-[0.2em] uppercase mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                placeholder="Tu contraseña"
                required
              />
            </div>

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <button type="submit" className="w-full bg-gray-800 text-white px-6 py-3 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
