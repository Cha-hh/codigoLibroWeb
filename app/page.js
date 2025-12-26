export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src="/portada-libro.jpg" alt="Portada del libro" className="w-64 mx-auto md:mx-0 rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Frase principal de alto impacto narrativo</h1>
            <p className="text-xl mb-6">Subtítulo tipo confesión / advertencia</p>
            <a href="#oferta" className="bg-yellow-500 text-black px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-400 transition">Comprar el libro físico</a>
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

      {/* FAQ */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">¿Son veraces los relatos?</h3>
              <p>Sí, todos los relatos están basados en hechos reales.</p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">¿Qué formato tiene el libro?</h3>
              <p>Es un libro físico en formato tapa dura con X páginas.</p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">¿Cuánto tardan los envíos?</h3>
              <p>Los envíos se realizan en 5-7 días hábiles.</p>
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">¿Para qué público está recomendado?</h3>
              <p>Recomendado para lectores interesados en historias reales y emocionantes.</p>
            </div>
          </div>
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