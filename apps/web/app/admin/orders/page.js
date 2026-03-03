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

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 text-gray-100">
        <h1 className="text-3xl font-bold mb-6 uppercase tracking-[0.2em]">Gestión de Pedidos</h1>

        {/* Filtros */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-black/20 border border-white/20 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
          >
            <option value="">Todos los tipos</option>
            <option value="physical">Libro Físico</option>
            <option value="digital">Libro Digital</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black/20 border border-white/20 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
          >
            <option value="">Todos los estados</option>
            <option value="approved">Aprobado</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
          </select>
        </div>

        {/* Tabla de pedidos */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-black/30">
              <tr>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">ID</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Cliente</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Productos</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Estado</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Fecha</th>
                <th className="border border-white/10 px-4 py-3 text-left text-xs uppercase tracking-[0.18em] text-gray-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-white/10 px-4 py-8 text-center text-gray-300">
                    No hay pedidos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition">
                    <td className="border border-white/10 px-4 py-2 text-gray-100">{order.id}</td>
                    <td className="border border-white/10 px-4 py-2 text-gray-200">{order.shipping?.name || 'N/A'}</td>
                    <td className="border border-white/10 px-4 py-2 text-gray-200">
                      {order.physical > 0 && `Físico: ${order.physical}`}
                      {order.physical > 0 && order.digital > 0 && ', '}
                      {order.digital > 0 && `Digital: ${order.digital}`}
                    </td>
                    <td className="border border-white/10 px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-[0.16em] ${getStatusColor(order.status)}`}>
                        {order.status === 'approved' ? 'Aprobado' :
                         order.status === 'pending' ? 'Pendiente' :
                         order.status === 'processing' ? 'Procesando' :
                         order.status === 'shipped' ? 'Enviado' : 'Entregado'}
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
                      <button className="text-gray-400 hover:text-gray-200 text-xs uppercase tracking-[0.14em]">Cancelar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </div>
  )
}
