'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const PHYSICAL_PRICE = 450
const DIGITAL_PRICE = 300

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
      const total = (physicalQuantity * PHYSICAL_PRICE) + (digitalQuantity * DIGITAL_PRICE)

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

  const total = (physicalQuantity * PHYSICAL_PRICE) + (digitalQuantity * DIGITAL_PRICE)

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 55%, #d1d5db 100%)' }}
    >
      {/* Navbar */}
      <nav className="bg-black/70 backdrop-blur-md shadow-md border-b border-black/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <Link href="/" className="text-gray-200 hover:text-white text-xs tracking-[0.25em] transition uppercase">Volver al Libro</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-[0.2em]">Carrito</h1>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="md:w-1/2 flex-shrink-0 flex justify-center">
              <Image
                src="/images/MockupLibro.jpg"
                alt="Libro"
                width={500}
                height={700}
                className="w-full max-w-sm md:max-w-md h-auto rounded-lg shadow"
                priority
              />
            </div>
            <div className="md:w-1/2">
              {!mpStatus.ok && (
                <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
                  {mpStatus.message}
                </div>
              )}
              <form onSubmit={handleSubmit}>
            {/* Libro Físico */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 uppercase tracking-[0.14em]">Libro Físico</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Precio: $450.00</p>
                  <p className="text-sm text-gray-500">Envío nacional incluido</p>
                  <p className="text-sm text-gray-600">Stock disponible: {stock} unidades</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="mr-2 text-xs uppercase tracking-[0.16em] text-gray-700">Cantidad:</label>
                  <input
                    type="number"
                    value={physicalQuantity}
                    onChange={(e) => setPhysicalQuantity(Math.max(0, Math.min(stock, parseInt(e.target.value) || 0)))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                    min="0"
                    max={stock}
                  />
                </div>
              </div>
            </div>

            {/* Libro Digital */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 uppercase tracking-[0.14em]">Libro Digital</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">Precio: $300.00</p>
                  <p className="text-sm text-gray-500">Descarga inmediata - Máximo 1 por usuario</p>
                </div>
                <div className="flex items-center">
                  <label className="mr-2 text-xs uppercase tracking-[0.16em] text-gray-700">Cantidad:</label>
                  <input
                    type="number"
                    value={digitalQuantity}
                    onChange={(e) => setDigitalQuantity(Math.min(1, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
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
              className="w-full bg-gray-800 text-white py-3 px-6 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={physicalQuantity === 0 && digitalQuantity === 0 || physicalQuantity > stock || loading}
            >
              {loading ? 'Procesando...' : physicalQuantity > stock ? 'Stock insuficiente' : 'Continuar al envío'}
            </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
