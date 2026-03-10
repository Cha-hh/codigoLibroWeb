'use client'

import { useState, useEffect } from 'react'

export default function InventoryAdmin() {
  const [stock, setStock] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [newQuantity, setNewQuantity] = useState('')
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

  const loadStock = async () => {
    try {
      const res = await fetch('/api/stock')
      if (!res.ok) {
        console.error('Error en la respuesta de la API de stock')
        setStock({})
        setLoading(false)
        return
      }
      const data = await res.json()
      setStock(data)
      setLoading(false)
    } catch (error) {
      console.error('Error cargando stock:', error)
      setStock({})
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStock()
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

  const updateStock = async (id, quantity) => {
    await fetch('/api/stock', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, quantity: parseInt(quantity) }),
    })
    loadStock()
    setEditingId(null)
    setNewQuantity('')
  }

  const getSalesStats = () => {
    const totalPhysicalSold = orders.reduce((sum, order) => sum + (order.physical || 0), 0)
    const totalDigitalSold = orders.reduce((sum, order) => sum + (order.digital || 0), 0)
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
    const totalOrders = orders.length

    return {
      totalPhysicalSold,
      totalDigitalSold,
      totalRevenue,
      totalOrders
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-6 uppercase tracking-[0.2em]">Gestión de Inventario</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Control de Unidades Restantes</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-300 text-center py-8">Cargando inventario...</p>
          ) : Object.keys(stock).length === 0 ? (
            <p className="text-gray-300 text-center py-8">No hay inventario disponible o error al cargar.</p>
          ) : (
            Object.entries(stock).map(([id, item]) => {
              return (
                <div key={id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{item.title}</h3>
                      <p className="text-gray-300">ID: {id}</p>
                    </div>
                    <div className="text-right">
                      {editingId === id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setNewQuantity(Math.max(0, parseInt(newQuantity) - 1).toString())}
                            className="bg-black/40 text-gray-200 px-2 py-1 rounded-full hover:bg-black/60 transition"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className="bg-black/20 border border-white/20 rounded-lg px-2 py-1 w-20 text-center text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                            min="0"
                          />
                          <button
                            onClick={() => setNewQuantity((parseInt(newQuantity) + 1).toString())}
                            className="bg-white/15 text-gray-100 px-2 py-1 rounded-full hover:bg-white/25 transition"
                          >
                            +
                          </button>
                          <button
                            onClick={() => updateStock(id, newQuantity)}
                            className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs tracking-[0.16em] uppercase hover:bg-gray-700 transition"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-white/15 text-gray-100 px-3 py-1 rounded-full text-xs tracking-[0.16em] uppercase hover:bg-white/25 transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateStock(id, item.quantity - 1)}
                            className="bg-black/40 text-gray-200 px-2 py-1 rounded-full hover:bg-black/60 transition"
                            disabled={item.quantity <= 0}
                          >
                            -1
                          </button>
                          <span className="text-xl font-bold text-gray-100">Cantidad: {item.quantity}</span>
                          <button
                            onClick={() => updateStock(id, item.quantity + 1)}
                            className="bg-white/15 text-gray-100 px-2 py-1 rounded-full hover:bg-white/25 transition"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(id)
                              setNewQuantity(item.quantity.toString())
                            }}
                            className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs tracking-[0.16em] uppercase hover:bg-gray-700 transition"
                          >
                            Editar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Estadísticas de Ventas */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Estadísticas de Ventas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-200">Total de Órdenes</h3>
            <p className="text-3xl font-bold text-gray-100">{getSalesStats().totalOrders}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-200">Libros Físicos Vendidos</h3>
            <p className="text-3xl font-bold text-gray-100">{getSalesStats().totalPhysicalSold}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-200">Libros Digitales Vendidos</h3>
            <p className="text-3xl font-bold text-gray-100">{getSalesStats().totalDigitalSold}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-200">Ingresos Totales</h3>
            <p className="text-3xl font-bold text-gray-100">${getSalesStats().totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4 uppercase tracking-[0.14em]">Historial de Ventas Recientes</h3>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-300 text-center py-8">No hay ventas registradas aún.</p>
          ) : (
            orders.slice(0, 10).map((order) => (
              <div key={order.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-100">Orden #{order.id}</h4>
                    <p className="text-gray-300">Cliente: {order.shipping?.name} ({order.shipping?.email})</p>
                    <p className="text-sm text-gray-400">Fecha: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-100">Total: ${order.total?.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">Estado: {order.fulfillmentStatus || order.status}</p>
                    <p className="text-xs text-gray-500">Pago: {order.paymentStatus || 'pending'}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h5 className="font-semibold mb-2 text-gray-200">Productos:</h5>
                  <ul className="list-disc list-inside text-sm text-gray-300">
                    <li>Libro Físico: {order.physical} unidades</li>
                    <li>Libro Digital: {order.digital} unidades</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2 text-gray-200">Dirección de Envío:</h5>
                  <p className="text-sm text-gray-300">{order.shipping?.address || 'N/A'}</p>
                  <p className="text-sm text-gray-300">
                    {order.shipping?.colony || 'N/A'}, {order.shipping?.municipality || 'N/A'}, {order.shipping?.city || 'N/A'}, {order.shipping?.postalCode || 'N/A'}, {order.shipping?.country || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">Referencias: {order.shipping?.references || 'N/A'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
