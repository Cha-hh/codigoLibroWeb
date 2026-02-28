export const dynamic = 'force-dynamic'

import { CheckoutRedirectClient } from './client'

export default function CheckoutRedirectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium">Admin</a>
              <a href="/" className="text-gray-700 hover:text-gray-800 font-medium">Libro</a>
            </div>
          </div>
        </div>
      </nav>

      <CheckoutRedirectClient />
    </div>
  )
}
