'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function OrderDetail() {
  const { id } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' })
        const data = await res.json()
        if (data.ok && Array.isArray(data.orders)) {
          const found = data.orders.find(order => order.id === id)
          if (found) {
            setOrderData(found)
            setLoading(false)
            return
          }
        }
      } catch (error) {
        console.error('Error cargando pedido:', error)
      }

      const storedOrders = localStorage.getItem('orders')
      if (storedOrders) {
        const orders = JSON.parse(storedOrders)
        const found = orders.find(order => order.id === id)
        if (found) {
          setOrderData(found)
        }
      }
      setLoading(false)
    }

    if (id) {
      loadOrder()
    }
  }, [id])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando pedido...</div>
  }

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pedido no encontrado</h1>
          <a href="/admin/orders" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Volver a Pedidos</a>
        </div>
        <p className="text-gray-600">No se encontró información para el pedido #{id}.</p>
      </div>
    )
  }

  const hasPhysical = (orderData.physical || 0) > 0
  const hasDigital = (orderData.digital || 0) > 0
  const orderType = hasPhysical && hasDigital
    ? 'Libro Físico + Digital'
    : hasPhysical
      ? 'Libro Físico'
      : 'Libro Digital'

  const statusLabel = orderData.status === 'approved'
    ? 'Aprobado'
    : orderData.status === 'pending'
      ? 'Pendiente'
      : orderData.status === 'processing'
        ? 'Procesando'
        : orderData.status === 'shipped'
          ? 'Enviado'
          : orderData.status === 'delivered'
            ? 'Entregado'
            : orderData.status || 'Pendiente'

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalle del Pedido #{id}</h1>
        <a href="/admin/orders" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Volver a Pedidos</a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Información del pedido */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Información del Pedido</h2>
          <div className="space-y-2">
            <p><strong>ID:</strong> {orderData.id}</p>
            <p><strong>Cliente:</strong> {orderData.shipping?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {orderData.shipping?.email || 'N/A'}</p>
            <p><strong>Tipo:</strong> {orderType}</p>
            <p><strong>Estado:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                statusLabel === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                statusLabel === 'Procesando' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {statusLabel}
              </span>
            </p>
            <p><strong>Fecha:</strong> {orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : 'N/A'}</p>
            <p><strong>Precio:</strong> ${Number(orderData.total || 0).toFixed(2)}</p>
            {hasPhysical && (
              <p><strong>Dirección:</strong> {orderData.shipping?.address || 'N/A'}, {orderData.shipping?.city || 'N/A'}, {orderData.shipping?.postalCode || 'N/A'}, {orderData.shipping?.country || 'N/A'}</p>
            )}
            <p><strong>Notas:</strong> {orderData.notes || 'N/A'}</p>
          </div>
        </div>

        {/* Acciones del pedido */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Acciones</h2>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              Cambiar Estado
            </button>
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600">
              Enviar Confirmación por Email
            </button>
            <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600">
              Generar Factura
            </button>
            <button className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
              Cancelar Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Historial del pedido */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Historial del Pedido</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b">
            <span>{orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : 'Fecha desconocida'} - Pedido creado</span>
            <span className="text-sm text-gray-500">Sistema</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>{orderData.status === 'approved' ? 'Pago confirmado' : 'Pago en proceso'}</span>
            <span className="text-sm text-gray-500">Sistema</span>
          </div>
          {/* Más entradas del historial */}
        </div>
      </div>
    </div>
  )
}
