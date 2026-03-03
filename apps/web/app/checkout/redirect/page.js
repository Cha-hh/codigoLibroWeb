import { Suspense } from 'react'
import { CheckoutRedirectClient } from './client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CheckoutRedirectPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 55%, #d1d5db 100%)' }}
    >
      {/* Navbar */}
      <nav className="bg-black/70 backdrop-blur-md shadow-md border-b border-black/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <div className="flex space-x-6">
              <Link href="/admin/login" className="text-gray-200 hover:text-white text-xs tracking-[0.25em] transition uppercase">Admin</Link>
              <Link href="/" className="text-gray-400 hover:text-gray-200 text-xs tracking-[0.25em] transition uppercase">Libro</Link>
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
