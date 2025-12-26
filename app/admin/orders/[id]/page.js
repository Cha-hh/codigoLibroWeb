export default async function OrderDetail({ params }) {
  const { id } = await params
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Detalle de Orden {id}</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <p><strong>ID:</strong> {id}</p>
        <p><strong>Cliente:</strong> Juan Pérez</p>
        <p><strong>Estado:</strong> Pendiente</p>
        {/* Más detalles */}
      </div>
    </div>
  )
}