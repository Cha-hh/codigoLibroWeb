'use client'

import { useState, useEffect } from 'react'

export default function FAQ() {
  const [faq, setFaq] = useState([])

  useEffect(() => {
    const fetchFaq = async () => {
      const res = await fetch('/api/faq')
      const data = await res.json()
      setFaq(data)
    }
    fetchFaq()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium">Admin</a>
              <a href="/" className="text-gray-700 hover:text-gray-800 font-medium">Libro</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes sobre el Libro</h1>

        {faq.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay preguntas frecuentes disponibles aún.</p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {faq.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-blue-600">{item.question}</h3>
                <p className="text-gray-700">{item.answer}</p>
                {item.createdAt && (
                  <p className="text-sm text-gray-500 mt-2">
                    Respondido el {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <a href="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  )
}