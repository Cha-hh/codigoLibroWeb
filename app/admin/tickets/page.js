export default function Tickets() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Tickets y Preguntas</h1>

      {/* Filtros */}
      <div className="mb-6 flex space-x-4">
        <select className="border border-gray-300 rounded px-4 py-2">
          <option value="">Todos los tipos</option>
          <option value="pregunta">Pregunta sobre el libro</option>
          <option value="duda">Duda general</option>
          <option value="soporte">Soporte técnico</option>
        </select>
        <select className="border border-gray-300 rounded px-4 py-2">
          <option value="">Todos los estados</option>
          <option value="abierto">Abierto</option>
          <option value="respondido">Respondido</option>
          <option value="cerrado">Cerrado</option>
        </select>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Filtrar</button>
      </div>

      {/* Lista de tickets */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Ticket #001 - Pregunta sobre veracidad de relatos</h3>
              <p className="text-gray-600">De: María García - maria@example.com</p>
              <p className="text-sm text-gray-500">2025-12-27 14:30</p>
            </div>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Abierto</span>
          </div>
          <p className="mb-4">¿Son realmente ciertos todos los relatos del libro? Me gustaría saber más sobre la investigación detrás de las historias.</p>
          <div className="flex space-x-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Responder</button>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Marcar como Respondido</button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cerrar</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Ticket #002 - Duda sobre envío</h3>
              <p className="text-gray-600">De: Carlos López - carlos@example.com</p>
              <p className="text-sm text-gray-500">2025-12-26 09:15</p>
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Respondido</span>
          </div>
          <p className="mb-4">¿Cuánto tiempo tarda el envío del libro físico? Vivo en una zona rural.</p>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="text-sm"><strong>Tu respuesta (2025-12-26 10:00):</strong> El envío estándar tarda 5-7 días hábiles. Para zonas rurales, puede tomar hasta 10 días. Te mantendremos informado del progreso.</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Responder de nuevo</button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cerrar</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Ticket #003 - Pregunta sobre formato PDF</h3>
              <p className="text-gray-600">De: Ana Rodríguez - ana@example.com</p>
              <p className="text-sm text-gray-500">2025-12-25 16:45</p>
            </div>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Cerrado</span>
          </div>
          <p className="mb-4">¿El PDF incluye imágenes a color o es solo texto?</p>
          <div className="bg-gray-50 p-4 rounded mb-4">
            <p className="text-sm"><strong>Tu respuesta (2025-12-25 17:00):</strong> El PDF incluye todas las imágenes en color, manteniendo la calidad del libro original.</p>
          </div>
          <div className="flex space-x-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Reabrir</button>
          </div>
        </div>
      </div>
    </div>
  )
}