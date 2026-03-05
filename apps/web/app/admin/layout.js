'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('authenticated') === 'true'
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [router, pathname])

  if (pathname === '/admin/login') {
    return children
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

      <nav className="relative z-10 bg-black/70 backdrop-blur-md shadow-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
            <h1 className="font-sans text-xs font-medium text-gray-300 uppercase tracking-[0.2em]">Panel de Administración</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs tracking-[0.2em] uppercase">
              <Link href="/admin/inventory" className="text-gray-300 hover:text-gray-100 transition">Inventario</Link>
              <Link href="/admin/orders" className="text-gray-300 hover:text-gray-100 transition">Pedidos</Link>
              <Link href="/admin/tickets" className="text-gray-300 hover:text-gray-100 transition">Preguntas</Link>
              <Link href="/admin/change-password" className="text-gray-300 hover:text-gray-100 transition">Cambiar Contraseña</Link>
              <button
                onClick={() => {
                  localStorage.removeItem('authenticated')
                  router.push('/admin/login')
                }}
                className="text-gray-300 hover:text-gray-100 transition"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
