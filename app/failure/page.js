export default function Failure() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-800 mb-4">Pago Fallido</h1>
        <p className="text-red-600">Hubo un error en el procesamiento de tu pago.</p>
      </div>
    </div>
  )
}