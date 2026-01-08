'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [faq, setFaq] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => setFaq(data));
  }, []);

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    // Aquí puedes enviar la pregunta a una API o procesarla
    alert('Pregunta enviada: ' + question + ' desde ' + email);
    setQuestion('');
    setEmail('');
    setIsModalOpen(false);
  };

  const FaqGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {faq.map((item) => (
        <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-2 break-words">{item.question}</h3>
          <p className="break-words">{item.answer}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="/admin/login" className="text-blue-600 hover:text-blue-800 font-medium">Admin</a>
              <a href="/" className="text-gray-700 hover:text-gray-800 font-medium">Libro</a>
              <a href="#" className="text-gray-700 hover:text-gray-800 font-medium">Monturas</a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-gray-700 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 13l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src="/portada-libro.jpg" alt="Portada del libro" className="w-64 mx-auto md:mx-0 rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate__animated animate__fadeInDown">Frase principal de alto impacto narrativo</h1>
            <p className="text-xl mb-6 animate__animated animate__fadeInDown">Subtítulo tipo confesión / advertencia</p>
            <a href="#oferta" className="bg-yellow-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-400 transition animate__animated animate__fadeInDown">Comprar el libro físico</a>
          </div>
        </div>
      </section>

      {/* Esto ocurrió de verdad */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Esto ocurrió de verdad</h2>
          <p className="text-lg max-w-3xl mx-auto">Texto introductorio del autor. Enfoque en hechos reales. Construcción de credibilidad (sin sensacionalismo).</p>
        </div>
      </section>

      {/* Relatos y experiencias destacadas */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Relatos y experiencias destacadas</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Experiencia 1</h3>
              <p>Descripción insinuada para generar intriga, sin spoilers.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Experiencia 2</h3>
              <p>Descripción insinuada para generar intriga, sin spoilers.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Experiencia 3</h3>
              <p>Descripción insinuada para generar intriga, sin spoilers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* El autor */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">El autor</h2>
          <p className="text-lg max-w-3xl mx-auto">Presentación personal. Relación del autor con los lugares y sucesos. Motivo de escritura del libro.</p>
        </div>
      </section>

      {/* El libro físico */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src="/libro-fisico.jpg" alt="Libro físico" className="w-64 mx-auto md:mx-0 rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">El libro físico</h2>
            <p className="text-lg mb-4">Enfoque visual y descriptivo del objeto físico. Detalles: formato, páginas, encuadernación.</p>
            <p className="text-lg">Valor diferencial del formato impreso.</p>
          </div>
        </div>
      </section>

      {/* Oferta y compra */}
      <section id="oferta" className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Oferta y compra</h2>
          <p className="text-xl mb-4">Precio: $XX.XX</p>
          <p className="text-lg mb-4">Qué incluye la compra: Libro físico, envío gratuito.</p>
          <p className="text-lg mb-8">Información clara de envíos: Entrega en 5-7 días hábiles.</p>
          <a href="/checkout/redirect" className="bg-yellow-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-400 transition">Comprar Ahora</a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes sobre el Libro</h2>
          <div className="max-w-6xl mx-auto">
            <FaqGrid />
            <div className="text-center mt-8">
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition">
                Hacer una pregunta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal para hacer pregunta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Haz tu pregunta</h3>
            <form onSubmit={handleSubmitQuestion}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Pregunta</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="4"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Atención y dudas */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Atención y dudas</h2>
          <p className="text-lg mb-6">Bot de atención con respuestas predeterminadas:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Envíos</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Pagos</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Disponibilidad</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Facturación</button>
          </div>
          <form className="max-w-md mx-auto">
            <input type="email" placeholder="Tu email" className="w-full p-2 mb-4 border rounded" />
            <textarea placeholder="Tu mensaje" className="w-full p-2 mb-4 border rounded" rows="4"></textarea>
            <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Enviar</button>
          </form>
        </div>
      </section>

      {/* Footer legal */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <a href="#" className="hover:underline">Aviso de privacidad</a>
            <a href="#" className="hover:underline">Términos y condiciones</a>
            <a href="#" className="hover:underline">Datos de contacto</a>
          </div>
          <p>&copy; 2025 Nombre del Autor. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}