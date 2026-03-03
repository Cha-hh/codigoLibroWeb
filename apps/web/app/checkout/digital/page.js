'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DigitalCheckout() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mpStatus, setMpStatus] = useState({ ok: true, message: '' })
  const router = useRouter()

  useEffect(() => {
    const currentOrder = localStorage.getItem('currentOrder')
    if (currentOrder) {
      const parsed = JSON.parse(currentOrder)
      if (parsed?.digital > 0 && parsed?.physical === 0) {
        setOrder(parsed)
      } else {
        router.push('/checkout')
      }
    } else {
      router.push('/checkout')
    }

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
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email) return

    if (!order) {
      router.push('/checkout')
      return
    }

    setLoading(true)

    const orderId = localStorage.getItem('currentOrderId')
      || ('ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase())

    const updatedOrder = {
      ...order,
      shipping: {
        name,
        email
      }
    }

    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder))
    localStorage.setItem('currentOrderId', orderId)

    try {
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          physical: updatedOrder.physical,
          digital: updatedOrder.digital,
          total: updatedOrder.total,
          orderId: orderId
        })
      })

      let paymentData = null
      try {
        paymentData = await paymentResponse.json()
      } catch (parseError) {
        paymentData = null
      }

      if (!paymentResponse.ok) {
        console.error('Error de API:', paymentData)
        throw new Error(paymentData?.error || 'Error al crear preferencia de pago')
      }

      const url = paymentData?.checkout_url
        || paymentData?.sandbox_init_point
        || paymentData?.init_point

      if (!url) throw new Error('No se obtuvo la URL de pago')
      window.location.href = url
    } catch (error) {
      console.error('Error al procesar pago:', error)
      alert('Error al procesar el pago. Por favor, intenta de nuevo.')
      setLoading(false)
    }
  }

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 55%, #d1d5db 100%)' }}
    >
      <nav className="bg-black/70 backdrop-blur-md shadow-md border-b border-black/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <Link href="/" className="text-gray-200 hover:text-white text-xs tracking-[0.25em] transition uppercase">Volver al Libro</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-[0.2em]">Datos para envío digital</h1>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {!mpStatus.ok && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
              {mpStatus.message}
            </div>
          )}
          <div className="mb-8 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-4 uppercase tracking-[0.14em]">Resumen de tu pedido</h2>
            <div className="space-y-2">
              <p><strong>Libro Digital:</strong> {order.digital} unidades</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-gray-800 text-white py-3 px-6 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
