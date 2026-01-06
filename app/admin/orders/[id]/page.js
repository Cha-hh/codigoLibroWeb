export default async function OrderDetail({ params }) {
  const { id } = await params

  // Simulación de datos del pedido (en un proyecto real, esto vendría de una API o base de datos)
  const orderData = {
    id: id,
    cliente: 'Juan Pérez',
    email: 'juan@example.com',
    tipo: id === '001' ? 'Libro Físico' : 'Libro PDF',
    estado: id === '001' ? 'Pendiente' : 'Procesando',
    fecha: '2025-12-27',
    precio: id === '001' ? '$25.00' : '$15.00',
    direccion: id === '001' ? 'Calle Ficticia 123, Ciudad, País' : 'N/A (Digital)',
    notas: 'Cliente pidió entrega rápida'
  }

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
            <p><strong>Cliente:</strong> {orderData.cliente}</p>
            <p><strong>Email:</strong> {orderData.email}</p>
            <p><strong>Tipo:</strong> {orderData.tipo}</p>
            <p><strong>Estado:</strong>
              <span className={`ml-2 px-2 py-1 rounded text-sm ${
                orderData.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                orderData.estado === 'Procesando' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {orderData.estado}
              </span>
            </p>
            <p><strong>Fecha:</strong> {orderData.fecha}</p>
            <p><strong>Precio:</strong> {orderData.precio}</p>
            {orderData.direccion !== 'N/A (Digital)' && <p><strong>Dirección:</strong> {orderData.direccion}</p>}
            <p><strong>Notas:</strong> {orderData.notas}</p>
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
            <span>2025-12-27 10:00 - Pedido creado</span>
            <span className="text-sm text-gray-500">Sistema</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>2025-12-27 10:05 - Pago confirmado</span>
            <span className="text-sm text-gray-500">Sistema</span>
          </div>
          {/* Más entradas del historial */}
        </div>
      </div>
    </div>
  )
}