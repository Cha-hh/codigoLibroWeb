export default function Orders() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Pedidos</h1>

      {/* Filtros */}
      <div className="mb-6 flex space-x-4">
        <select className="border border-gray-300 rounded px-4 py-2">
          <option value="">Todos los tipos</option>
          <option value="pdf">Libro PDF</option>
          <option value="fisico">Libro Físico</option>
        </select>
        <select className="border border-gray-300 rounded px-4 py-2">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="procesando">Procesando</option>
          <option value="enviado">Enviado</option>
          <option value="entregado">Entregado</option>
        </select>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Filtrar</button>
      </div>

      {/* Tabla de pedidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">001</td>
              <td className="border border-gray-300 px-4 py-2">Juan Pérez</td>
              <td className="border border-gray-300 px-4 py-2">Libro Físico</td>
              <td className="border border-gray-300 px-4 py-2">
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pendiente</span>
              </td>
              <td className="border border-gray-300 px-4 py-2">2025-12-27</td>
              <td className="border border-gray-300 px-4 py-2">
                <a href="/admin/orders/001" className="text-blue-500 hover:text-blue-700 mr-2">Ver</a>
                <button className="text-green-500 hover:text-green-700 mr-2">Marcar como Procesando</button>
                <button className="text-red-500 hover:text-red-700">Cancelar</button>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">002</td>
              <td className="border border-gray-300 px-4 py-2">María García</td>
              <td className="border border-gray-300 px-4 py-2">Libro PDF</td>
              <td className="border border-gray-300 px-4 py-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Procesando</span>
              </td>
              <td className="border border-gray-300 px-4 py-2">2025-12-26</td>
              <td className="border border-gray-300 px-4 py-2">
                <a href="/admin/orders/002" className="text-blue-500 hover:text-blue-700 mr-2">Ver</a>
                <button className="text-green-500 hover:text-green-700 mr-2">Marcar como Enviado</button>
                <button className="text-red-500 hover:text-red-700">Cancelar</button>
              </td>
            </tr>
            {/* Más filas de ejemplo */}
          </tbody>
        </table>
      </div>
    </div>
  )
}