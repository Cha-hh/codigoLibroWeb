import { Suspense } from 'react'
import { CheckoutRedirectClient } from './client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CheckoutRedirectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <Link href="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium">Admin</Link>
              <Link href="/" className="text-gray-700 hover:text-gray-800 font-medium">Libro</Link>
            </div>
          </div>
        </div>
      </nav>

      <Suspense fallback={<div className="p-8 text-center">Cargando…</div>}>
        <CheckoutRedirectClient />
      </Suspense>
    </div>
  )
}
