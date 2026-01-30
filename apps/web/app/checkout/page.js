                                                    'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Checkout() {
  const [physicalQuantity, setPhysicalQuantity] = useState(1)
  const [digitalQuantity, setDigitalQuantity] = useState(0)
  const [stock, setStock] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mpStatus, setMpStatus] = useState({ ok: true, message: '' })
  const router = useRouter()

  useEffect(() => {
    // Cargar stock disponible
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => setStock(data.book?.quantity || 0))
      .catch(() => setStock(0))

    // Validar configuración de Mercado Pago
    fetch('/api/payment/health')
      .then(res => res.json())
      .then(data => {
        if (!data.ok) {
          setMpStatus({ ok: false, message: data.error || 'Mercado Pago no está configurado' })
        }
      })
      .catch(() => {
        setMpStatus({ ok: false, message: 'No se pudo validar Mercado Pago' })
      })
  }, [])

  const generateOrderId = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar que haya al menos un producto seleccionado
    if (physicalQuantity === 0 && digitalQuantity === 0) {
      alert('Por favor, selecciona al menos un producto')
      return
    }

    // Verificar stock antes de proceder
    if (physicalQuantity > 0) {
      try {
        const stockRes = await fetch('/api/stock')
        const stock = await stockRes.json()
        const availableStock = stock.book?.quantity || 0
        if (physicalQuantity > availableStock) {
          alert(`No hay suficiente stock. Disponible: ${availableStock} unidades.`)
          return
        }
      } catch (error) {
        console.error('Error al verificar stock:', error)
        alert('Error al verificar stock. Inténtalo de nuevo.')
        return
      }
    }

    setLoading(true)

    try {
      const orderId = generateOrderId()
      const total = (physicalQuantity * 20) + (digitalQuantity * 10)

      const order = {
        physical: physicalQuantity,
        digital: digitalQuantity,
        total: total
      }

      // Guardar orden temporal en localStorage
      localStorage.setItem('currentOrder', JSON.stringify(order))
      localStorage.setItem('currentOrderId', orderId)

      // Redirigir según tipo de pedido
      if (physicalQuantity === 0 && digitalQuantity > 0) {
        router.push('/checkout/digital')
      } else {
        router.push('/checkout/shipping')
      }
    } catch (error) {
      console.error('Error al preparar la orden:', error)
      alert('Error al preparar la orden. Por favor, intenta de nuevo.')
      setLoading(false)
    }
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
        <h1 className="text-3xl font-bold mb-8 text-center">Carrito</h1>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {!mpStatus.ok && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
              {mpStatus.message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* Libro Físico */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Libro Físico</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Precio: $20.00</p>
                  <p className="text-sm text-gray-500">Envío incluido</p>
                  <p className="text-sm text-blue-600">Stock disponible: {stock} unidades</p>
                </div>
                <div className="flex items-center">
                  <label className="mr-2">Cantidad:</label>
                  <input
                    type="number"
                    value={physicalQuantity}
                    onChange={(e) => setPhysicalQuantity(Math.max(0, Math.min(stock, parseInt(e.target.value) || 0)))}
                    className="w-20 p-2 border border-gray-300 rounded text-center"
                    min="0"
                    max={stock}
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
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400"
              disabled={physicalQuantity === 0 && digitalQuantity === 0 || physicalQuantity > stock || loading}
            >
              {loading ? 'Procesando...' : physicalQuantity > stock ? 'Stock insuficiente' : 'Continuar al envío'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}