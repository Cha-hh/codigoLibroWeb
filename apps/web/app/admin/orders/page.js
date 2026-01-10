'use client'

import { useState, useEffect } from 'react'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = () => {
    const storedOrders = localStorage.getItem('orders')
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }

  const updateOrderStatus = (orderId, newStatus) => {
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
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de Pedidos</h1>

        {/* Filtros */}
        <div className="mb-6 flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          >
            <option value="">Todos los tipos</option>
            <option value="physical">Libro Físico</option>
            <option value="digital">Libro Digital</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
          </select>
        </div>

        {/* Tabla de pedidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Productos</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    No hay pedidos que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                    <td className="border border-gray-300 px-4 py-2">{order.shipping?.name || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {order.physical > 0 && `Físico: ${order.physical}`}
                      {order.physical > 0 && order.digital > 0 && ', '}
                      {order.digital > 0 && `Digital: ${order.digital}`}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' ? 'Pendiente' :
                         order.status === 'processing' ? 'Procesando' :
                         order.status === 'shipped' ? 'Enviado' : 'Entregado'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <a href={`/admin/orders/${order.id}`} className="text-blue-500 hover:text-blue-700 mr-2">Ver</a>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="text-green-500 hover:text-green-700 mr-2"
                        >
                          Procesar
                        </button>
                      )}
                      {order.status === 'processing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          className="text-green-500 hover:text-green-700 mr-2"
                        >
                          Enviar
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="text-green-500 hover:text-green-700 mr-2"
                        >
                          Entregar
                        </button>
                      )}
                      <button className="text-red-500 hover:text-red-700">Cancelar</button>
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