export default function Orders() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Órdenes</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Cliente</th>
            <th className="border border-gray-300 p-2">Estado</th>
            <th className="border border-gray-300 p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">1</td>
            <td className="border border-gray-300 p-2">Juan Pérez</td>
            <td className="border border-gray-300 p-2">Pendiente</td>
            <td className="border border-gray-300 p-2"><a href="/admin/orders/1" className="text-blue-500">Ver</a></td>
          </tr>
          {/* Más filas */}
        </tbody>
      </table>
    </div>
  )
}