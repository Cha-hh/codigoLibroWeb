'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <div
      className="relative min-h-screen"
      style={{
        background: 'linear-gradient(180deg, #106069ff 0%, #074B54ff 25%, #0A323Bff 50%, #0B1C1Fff 75%, #000000 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22 seed=%221%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23000%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')",
          backgroundSize: '200px 200px',
        }}
      />

      <nav className="relative z-10 bg-black/70 backdrop-blur-md shadow-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <Link href="/" className="text-gray-400 hover:text-gray-200 text-xs tracking-[0.25em] transition uppercase">Libro</Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-100 uppercase tracking-[0.2em]">Preguntas Frecuentes sobre el Libro</h1>

        {faq.length === 0 ? (
          <p className="text-center text-gray-300 py-8">No hay preguntas frecuentes disponibles aún.</p>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {faq.map((item) => (
              <div key={item.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-100 uppercase tracking-[0.12em]">{item.question}</h3>
                <p className="text-gray-200 leading-relaxed">{item.answer}</p>
                {item.createdAt && (
                  <p className="text-sm text-gray-400 mt-3">
                    Respondido el {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="bg-gray-800 text-white px-6 py-3 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
