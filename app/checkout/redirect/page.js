export default function Redirect() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Redirigiendo a pago...</h1>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
        <p className="text-gray-600 mt-4">Por favor, espera un momento.</p>
      </div>
    </div>
  )
}