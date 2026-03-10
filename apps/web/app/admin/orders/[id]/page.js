'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function OrderDetail() {
  const { id } = useParams()
  const [orderData, setOrderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nextStatus, setNextStatus] = useState('pending')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' })
        const data = await res.json()
        if (data.ok && Array.isArray(data.orders)) {
          const found = data.orders.find(order => order.id === id)
          if (found) {
            setOrderData(found)
            setNextStatus(found.fulfillmentStatus || found.status || 'pending')
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
          setNextStatus(found.fulfillmentStatus || found.status || 'pending')
        }
      }
      setLoading(false)
    }

    if (id) {
      loadOrder()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-2xl bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-3">Panel de Pedidos</p>
          <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-[0.2em] text-gray-100">Cargando pedido</h2>
          <p className="mt-3 text-sm text-gray-300">Estamos preparando la información del pedido seleccionado.</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-3xl bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
            <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-[0.2em] text-gray-100">Pedido no encontrado</h1>
            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/30 px-5 py-2 text-xs tracking-[0.18em] uppercase text-gray-200 hover:bg-black/45 transition"
            >
              Volver a Pedidos
            </Link>
          </div>
          <p className="text-gray-300">No se encontró información para el pedido <span className="font-mono text-xs tracking-[0.08em]">{id}</span>.</p>
        </div>
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

  const currentFulfillmentStatus = orderData.fulfillmentStatus || orderData.status
  const statusLabel = currentFulfillmentStatus === 'pending'
    ? 'Pendiente'
    : currentFulfillmentStatus === 'processing'
      ? 'Procesando'
      : currentFulfillmentStatus === 'shipped'
        ? 'Enviado'
        : currentFulfillmentStatus === 'delivered'
          ? 'Entregado'
          : currentFulfillmentStatus || 'Pendiente'

  const statusClasses = statusLabel === 'Pendiente'
    ? 'bg-white/10 text-gray-200 border border-white/20'
    : statusLabel === 'Procesando'
      ? 'bg-white/20 text-white border border-white/25'
      : statusLabel === 'Enviado'
        ? 'bg-white/15 text-gray-100 border border-white/20'
        : 'bg-black/30 text-gray-300 border border-white/10'

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'processing': return 'Procesando'
      case 'shipped': return 'Enviado'
      case 'delivered': return 'Entregado'
      default: return status || 'Pendiente'
    }
  }

  const getPaymentLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado'
      case 'pending': return 'Pendiente'
      case 'in_process': return 'En proceso'
      case 'rejected': return 'Rechazado'
      case 'cancelled': return 'Cancelado'
      case 'refunded': return 'Reembolsado'
      case 'charged_back': return 'Contracargo'
      case 'in_mediation': return 'En mediación'
      case 'authorized': return 'Autorizado'
      default: return status || 'Pendiente'
    }
  }

  const handleChangeStatus = async () => {
    if (!orderData?.id || !nextStatus || nextStatus === (orderData.fulfillmentStatus || orderData.status)) return

    setIsUpdatingStatus(true)
    let updatedOk = false
    const historyEntry = {
      at: new Date().toISOString(),
      action: 'status_change',
      fromStatus: orderData.fulfillmentStatus || orderData.status || 'pending',
      toStatus: nextStatus,
      by: 'Admin'
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderData.id, fulfillmentStatus: nextStatus, historyEntry })
      })
      const data = await res.json()
      if (data.ok) {
        setOrderData(prev => ({
          ...prev,
          fulfillmentStatus: nextStatus,
          status: nextStatus,
          statusHistory: [...(Array.isArray(prev?.statusHistory) ? prev.statusHistory : []), historyEntry]
        }))
        updatedOk = true
      }
    } catch (error) {
      console.error('Error actualizando estado:', error)
    } finally {
      if (updatedOk) {
        const storedOrders = localStorage.getItem('orders')
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders)
          const updated = parsed.map((order) =>
            order.id === orderData.id
              ? {
                  ...order,
                  fulfillmentStatus: nextStatus,
                  status: nextStatus,
                  statusHistory: [...(Array.isArray(order.statusHistory) ? order.statusHistory : []), historyEntry]
                }
              : order
          )
          localStorage.setItem('orders', JSON.stringify(updated))
        }
      }
      setIsUpdatingStatus(false)
    }
  }

  const statusHistory = Array.isArray(orderData.statusHistory) ? orderData.statusHistory : []

  return (
    <div className="min-h-[70vh] py-4 text-gray-100">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold uppercase tracking-[0.22em]">Detalle del Pedido</h1>
          <p className="mt-2 text-xs md:text-sm text-gray-300 tracking-[0.12em] uppercase">Vista completa del pedido y su historial</p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/30 px-5 py-2 text-xs tracking-[0.18em] uppercase text-gray-200 hover:bg-black/45 transition"
        >
          Volver a Pedidos
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Información del pedido */}
        <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
          <h2 className="text-lg font-semibold mb-5 uppercase tracking-[0.16em] text-gray-100">Información del Pedido</h2>
          <div className="space-y-3 text-sm text-gray-200">
            <p>
              <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">ID:</span>
              <span className="font-mono text-xs tracking-[0.08em] break-all">{orderData.id}</span>
            </p>
            <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Cliente:</span>{orderData.shipping?.name || 'N/A'}</p>
            <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Email:</span>{orderData.shipping?.email || 'N/A'}</p>
            <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Tipo:</span>{orderType}</p>
            <p>
              <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Estado:</span>
              <span className={`ml-1 px-3 py-1 rounded-full text-xs uppercase tracking-[0.14em] ${statusClasses}`}>{statusLabel}</span>
            </p>
            <p>
              <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Pago:</span>
              <span className="text-gray-200">{getPaymentLabel(orderData.paymentStatus)}</span>
            </p>
            <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Fecha:</span>{orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : 'N/A'}</p>
            <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Precio:</span>${Number(orderData.total || 0).toFixed(2)}</p>
            {hasPhysical && (
              <div>
                <p>
                  <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Direccion:</span>
                  {orderData.shipping?.address || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Calle:</span>
                  {orderData.shipping?.street || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Numero Exterior:</span>
                  {orderData.shipping?.externalNumber || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Numero Interior:</span>
                  {orderData.shipping?.internalNumber || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Ubicacion:</span>
                  {orderData.shipping?.colony || 'N/A'}, {orderData.shipping?.municipality || 'N/A'}, {orderData.shipping?.city || 'N/A'}, {orderData.shipping?.postalCode || 'N/A'}, {orderData.shipping?.country || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-400 uppercase tracking-[0.12em] mr-2">Referencias:</span>
                  {orderData.shipping?.references || 'N/A'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Acciones del pedido */}
        <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
          <h2 className="text-lg font-semibold mb-5 uppercase tracking-[0.16em] text-gray-100">Acciones</h2>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-[0.14em] text-gray-400">Cambiar estado</label>
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                className="w-full bg-black/30 border border-white/20 text-gray-100 rounded-xl px-3 py-2 text-xs tracking-[0.12em] uppercase focus:outline-none focus:ring-2 focus:ring-gray-400/60"
              >
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
              </select>
              <button
                onClick={handleChangeStatus}
                disabled={isUpdatingStatus || nextStatus === (orderData.fulfillmentStatus || orderData.status)}
                className="w-full bg-black/35 border border-white/15 text-gray-100 py-2 px-4 rounded-xl hover:bg-black/50 transition text-xs tracking-[0.14em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus ? 'Guardando...' : 'Actualizar estado'}
              </button>
            </div>
            <button className="w-full bg-black/35 border border-white/15 text-gray-100 py-2 px-4 rounded-xl hover:bg-black/50 transition text-xs tracking-[0.14em] uppercase">
              Enviar Confirmación por Email
            </button>
          </div>
        </div>
      </div>

      {/* Historial del pedido */}
      <div className="mt-6 bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
        <h2 className="text-lg font-semibold mb-4 uppercase tracking-[0.16em] text-gray-100">Historial del Pedido</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-sm text-gray-200">{orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : 'Fecha desconocida'} - Pedido creado</span>
            <span className="text-xs uppercase tracking-[0.12em] text-gray-400">Sistema</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-sm text-gray-200">{orderData.paymentStatus === 'approved' ? 'Pago confirmado' : 'Pago en proceso'}</span>
            <span className="text-xs uppercase tracking-[0.12em] text-gray-400">Sistema</span>
          </div>
          {statusHistory
            .slice()
            .sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime())
            .map((entry, index) => (
              <div key={`${entry.at || 'hist'}-${index}`} className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-sm text-gray-200">
                  {entry.at ? new Date(entry.at).toLocaleString() : 'Fecha desconocida'} - Estado cambiado de {getStatusLabel(entry.fromStatus)} a {getStatusLabel(entry.toStatus)}
                </span>
                <span className="text-xs uppercase tracking-[0.12em] text-gray-400">{entry.by || 'Admin'}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
