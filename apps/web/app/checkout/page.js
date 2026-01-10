'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Checkout() {
  const [physicalQuantity, setPhysicalQuantity] = useState(1)
  const [digitalQuantity, setDigitalQuantity] = useState(0)
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí podrías guardar la selección en localStorage o enviar a una API
    const order = {
      physical: physicalQuantity,
      digital: digitalQuantity,
      total: (physicalQuantity * 20) + (digitalQuantity * 10) // Precios de ejemplo
    }
    localStorage.setItem('currentOrder', JSON.stringify(order))
    // Redirigir a la página de envío
    router.push('/checkout/shipping')
  }

  const total = (physicalQuantity * 20) + (digitalQuantity * 10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium">Admin</a>
              <a href="/" className="text-gray-700 hover:text-gray-800 font-medium">Libro</a>
              <a href="#" className="text-gray-700 hover:text-gray-800 font-medium">Monturas</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit}>
            {/* Libro Físico */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Libro Físico</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Precio: $20.00</p>
                  <p className="text-sm text-gray-500">Envío incluido</p>
                </div>
                <div className="flex items-center">
                  <label className="mr-2">Cantidad:</label>
                  <input
                    type="number"
                    value={physicalQuantity}
                    onChange={(e) => setPhysicalQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-20 p-2 border border-gray-300 rounded text-center"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Libro Digital */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Libro Digital</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Precio: $10.00</p>
                  <p className="text-sm text-gray-500">Descarga inmediata - Máximo 1 por usuario</p>
                </div>
                <div className="flex items-center">
                  <label className="mr-2">Cantidad:</label>
                  <input
                    type="number"
                    value={digitalQuantity}
                    onChange={(e) => setDigitalQuantity(Math.min(1, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 p-2 border border-gray-300 rounded text-center"
                    min="0"
                    max="1"
                  />
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botón de compra */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
              disabled={physicalQuantity === 0 && digitalQuantity === 0}
            >
              Proceder al Pago
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}