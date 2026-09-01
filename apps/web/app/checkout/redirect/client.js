'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function CheckoutRedirectClient() {
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Procesando tu pago...')
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(searchParamsString)
      const type = params.get('type')
      const paymentId = params.get('payment_id') || params.get('collection_id')
      const orderId = params.get('orderId') || params.get('external_reference')
      const merchantOrderId = params.get('merchant_order_id')
      const statusParam =
        params.get('status') ||
        params.get('collection_status') ||
        params.get('payment_status') ||
        type

      try {
        if (statusParam === 'approved' || statusParam === 'success') {
          const currentOrder = localStorage.getItem('currentOrder')
          const currentOrderId = localStorage.getItem('currentOrderId')
          const resolvedOrderId = currentOrderId || orderId
          const order = currentOrder ? JSON.parse(currentOrder) : null

          const confirmResponse = await fetch('/api/payment-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId,
              merchantOrderId,
              orderId: resolvedOrderId,
              order: order ? { ...order, id: resolvedOrderId } : undefined
            })
          })

          const confirmData = await confirmResponse.json()

          if (confirmData.success) {
            setStatus('approved')
            setMessage('¡Pago aprobado exitosamente!')

            if (order) {
              const completedOrder = {
                id: resolvedOrderId,
                ...order,
                paymentId: paymentId || confirmData.paymentId,
                paymentStatus: 'approved',
                createdAt: new Date().toISOString()
              }

              const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
              existingOrders.push(completedOrder)
              localStorage.setItem('orders', JSON.stringify(existingOrders))

              if (order.shipping?.name && order.shipping?.email) {
                localStorage.setItem(
                  'orderConfirmed',
                  JSON.stringify({ name: order.shipping.name, email: order.shipping.email })
                )
              }

              localStorage.removeItem('currentOrder')
              localStorage.removeItem('currentOrderId')
            }

            setTimeout(() => router.push('/'), 500)
          } else {
            setStatus('declined')
            setMessage(confirmData?.message || 'El pago no fue aprobado. Por favor, intenta de nuevo.')
          }
        } else if (statusParam === 'failure' || statusParam === 'rejected') {
          setStatus('declined')
          setMessage('Tu pago fue rechazado. Por favor, intenta con otro método de pago.')
        } else if (statusParam === 'pending' || statusParam === 'in_process') {
          setStatus('pending')
          setMessage('Tu pago está pendiente de confirmación. Te notificaremos cuando sea procesado.')
        } else if (!statusParam) {
          setStatus('error')
          setMessage('No se recibió el estado del pago. Por favor, intenta de nuevo.')
        }
      } catch (error) {
        console.error('Error procesando pago:', error)
        setStatus('error')
        setMessage('Error al procesar el pago. Por favor, contacta al soporte.')
      }
    }

    processPayment()
  }, [router, searchParamsString])

  const primaryButtonClass =
    'bg-gray-800 text-white py-3 px-10 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase font-semibold'
  const secondaryButtonClass =
    'border border-gray-800 text-gray-800 py-3 px-10 rounded-full text-xs tracking-[0.25em] hover:bg-gray-100 transition uppercase font-semibold'

  const toneClasses = {
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  const StatusIcon = ({ tone, path }) => (
    <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${toneClasses[tone]}`}>
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={path} clipRule="evenodd" />
      </svg>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mx-auto mb-6"></div>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'approved' && (
          <>
            <StatusIcon tone="green" path="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            <h1 className="text-2xl font-bold mb-4 uppercase tracking-[0.2em] text-gray-800">Pago Aprobado</h1>
            <p className="text-gray-500 mb-8">{message}</p>
            <button onClick={() => router.push('/')} className={primaryButtonClass}>
              Volver al inicio
            </button>
          </>
        )}

        {status === 'declined' && (
          <>
            <StatusIcon tone="red" path="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            <h1 className="text-2xl font-bold mb-4 uppercase tracking-[0.2em] text-gray-800">Pago Rechazado</h1>
            <p className="text-gray-500 mb-8">{message}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => router.push('/checkout')} className={primaryButtonClass}>
                Intentar de Nuevo
              </button>
              <button onClick={() => router.push('/')} className={secondaryButtonClass}>
                Volver al inicio
              </button>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <StatusIcon tone="amber" path="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
            <h1 className="text-2xl font-bold mb-4 uppercase tracking-[0.2em] text-gray-800">Pago Pendiente</h1>
            <p className="text-gray-500 mb-8">{message}</p>
            <button onClick={() => router.push('/')} className={primaryButtonClass}>
              Volver al inicio
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <StatusIcon tone="red" path="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
            <h1 className="text-2xl font-bold mb-4 uppercase tracking-[0.2em] text-gray-800">Error</h1>
            <p className="text-gray-500 mb-8">{message}</p>
            <button onClick={() => router.push('/')} className={primaryButtonClass}>
              Volver al inicio
            </button>
          </>
        )}
      </div>
    </div>
  )
}
