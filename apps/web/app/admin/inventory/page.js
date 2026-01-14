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

  const loadOrders = () => {
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Inventario</h1>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Control de Unidades Restantes</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-gray-500 text-center py-8">Cargando inventario...</p>
          ) : Object.keys(stock).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay inventario disponible o error al cargar.</p>
          ) : (
            Object.entries(stock).map(([id, item]) => {
              return (
                <div key={id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-gray-600">ID: {id}</p>
                    </div>
                    <div className="text-right">
                      {editingId === id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setNewQuantity(Math.max(0, parseInt(newQuantity) - 1).toString())}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 w-20 text-center"
                            min="0"
                          />
                          <button
                            onClick={() => setNewQuantity((parseInt(newQuantity) + 1).toString())}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            +
                          </button>
                          <button
                            onClick={() => updateStock(id, newQuantity)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateStock(id, item.quantity - 1)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            disabled={item.quantity <= 0}
                          >
                            -1
                          </button>
                          <span className="text-xl font-bold">Cantidad: {item.quantity}</span>
                          <button
                            onClick={() => updateStock(id, item.quantity + 1)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(id)
                              setNewQuantity(item.quantity.toString())
                            }}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
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
        <h2 className="text-2xl font-semibold mb-4">Estadísticas de Ventas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total de Órdenes</h3>
            <p className="text-3xl font-bold text-blue-600">{getSalesStats().totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Libros Físicos Vendidos</h3>
            <p className="text-3xl font-bold text-green-600">{getSalesStats().totalPhysicalSold}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Libros Digitales Vendidos</h3>
            <p className="text-3xl font-bold text-purple-600">{getSalesStats().totalDigitalSold}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Ingresos Totales</h3>
            <p className="text-3xl font-bold text-yellow-600">${getSalesStats().totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">Historial de Ventas Recientes</h3>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay ventas registradas aún.</p>
          ) : (
            orders.slice(0, 10).map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold">Orden #{order.id}</h4>
                    <p className="text-gray-600">Cliente: {order.shipping?.name} ({order.shipping?.email})</p>
                    <p className="text-sm text-gray-500">Fecha: {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">Total: ${order.total?.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Estado: {order.status}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h5 className="font-semibold mb-2">Productos:</h5>
                  <ul className="list-disc list-inside text-sm">
                    <li>Libro Físico: {order.physical} unidades</li>
                    <li>Libro Digital: {order.digital} unidades</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Dirección de Envío:</h5>
                  <p className="text-sm text-gray-600">
                    {order.shipping?.address}, {order.shipping?.city}, {order.shipping?.postalCode}, {order.shipping?.country}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}