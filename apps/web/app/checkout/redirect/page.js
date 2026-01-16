'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function CheckoutRedirect() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Procesando tu pago...')
  const [showThankYouPopup, setShowThankYouPopup] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processPayment = async () => {
      const type = searchParams.get('type')
      const paymentId = searchParams.get('payment_id')
      const orderId = searchParams.get('external_reference')
      const merchantOrderId = searchParams.get('merchant_order_id')

      try {
        if (type === 'success' && paymentId) {
          // Obtener los datos de la orden guardados
          const currentOrder = localStorage.getItem('currentOrder')
          const currentOrderId = localStorage.getItem('currentOrderId')

          if (currentOrder) {
            const order = JSON.parse(currentOrder)

            // Confirmar pago con el backend
            const confirmResponse = await fetch('/api/payment-confirmation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: paymentId,
                orderId: currentOrderId || orderId,
                order: order
              })
            })

            const confirmData = await confirmResponse.json()

            if (confirmData.success) {
              setStatus('approved')
              setMessage('¡Pago aprobado exitosamente!')

              // Si es solo digital, mostrar popup de agradecimiento
              if (order.digital > 0 && order.physical === 0) {
                setShowThankYouPopup(true)
                localStorage.removeItem('currentOrder')
                localStorage.removeItem('currentOrderId')
              } else if (order.physical > 0) {
                // Si es físico, redirigir a envío después de 2 segundos
                setTimeout(() => {
                  router.push('/checkout/shipping')
                }, 2000)
              }
            } else {
              setStatus('declined')
              setMessage('El pago no fue aprobado. Por favor, intenta de nuevo.')
            }
          }
        } else if (type === 'failure') {
          setStatus('declined')
          setMessage('Tu pago fue rechazado. Por favor, intenta con otro método de pago.')
        } else if (type === 'pending') {
          setStatus('pending')
          setMessage('Tu pago está pendiente de confirmación. Te notificaremos cuando sea procesado.')
        }
      } catch (error) {
        console.error('Error procesando pago:', error)
        setStatus('error')
        setMessage('Error al procesar el pago. Por favor, contacta al soporte.')
      }
    }

    processPayment()
  }, [searchParams, router])

  const handleClosePopup = () => {
    setShowThankYouPopup(false)
    localStorage.removeItem('currentOrder')
    localStorage.removeItem('currentOrderId')
    router.push('/')
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
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-xl text-gray-700">{message}</p>
            </>
          )}

          {status === 'approved' && (
            <>
              <div className="text-green-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-700 mb-4">Pago Aprobado</h1>
              <p className="text-lg text-gray-700 mb-6">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Volver al inicio
              </button>
            </>
          )}

          {status === 'declined' && (
            <>
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-700 mb-4">Pago Rechazado</h1>
              <p className="text-lg text-gray-700 mb-6">{message}</p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/checkout')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Volver al inicio
                </button>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <div className="text-yellow-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-yellow-700 mb-4">Pago Pendiente</h1>
              <p className="text-lg text-gray-700 mb-6">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Volver al inicio
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-700 mb-4">Error</h1>
              <p className="text-lg text-gray-700 mb-6">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Volver al inicio
              </button>
            </>
          )}
        </div>
      </div>

      {/* Thank You Popup for Digital */}
      {showThankYouPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-auto text-center shadow-xl">
            <div className="text-green-500 mb-4">
              <svg
                className="w-20 h-20 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Gracias por tu compra!</h2>
            <p className="text-gray-600 mb-2">Tu libro digital está listo para descargar</p>
            <p className="text-sm text-gray-500 mb-6">En breve recibirás un correo con los detalles de descarga</p>
            <button
              onClick={handleClosePopup}
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}