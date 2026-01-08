export default function Pending() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-yellow-800 mb-4">Pago Pendiente</h1>
        <p className="text-yellow-600">Tu pago está siendo procesado.</p>
      </div>
    </div>
  )
}