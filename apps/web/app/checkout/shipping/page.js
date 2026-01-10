'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Shipping() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('México')
  const [order, setOrder] = useState(null)
  const router = useRouter()

  useEffect(() => {
    // Cargar la orden actual
    const currentOrder = localStorage.getItem('currentOrder')
    if (currentOrder) {
      setOrder(JSON.parse(currentOrder))
    } else {
      // Si no hay orden, redirigir al checkout
      router.push('/checkout')
    }
  }, [router])

  const generateOrderId = () => {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !email || !address || !city || !postalCode) return

    const orderId = generateOrderId()
    const shippingInfo = {
      name,
      email,
      address,
      city,
      postalCode,
      country
    }

    const completeOrder = {
      id: orderId,
      ...order,
      shipping: shippingInfo,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    // Guardar en localStorage (simulando base de datos)
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    existingOrders.push(completeOrder)
    localStorage.setItem('orders', JSON.stringify(existingOrders))

    // Limpiar orden actual
    localStorage.removeItem('currentOrder')

    // Guardar información para el popup de confirmación
    localStorage.setItem('orderConfirmed', JSON.stringify({ name, email }))

    // Redirigir a la página principal
    router.push('/')
  }

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

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
        <h1 className="text-3xl font-bold mb-8 text-center">Información de Envío</h1>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {/* Resumen de la orden */}
          <div className="mb-8 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-4">Resumen de tu pedido</h2>
            <div className="space-y-2">
              <p><strong>Libro Físico:</strong> {order.physical} unidades</p>
              <p><strong>Libro Digital:</strong> {order.digital} unidades</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Dirección de Envío</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                  placeholder="Ingresa tu dirección completa (usa el mapa para autocompletar)"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">💡 Usa el mapa interactivo para encontrar tu dirección exacta</p>
                {/* Aquí iría el mapa - por simplicidad, solo un placeholder */}
                <div className="mt-2 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <p className="text-gray-500">Mapa interactivo (simulado)</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                  placeholder="Ciudad"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Código Postal</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                  placeholder="Código Postal"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">País</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded"
                >
                  <option value="México">México</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Canadá">Canadá</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-600 transition"
            >
              Confirmar Pedido
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}