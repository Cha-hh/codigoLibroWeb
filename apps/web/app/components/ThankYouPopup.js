'use client'

import { useState, useEffect } from 'react'

export default function ThankYouPopup({ isOpen, onClose, productType = 'digital' }) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowAnimation(true)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg p-8 max-w-md mx-auto text-center shadow-xl transform transition-all duration-500 ${showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="text-green-500 mb-4 animate-bounce">
          <svg
            className="w-20 h-20 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">¡Gracias por tu compra!</h2>
        
        {productType === 'digital' ? (
          <>
            <p className="text-gray-600 mb-2 text-lg">Tu libro digital está listo para descargar</p>
            <p className="text-sm text-gray-500 mb-6">
              En breve recibirás un correo a tu casilla de entrada con los detalles de descarga y tu clave de acceso
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-2 text-lg">Tu pedido ha sido confirmado</p>
            <p className="text-sm text-gray-500 mb-6">
              Pronto recibirás un correo con el número de seguimiento de tu envío
            </p>
          </>
        )}
        
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition font-semibold"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
