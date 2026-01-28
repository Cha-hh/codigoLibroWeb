'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [faq, setFaq] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => setFaq(data));

    // Verificar si hay confirmación de pedido
    const orderConfirmed = localStorage.getItem('orderConfirmed');
    if (orderConfirmed) {
      const { name, email } = JSON.parse(orderConfirmed);
      setOrderName(name);
      setOrderEmail(email);
      setShowOrderModal(true);
      localStorage.removeItem('orderConfirmed');
    }
  }, []);

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (!name || !email || !question) return;

    const newQuestion = {
      id: Date.now(),
      name,
      email,
      question,
      type: 'pregunta',
      status: 'abierto',
      createdAt: new Date().toISOString()
    };

    const existingQuestions = JSON.parse(localStorage.getItem('bookQuestions') || '[]');
    existingQuestions.push(newQuestion);
    localStorage.setItem('bookQuestions', JSON.stringify(existingQuestions));

    // Limpiar formulario
    setName('');
    setEmail('');
    setQuestion('');
    setIsModalOpen(false);

    alert('Pregunta enviada correctamente. Te responderemos pronto.');
  };

  const handleSubmitContact = (e) => {
    e.preventDefault();
    if (!contactEmail || !contactMessage) return;

    // Enviar directamente a FAQs con respuesta vacía
    fetch('/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: contactMessage, answer: '' }),
    })
    .then(() => {
      // Limpiar formulario
      setContactEmail('');
      setContactMessage('');
      setSelectedTopic('');
      alert('Mensaje enviado correctamente. Te responderemos pronto.');
    })
    .catch(() => alert('Error al enviar el mensaje.'));
  };

  const FaqGrid = () => {
    // Ordenar por fecha descendente y tomar las últimas 6
    const recentFaq = faq
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentFaq.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 break-words">{item.question}</h3>
            <p className="break-words">{item.answer}</p>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-black shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <a href="/admin/login" className="text-white hover:text-gray-300 font-medium">Admin</a>
              <a href="/" className="text-white hover:text-gray-300 font-medium">Libro</a>
              <a href="#" className="text-white hover:text-gray-300 font-medium">Monturas</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-black text-white min-h-screen overflow-hidden flex items-center">
        <div className="absolute inset-0 w-full h-full">
          <img src="/images/Panel.jpg" alt="Panel de inicio" className="w-full h-full object-cover opacity-50" />
        </div>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-4 relative z-10">
          <div className="md:w-1/2 text-center md:text-left">
            <div className="p-6">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 animate__animated animate__fadeInDown uppercase">En el agua oscura</h1>
              <p className="text-base mb-6 animate__animated animate__fadeInDown">No te encuentras solo.</p>
              <a href="#oferta" className="bg-gray-600 bg-opacity-40 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-opacity-60 transition animate__animated animate__fadeInDown inline-flex items-center gap-2 mt-6">COMPRA EL LIBRO <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white bg-opacity-20 text-xs">→</span></a>
            </div>
          </div>
          <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
            <img src="/images/autor-libro.jpg" alt="Autor del libro" className="w-full max-w-md md:max-w-lg rounded-lg shadow-lg" />
          </div>
        </div>
      </section>

      {/* Introducción */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Introducción</h2>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed">
            El mundo no se limita a lo que los ojos alcanzan a ver.<br />
            Existe lo material: lo tangible, lo comprobable, aquello que se sostiene en la certeza de lo visible y, sin embargo, está condenado a desvanecerse con el tiempo.<br />
            <br />
            Pero hay otro mundo, uno que no se mide ni se pesa. El mundo espiritual.<br />
            Un territorio invisible donde convergen fuerzas, creencias y voluntades; algunas deformadas por el error, otras aferradas a verdades que trascienden al hombre.<br />
            No importa cómo se le nombre o desde dónde se le mire: está ahí. Silencioso, constante, más próximo de lo que quisiéramos admitir.<br />
            <br />
            No siempre se manifiesta con claridad. A veces se insinúa en la sombra, en el presentimiento, en el temor que no tiene explicación. Otras, se revelan con la contundencia de lo inevitable.<br />
            <br />
            Este libro no pretende revelarlo todo. Apenas abre una rendija, un instante fugaz, un susurro en medio de la oscuridad.<br />
            Un suspiro breve, pero cargado de verdad; tan profundo y real como la respiración que, sin notarlo, nos mantiene con vida.
          </p>
        </div>
      </section>

      {/* Relatos y experiencias destacadas */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">RELATOS Y EXPERIENCIAS DESTACADAS</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Parte Uno: Distintas presencias */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{aspectRatio: '2 / 3'}}>
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold text-center">DISTINTAS PRESENCIAS</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed">
                <p className="mb-4">En mi opinión, la existencia no se limita a una sola forma de ser. Hay distintos seres, distintas presencias, distintos estados de conciencia.</p>
                
                <p className="mb-4">Comencemos por el ser humano, compuesto de cuerpo y alma, unidos mientras la vida persiste. El cuerpo habita lo material; el alma, aunque invisible, le da sentido, voluntad y propósito.</p>
                
                <p className="mb-4">Existen también las almas que ya no permanecen en su cuerpo. Aquellas que han cruzado el umbral y existen en otros planos: el cielo, el purgatorio o el limbo; y las desdichadas, que por sus actos o decisiones han quedado atrapadas en el infierno.</p>
                
                <p className="mb-4">Además, los ángeles. Seres que no pertenecen a la carne ni al tiempo. Algunos permanecen fieles al bien, inspirando, protegiendo, en el servicio a Dios. Otros, en cambio, eligieron la ruptura, rechazaron la luz y ahora buscan confundir, tentar y dañar.</p>
                
                <p className="mb-4">El ser humano se encuentra en medio de todo esto. Capaz tanto del bien como del mal. Puede elegir uno u otro camino, entregarse a la luz o a la oscuridad, consciente o inconscientemente. Nadie está exento de esa elección.</p>
                
                <p>Mientras vivimos, estamos sujetos al tiempo y al libre albedrío. El tiempo avanza sin detenerse; el libre albedrío decide el rumbo. Ambos son contundentes, inevitables y profundamente consecuentes.</p>
              </div>
            </div>

            {/* Parte Dos: El miedo, un silencioso asesino */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{aspectRatio: '2 / 3'}}>
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold text-center">EL MIEDO, UN SILENCIOSO ASESINO</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed">
                <p className="mb-4">En el proceso de la vida, el miedo aparece como una sombra constante. No siempre grita; a veces susurra. Se disfraza de prudencia, de duda, de espera eterna. Pero su efecto es el mismo: detiene.</p>
                
                <p className="font-semibold mb-4">El miedo paraliza.</p>
                
                <p className="mb-4">Cuando se instala, inmoviliza la voluntad, nubla la razón y debilita la fe en uno mismo. Poco a poco va erosionando la confianza, hasta convertir cada decisión en una amenaza y cada paso en un riesgo insoportable.</p>
                
                <p className="font-semibold mb-4">El miedo destruye.</p>
                
                <p className="mb-4">No siempre de forma visible, pero sí profunda. Destruye sueños antes de que nazcan, rompe oportunidades antes de que se presenten, y convierte la posibilidad en renuncia. No necesita vencer; le basta con que no intentes.</p>
                
                <p className="mb-4">Enfrentar el miedo no significa no sentirlo. Significa avanzar a pesar de él. Reconocerlo, mirarlo de frente y decidir que no será quien gobierne el rumbo de nuestra vida.</p>
                
                <p className="mb-4">Porque todo momento que el miedo bloquea, es una oportunidad que nunca vuelve. Y toda vida dominada por el miedo, es una vida detenida en el tiempo.</p>
                
                <p className="font-semibold mb-4">El miedo nunca desaparece solo; se debilita únicamente cuando lo enfrentas.</p>
                
                <p className="mb-4">Si no lo haces, podrías perder la oportunidad que marque un antes y un después en tu vida, un instante único en toda tu existencia.</p>
                
                <p className="font-semibold">No temas más… confía y sigue adelante.</p>
              </div>
            </div>

            {/* Parte Tres: Hoy es un buen día */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col" style={{aspectRatio: '2 / 3'}}>
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold text-center">HOY ES UN BUEN DÍA</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed">
                <p className="font-semibold mb-4">Hoy es un buen día.</p>
                
                <p className="mb-4">No porque todo esté en orden, ni porque la vida haya decidido concedernos una tregua. Es porque estamos aquí, respirando, conscientes, con la posibilidad intacta de elegir cómo enfrentarlo.</p>
                
                <p className="font-semibold mb-4">A pesar de las circunstancias.</p>
                
                <p className="mb-4">A pesar de los errores cometidos, de las decisiones que pesaron más de lo esperado, de las palabras que no se dijeron o de aquellas que se dijeron de más. El pasado no desaparece, pero tampoco gobierna este instante.</p>
                
                <p className="mb-4">La actitud positiva no consiste en negar el dolor ni en disfrazar la realidad con optimismo forzado. Consiste en reconocer la dificultad y, aun así, decidir no rendirse ante ella. Es una postura interior: mantenerse en pie cuando todo invita a bajar la cabeza.</p>
                
                <p className="mb-4">Hoy es un buen día porque aún hay margen para corregir, aprender, pedir perdón u otorgarlo. Porque mientras el tiempo siga avanzando, existe la oportunidad de hacer algo distinto, aunque sea pequeño, un solo paso.</p>
                
                <p className="mb-4">La actitud positiva no cambia el mundo de inmediato, pero transforma la forma en que caminamos dentro de él. Nos permite mirar el error sin quedar atrapados en la culpa, enfrentar la adversidad sin convertirla en condena.</p>
                
                <p className="font-semibold mb-4">Hoy es un buen día. Ha sido mi filosofía de vida, en ella he decidido cada paso, cada decisión.</p>
                
                <p className="font-semibold">Porque incluso en medio de la oscuridad, decidir avanzar ya es un acto de luz.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* El autor */}
      <section className="py-0" style={{ backgroundColor: '#132940' }}>
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="md:w-1/3 flex-shrink-0">
            <img src="/images/autor.jpg" alt="El autor" className="w-full h-full object-cover" />
          </div>
          <div className="md:w-2/3 py-16 px-4 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-8 text-white">EL AUTOR</h2>
            <p className="text-lg text-gray-100">Presentación del autor.
Conozco a Gerardo Romeh desde siempre. Es mi hermano, y he sido testigo de su historia, de sus luchas y de su perseverancia. Desde niño vivió experiencias extraordinarias que marcaron su sensibilidad y su manera de ver el mundo, encuentros con realidades que muchos no perciben y que, con el paso del tiempo, han dado forma a su identidad y a su camino de vida.
Gerardo nunca ha dejado de luchar por sus sueños. Es un padre amoroso y comprometido, profesionista, emprendedor y artesano artífice, un hombre carismático, con una creatividad que se manifiesta en todo lo que hace. 
Hoy se abre paso en una nueva faceta: La literaria, y nos presenta con gran entusiasmo su primera obra, en estas páginas comparte no solo su talento, sino también su don sensitivo. A través de sus vivencias, nos invita a asomarnos al mundo espiritual que ha conocido mediante el contacto con seres que han trascendido este plano terrenal, con respeto, humildad y profunda humanidad.
Con cariño, Laura.</p>
          </div>
        </div>
      </section>

      {/* El libro físico */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img src="/libro-fisico.jpg" alt="Libro físico" className="w-64 mx-auto md:mx-0 rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-6">El libro físico</h2>
            <p className="text-lg mb-4">Enfoque visual y descriptivo del objeto físico. Detalles: formato, páginas, encuadernación.</p>
            <p className="text-lg">Valor diferencial del formato impreso.</p>
          </div>
        </div>
      </section>

      {/* Oferta y compra */}
      <section id="oferta" className="py-16 text-white" style={{backgroundColor: '#132940'}}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Oferta y compra</h2>
          <p className="text-xl mb-4">Precio: $XX.XX</p>
          <p className="text-lg mb-4">Qué incluye la compra: Libro físico, envío gratuito.</p>
          <p className="text-lg mb-8">Información clara de envíos: Entrega en 5-7 días hábiles.</p>
          <a href="/checkout" className="bg-[#006888] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#0e5a70] transition">Comprar Ahora</a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Preguntas Frecuentes sobre el Libro</h2>
          <div className="max-w-6xl mx-auto">
            <FaqGrid />
            <div className="text-center mt-8 space-y-4">
              <button onClick={() => setIsModalOpen(true)} className="bg-[#006888] text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-[#0e5a70] transition">
                Hacer una pregunta
              </button>
              <div>
                <a href="/faq" className="text-[#006888] hover:text-[#0e5a70] underline">
                  Ver todas las preguntas frecuentes
                </a>
              </div>
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
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="tu@email.com"
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
                <button type="submit" className="px-4 py-2 bg-[#006888] text-white rounded hover:bg-[#0e5a70]">
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de pedido */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
            <h3 className="text-2xl font-bold mb-4 text-green-600">¡Compra Confirmada!</h3>
            <p className="text-lg mb-4">
              Gracias por tu compra <strong>{orderName}</strong>.<br />
              Te llegará un correo a <strong>{orderEmail}</strong> con información de tu compra.
            </p>
            <p className="text-lg font-semibold text-blue-600">¡Gracias!</p>
            <div className="mt-6">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-6 py-2 bg-[#006888] text-white rounded hover:bg-[#0e5a70]"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Atención y dudas */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-8">Atención y dudas</h2>
          <p className="text-lg mb-6">Bot de atención con respuestas predeterminadas:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button 
              onClick={() => { setSelectedTopic('Envíos'); setContactMessage('Pregunta sobre envíos: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Envíos' ? 'bg-[#073752]' : 'bg-[#0c3550]'} text-white`}
            >
              Envíos
            </button>
            <button 
              onClick={() => { setSelectedTopic('Pagos'); setContactMessage('Pregunta sobre pagos: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Pagos' ? 'bg-[#073752]' : 'bg-[#0c3550]'} text-white`}
            >
              Pagos
            </button>
            <button 
              onClick={() => { setSelectedTopic('Disponibilidad'); setContactMessage('Pregunta sobre disponibilidad: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Disponibilidad' ? 'bg-[#073752]' : 'bg-[#0c3550]'} text-white`}
            >
              Disponibilidad
            </button>
            <button 
              onClick={() => { setSelectedTopic('Facturación'); setContactMessage('Pregunta sobre facturación: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Facturación' ? 'bg-[#073752]' : 'bg-[#0c3550]'} text-white`}
            >
              Facturación
            </button>
          </div>
          <form className="max-w-md mx-auto" onSubmit={handleSubmitContact}>
            <input 
              type="email" 
              placeholder="Tu email" 
              className="w-full p-2 mb-4 border rounded" 
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <textarea 
              placeholder="Tu mensaje" 
              className="w-full p-2 mb-4 border rounded" 
              rows="4"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
            <button type="submit" className="bg-[#006888] text-white px-6 py-2 rounded hover:bg-[#0e5a70]">Enviar</button>
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