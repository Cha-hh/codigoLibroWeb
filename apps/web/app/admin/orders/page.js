'use client'

import { useState, useEffect } from 'react'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) {
        setOrders(data.orders || [])
        return
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error)
    }
    const storedOrders = localStorage.getItem('orders')
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus })
      })
      const data = await res.json()
      if (data.ok) {
        setOrders(prev => prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        return
      }
    } catch (error) {
      console.error('Error actualizando pedido:', error)
    }
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    )
    setOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
  }

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm('¿Eliminar este pedido entregado? Esta acción no se puede deshacer.')
    if (!confirmed) return

    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId })
      })
      const data = await res.json()
      if (data.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId))
        return
      }
    } catch (error) {
      console.error('Error eliminando pedido:', error)
    }

    const updatedOrders = orders.filter(order => order.id !== orderId)
    setOrders(updatedOrders)
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
  }

  const filteredOrders = orders.filter(order => {
    const matchesType = !filterType || (filterType === 'physical' && order.physical > 0) || (filterType === 'digital' && order.digital > 0)
    const matchesStatus = !filterStatus || order.status === filterStatus
    return matchesType && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-white/15 text-gray-100 border border-white/20'
      case 'pending': return 'bg-white/10 text-gray-200 border border-white/20'
      case 'processing': return 'bg-white/20 text-white border border-white/25'
      case 'shipped': return 'bg-white/15 text-gray-100 border border-white/20'
      case 'delivered': return 'bg-black/30 text-gray-300 border border-white/10'
      default: return 'bg-black/30 text-gray-300 border border-white/10'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado'
      case 'pending': return 'Pendiente'
      case 'processing': return 'Procesando'
      case 'shipped': return 'Enviado'
      case 'delivered': return 'Entregado'
      default: return status || 'Pendiente'
    }
  }

  const formatOrderIdForTable = (id) => {
    if (!id) return 'N/A'
    if (id.length <= 18) return id
    return `${id.slice(0, 14)}...`
  }

  const formatShippingSummary = (shipping) => {
    if (!shipping) return 'N/A'
    const baseAddress = shipping.address
      || [shipping.street, shipping.externalNumber].filter(Boolean).join(' ')
      || 'N/A'
    const locality = [shipping.colony, shipping.municipality, shipping.city].filter(Boolean).join(', ')
    const tail = [shipping.postalCode, shipping.country].filter(Boolean).join(', ')
    return [baseAddress, locality, tail].filter(Boolean).join(' | ')
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 text-gray-100">
        <h1 className="text-3xl md:text-4xl font-semibold mb-6 uppercase tracking-[0.22em] text-gray-100">Gestión de Pedidos</h1>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/25 border border-white/20 text-gray-100 rounded-xl px-4 py-2 text-xs tracking-[0.12em] uppercase focus:outline-none focus:ring-2 focus:ring-gray-400/60"
          >
            <option value="">Todos los tipos</option>
            <option value="physical">Libro Físico</option>
            <option value="digital">Libro Digital</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/25 border border-white/20 text-gray-100 rounded-xl px-4 py-2 text-xs tracking-[0.12em] uppercase focus:outline-none focus:ring-2 focus:ring-gray-400/60"
          >
            <option value="">Todos los estados</option>
            <option value="approved">Aprobado</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
          </select>
        </div>

        {/* Tabla de pedidos (desktop) */}
        <div className="hidden md:block bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-black/30">
              <tr>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">ID</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Cliente</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Productos</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Envio</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Estado</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Fecha</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="border border-white/10 px-4 py-8 text-center text-gray-300">
                    No hay pedidos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition">
                    <td className="border border-white/10 px-4 py-2 text-gray-100 font-mono text-xs tracking-[0.08em]" title={order.id}>{formatOrderIdForTable(order.id)}</td>
                    <td className="border border-white/10 px-4 py-2 text-gray-200 text-sm">{order.shipping?.name || 'N/A'}</td>
                    <td className="border border-white/10 px-4 py-2 text-gray-200">
                      {order.physical > 0 && `Físico: ${order.physical}`}
                      {order.physical > 0 && order.digital > 0 && ', '}
                      {order.digital > 0 && `Digital: ${order.digital}`}
                    </td>
                    <td className="border border-white/10 px-4 py-2 text-gray-300 text-xs max-w-[320px]" title={formatShippingSummary(order.shipping)}>
                      {formatShippingSummary(order.shipping)}
                    </td>
                    <td className="border border-white/10 px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.16em] ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="border border-white/10 px-4 py-2 text-gray-300">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border border-white/10 px-4 py-2">
                      <a href={`/admin/orders/${order.id}`} className="text-gray-200 hover:text-white mr-3 text-xs uppercase tracking-[0.14em]">Ver</a>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="text-gray-300 hover:text-gray-100 mr-3 text-xs uppercase tracking-[0.14em]"
                        >
                          Procesar
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="text-gray-300 hover:text-gray-100 mr-3 text-xs uppercase tracking-[0.14em]"
                        >
                          Enviar
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="text-gray-300 hover:text-gray-100 mr-3 text-xs uppercase tracking-[0.14em]"
                        >
                          Entregar
                        </button>
                      )}
                      <button
                        onClick={() => deleteOrder(order.id)}
                        disabled={order.status !== 'delivered'}
                        className="text-gray-300 hover:text-gray-100 text-xs uppercase tracking-[0.14em] disabled:text-gray-500 disabled:cursor-not-allowed"
                        title={order.status !== 'delivered' ? 'Solo puedes eliminar pedidos entregados' : 'Eliminar pedido'}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Tarjetas de pedidos (mobile) */}
        <div className="md:hidden space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] p-5 text-center text-gray-300">
              No hay pedidos que coincidan con los filtros.
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-lg border border-white/20 rounded-2xl shadow-[0_18px_48px_rgba(0,0,0,0.28)] p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">Pedido</p>
                    <p className="font-mono text-xs text-gray-100 break-all" title={order.id}>{order.id || 'N/A'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.14em] ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-200 mb-4">
                  <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2 text-[10px]">Cliente:</span>{order.shipping?.name || 'N/A'}</p>
                  <p>
                    <span className="text-gray-400 uppercase tracking-[0.12em] mr-2 text-[10px]">Productos:</span>
                    {order.physical > 0 && `Fisico: ${order.physical}`}
                    {order.physical > 0 && order.digital > 0 && ', '}
                    {order.digital > 0 && `Digital: ${order.digital}`}
                  </p>
                  <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2 text-[10px]">Envio:</span>{formatShippingSummary(order.shipping)}</p>
                  <p><span className="text-gray-400 uppercase tracking-[0.12em] mr-2 text-[10px]">Fecha:</span>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em]">
                  <a href={`/admin/orders/${order.id}`} className="text-gray-200 hover:text-white">Ver</a>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'processing')}
                      className="text-gray-300 hover:text-gray-100"
                    >
                      Procesar
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="text-gray-300 hover:text-gray-100"
                    >
                      Enviar
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className="text-gray-300 hover:text-gray-100"
                    >
                      Entregar
                    </button>
                  )}
                  <button
                    onClick={() => deleteOrder(order.id)}
                    disabled={order.status !== 'delivered'}
                    className="text-gray-300 hover:text-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                    title={order.status !== 'delivered' ? 'Solo puedes eliminar pedidos entregados' : 'Eliminar pedido'}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  )
}
