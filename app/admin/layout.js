export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
            <div className="space-x-4">
              <a href="/admin/orders" className="text-blue-600 hover:text-blue-800">Pedidos</a>
              <a href="/admin/tickets" className="text-blue-600 hover:text-blue-800">Tickets</a>
              <a href="/" className="text-gray-600 hover:text-gray-800">Volver al sitio</a>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}