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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
            <div className="space-x-4">
              <Link href="/admin/inventory" className="text-blue-600 hover:text-blue-800">Inventario</Link>
              <Link href="/admin/orders" className="text-blue-600 hover:text-blue-800">Pedidos</Link>
              <Link href="/admin/tickets" className="text-blue-600 hover:text-blue-800">Tickets</Link>
              <Link href="/admin/change-password" className="text-blue-600 hover:text-blue-800">Cambiar Contraseña</Link>
              <button
                onClick={() => {
                  localStorage.removeItem('authenticated')
                  router.push('/admin/login')
                }}
                className="text-red-600 hover:text-red-800"
              >
                Cerrar Sesión
              </button>
              <Link href="/" className="text-gray-600 hover:text-gray-800">Volver al sitio</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
