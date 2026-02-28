'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

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
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [introOffset, setIntroOffset] = useState(0);
  const [introTextProgress, setIntroTextProgress] = useState(0);
  const introSectionRef = useRef(null);
  const introTextRef = useRef(null);
  const trackRef = useRef(null);

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

  useEffect(() => {
    const onScroll = () => {
      if (!introSectionRef.current) return;

      const rect = introSectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const progress = Math.min(Math.max((vh - rect.top) / (vh + rect.height), 0), 1);
      setIntroOffset(progress * 120);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!introTextRef.current) return;

      const rect = introTextRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.9;
      const end = vh * 0.2;
      const p = (start - rect.top) / (start - end);

      setIntroTextProgress(Math.min(Math.max(p, 0), 1));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const introTextEase = introTextProgress * introTextProgress;
  const introTextTranslateX = 120 - introTextEase * 120;
  const introTextOpacity = 0.35 + introTextEase * 0.65;

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
          <div key={item.id} className="bg-white/60 backdrop-blur-lg rounded-lg shadow-md overflow-hidden flex flex-col border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-center break-words text-gray-800 uppercase">{item.question}</h3>
            </div>
            <div className="flex-1 p-6 text-sm leading-relaxed text-center">
              <p className="break-words text-gray-700">{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const getActiveIndex = () => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('[data-card]'));
    if (!cards.length) return;

    const trackRect = track.getBoundingClientRect();
    const center = trackRect.left + trackRect.width / 2;

    let activeIndex = 0;
    let minDist = Infinity;

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(cardCenter - center);
      if (dist < minDist) {
        minDist = dist;
        activeIndex = i;
      }
    });

    return { activeIndex, cards };
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame;
    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const result = getActiveIndex();
        if (!result) return;
        setActiveCardIndex(result.activeIndex);
      });
    };

    onScroll();
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const scrollOne = (dir) => {
    const result = getActiveIndex();
    if (!result) return;

    const { activeIndex, cards } = result;
    const nextIndex = Math.min(Math.max(activeIndex + dir, 0), cards.length - 1);

    cards[nextIndex].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    setActiveCardIndex(nextIndex);
  };

  const scrollToIndex = (index) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('[data-card]'));
    if (!cards.length) return;

    const nextIndex = Math.min(Math.max(index, 0), cards.length - 1);
    cards[nextIndex].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
    setActiveCardIndex(nextIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-black shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <div className="flex space-x-8">
              <a href="#intro" className="text-white hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">Inicio</a>
              <a href="#relatos" className="text-white hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">Relatos</a>
              <a href="#autor" className="text-white hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">Autor</a>
              <a href="#oferta" className="text-white hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">Libro</a>
              <a href="#faq" className="text-white hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">FAQ</a>
              <a href="#contacto" className="text-white hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">Contacto</a>
              <a href="/admin/login" className="text-gray-400 hover:text-gray-300 text-xs tracking-[0.25em] transition uppercase">Admin</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Shared background wrapper for hero, intro and relatos */}
      <div
        className="relative w-full pt-16"
        style={{
          background: 'linear-gradient(180deg, #106069ff 0%, #074B54ff 25%, #0A323Bff 50%, #0B1C1Fff 75%, #000000 100%)',
        }}
      >
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22 seed=%221%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23000%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')",
            backgroundSize: '200px 200px',
          }}
        />
        {/* Hero Section */}
        <section id="intro" className="relative text-white min-h-screen overflow-hidden flex items-center">
          <div className="container mx-auto px-4 relative z-10">
            <div className="relative rounded-xl overflow-hidden p-6 md:p-10">
              {/* Background image with opacity */}
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "url('/images/Panel.jpg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-center md:text-left">
                  <h1 className="text-6xl md:text-7xl font-bold mb-4 animate__animated animate__fadeInDown uppercase text-gray-200">
                    En el agua oscura
                  </h1>
                  <p className="text-lg tracking-[0.10em] mb-6 animate__animated animate__fadeInDown text-gray-200 ">
                    No te encuentras solo...
                  </p>
                  <a
                    href="#oferta"
                    className="bg-gray-600 bg-opacity-40 text-gray-100 px-4 py-2 rounded-full text-sm tracking-[0.25em] hover:bg-opacity-60 transition animate__animated animate__fadeInDown inline-flex items-center gap-2 mt-6 uppercase"
                  >
                    COMPRA EL LIBRO{' '}
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white bg-opacity-20 text-xs">
                      →
                    </span>
                  </a>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <img
                    src="/images/autor-libro.jpg"
                    alt="Autor del libro"
                    className="w-full max-w-md md:max-w-lg rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Introducción */}
      <section
        ref={introSectionRef}
        className="relative py-16 md:py-24"
      >
        <div className="relative mx-auto max-w-6xl px-4 bg-white/10 backdrop-blur-lg rounded-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            <div className="md:col-span-4">
              <div className="text-xs tracking-[0.25em] uppercase text-gray-300">
                Introduccion
              </div>

              <div className="relative mt-10 h-[340px] md:h-[520px] overflow-hidden">
                <div className="absolute inset-0 rounded-xl border border-black/10" />
                {/* Imagen paralax, efecto de desplazamiento*/}
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `translateY(${50- introOffset}px)` ,
                    transition: 'transform 20ms linear',
                  }}
                >
                  <div className="relative w-[90%] h-[90%]">
                    <Image
                      src="/images/ImagenIntro.jpg"
                      alt="Imagen intro"
                      fill
                      className="object-cover rounded-xl shadow-sm"
                      priority
                    />
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 text-[11px] tracking-widest text-gray-400">
                  SCROLL
                </div>
              </div>
            </div>

            <div className="md:col-span-8">
              <div
                ref={introTextRef}
                className="max-w-3xl"
                style={{
                  transform: `translateX(${introTextTranslateX}px)` ,
                  opacity: introTextOpacity,
                  transition: 'none',
                }}
              >
                <h2 className="text-4xl md:text-6xl leading-[1.05] font-medium text-gray-200">
                  El mundo no se limita <br />
                  a lo visible.
                  <br />
                  <span className="text-gray-800">Hay otro territorio cercano.</span>
                </h2>
              </div>

              <div className="mt-10 max-w-2xl space-y-6 text-[15px] md:text-base leading-relaxed text-gray-300">
                <p>
                  El mundo no se limita a lo que los ojos alcanzan a ver. Existe lo material: lo tangible,
                  lo comprobable, aquello que se sostiene en la certeza de lo visible y, sin embargo,
                  esta condenado a desvanecerse con el tiempo.
                </p>

                <p>
                  Pero hay otro mundo, uno que no se mide ni se pesa: el mundo espiritual. Un territorio
                  invisible donde convergen fuerzas, creencias y voluntades; algunas deformadas por el error,
                  otras aferradas a verdades que trascienden al hombre.
                </p>

                <p>
                  No importa como se le nombre o desde donde se le mire: esta ahi. Silencioso, constante,
                  mas proximo de lo que quisieramos admitir.
                </p>

                <p>
                  No siempre se manifiesta con claridad. A veces se insinua en la sombra, en el presentimiento,
                  en el temor que no tiene explicacion. Otras, se revela con la contundencia de lo inevitable.
                </p>

                <p>
                  Este libro no pretende revelarlo todo. Apenas abre una rendija: un instante fugaz, un susurro
                  en medio de la oscuridad. Un suspiro breve, pero cargado de verdad; tan profundo y real como
                  la respiracion que, sin notarlo, nos mantiene con vida.
                </p>
              </div>

              <div className="mt-10 flex items-center justify-between max-w-2xl">
                <div className="text-xs tracking-[0.25em] uppercase text-black/70">
                  Leer mas
                </div>
                <div className="h-px flex-1 mx-6 bg-black/20" />
                <button className="text-xs tracking-[0.25em] text-black hover:opacity-70 transition uppercase">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Relatos y experiencias destacadas */}
      <section id="relatos" className="relative py-20 overflow-hidden">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(1200px 600px at 70% 20%, rgba(0,0,0,0.06), transparent 55%), radial-gradient(900px 500px at 20% 80%, rgba(0,0,0,0.05), transparent 60%)',
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
          }}
        />

        <div className="relative container mx-auto px-4">
         

          <div className="max-w-5xl mx-auto mb-4 flex items-center justify-between text-xs tracking-[0.25em] uppercase text-gray-300">
            <span>Relatos y experiencias destacadas</span>
            <span>{String(activeCardIndex + 1).padStart(2, '0')} / 03</span>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <button
              type="button"
              onClick={() => scrollOne(-1)}
              className="absolute -left-12 top-[40%] -translate-y-1/2 z-20 bg-white/70 border border-black/10 shadow-sm backdrop-blur rounded-full w-11 h-11 flex items-center justify-center hover:bg-white/90 hover:scale-105 transition"
              aria-label="Anterior"
            >
              ‹
            </button>

            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-transparent to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-transparent to-transparent z-10" />

            <div
              ref={trackRef}
              className="track-scroll flex overflow-x-auto snap-x snap-mandatory scroll-smooth [-webkit-overflow-scrolling:touch] pb-10"
            >
              <article data-card className="snap-center flex-shrink-0 w-full px-3 sm:px-8">
                <div className="bg-white/15 backdrop-blur-lg border border-black/10 rounded-lg shadow-sm overflow-hidden flex flex-col mx-auto h-[420px] sm:h-[460px]">
                  <div className="p-6 border-b border-black/10 flex-shrink-0">
                    <h3 className="text-xl font-bold text-center tracking-wide text-gray-800">
                      DISTINTAS PRESENCIAS
                    </h3>
                  </div>
                  <div className="h-px w-full bg-black/5" />
                  <div className="card-scroll flex-1 px-8 sm:px-16 py-6 text-sm leading-relaxed overflow-y-auto text-center text-gray-300">
                    <p className="mb-4">
                      En mi opinión, la existencia no se limita a una sola forma de ser. Hay distintos seres,
                      distintas presencias, distintos estados de conciencia.
                    </p>
                    <p className="mb-4">
                      Comencemos por el ser humano, compuesto de cuerpo y alma, unidos mientras la vida persiste.
                      El cuerpo habita lo material; el alma, aunque invisible, le da sentido, voluntad y propósito.
                    </p>
                    <p className="mb-4">
                      Existen también las almas que ya no permanecen en su cuerpo. Aquellas que han cruzado el
                      umbral y existen en otros planos: el cielo, el purgatorio o el limbo; y las desdichadas,
                      que por sus actos o decisiones han quedado atrapadas en el infierno.
                    </p>
                    <p className="mb-4">
                      Además, los ángeles. Seres que no pertenecen a la carne ni al tiempo. Algunos permanecen
                      fieles al bien, inspirando, protegiendo, en el servicio a Dios. Otros, en cambio, eligieron
                      la ruptura, rechazaron la luz y ahora buscan confundir, tentar y dañar.
                    </p>
                    <p className="mb-4">
                      El ser humano se encuentra en medio de todo esto. Capaz tanto del bien como del mal. Puede
                      elegir uno u otro camino, entregarse a la luz o a la oscuridad, consciente o inconscientemente.
                      Nadie está exento de esa elección.
                    </p>
                    <p>
                      Mientras vivimos, estamos sujetos al tiempo y al libre albedrío. El tiempo avanza sin
                      detenerse; el libre albedrío decide el rumbo. Ambos son contundentes, inevitables y
                      profundamente consecuentes.
                    </p>
                  </div>
                </div>
              </article>

              <article data-card className="snap-center flex-shrink-0 w-full px-3 sm:px-8">
                <div className="bg-white/15 backdrop-blur-lg border border-black/10 rounded-lg shadow-sm overflow-hidden flex flex-col mx-auto h-[420px] sm:h-[460px]">
                  <div className="p-6 border-b border-black/10 flex-shrink-0">
                    <h3 className="text-center font-bold tracking-wide">
                      <span className="text-2xl block text-gray-800">EL MIEDO</span>
                      <span className="text-sm text-gray-800 tracking-[0.2em] block">
                        UN SILENCIOSO ASESINO
                      </span>
                    </h3>
                  </div>
                  <div className="h-px w-full bg-black/5" />
                  <div className="card-scroll flex-1 px-8 sm:px-16 py-6 text-sm leading-relaxed overflow-y-auto text-center text-gray-300">
                    <p className="mb-4">
                      En el proceso de la vida, el miedo aparece como una sombra constante. No siempre grita;
                      a veces susurra. Se disfraza de prudencia, de duda, de espera eterna. Pero su efecto es el mismo:
                      detiene.
                    </p>
                    <p className="font-semibold mb-4 text-gray-800">El miedo paraliza.</p>
                    <p className="mb-4">
                      Cuando se instala, inmoviliza la voluntad, nubla la razón y debilita la fe en uno mismo.
                      Poco a poco va erosionando la confianza, hasta convertir cada decisión en una amenaza y cada paso
                      en un riesgo insoportable.
                    </p>
                    <p className="font-semibold mb-4 text-gray-800">El miedo destruye.</p>
                    <p className="mb-4">
                      No siempre de forma visible, pero sí profunda. Destruye sueños antes de que nazcan, rompe oportunidades
                      antes de que se presenten, y convierte la posibilidad en renuncia. No necesita vencer; le basta con
                      que no intentes.
                    </p>
                    <p className="mb-4">
                      Enfrentar el miedo no significa no sentirlo. Significa avanzar a pesar de él. Reconocerlo, mirarlo
                      de frente y decidir que no será quien gobierne el rumbo de nuestra vida.
                    </p>
                    <p className="mb-4">
                      Porque todo momento que el miedo bloquea, es una oportunidad que nunca vuelve. Y toda vida dominada por
                      el miedo, es una vida detenida en el tiempo.
                    </p>
                    <p className="font-semibold mb-4 text-gray-800">
                      El miedo nunca desaparece solo; se debilita únicamente cuando lo enfrentas.
                    </p>
                    <p className="mb-4">
                      Si no lo haces, podrías perder la oportunidad que marque un antes y un después en tu vida, un instante
                      único en toda tu existencia.
                    </p>
                    <p className="font-semibold text-gray-800">
                      No temas mas... confia y sigue adelante.
                    </p>
                  </div>
                </div>
              </article>

              <article data-card className="snap-center flex-shrink-0 w-full px-3 sm:px-8">
                <div className="bg-white/15 backdrop-blur-lg border border-black/10 rounded-lg shadow-sm overflow-hidden flex flex-col mx-auto h-[420px] sm:h-[460px]">
                  <div className="p-6 border-b border-black/10 flex-shrink-0">
                    <h3 className="text-xl font-bold text-center tracking-wide text-gray-800">
                      HOY ES UN BUEN DIA
                    </h3>
                  </div>
                  <div className="h-px w-full bg-black/5" />
                  <div className="card-scroll flex-1 px-8 sm:px-16 py-6 text-sm leading-relaxed overflow-y-auto text-center text-gray-300">
                    <p className="font-semibold mb-4 text-gray-800">Hoy es un buen dia.</p>
                    <p className="mb-4">
                      No porque todo este en orden, ni porque la vida haya decidido concedernos una tregua. Es porque
                      estamos aqui, respirando, conscientes, con la posibilidad intacta de elegir como enfrentarlo.
                    </p>
                    <p className="font-semibold mb-4 text-gray-800">A pesar de las circunstancias.</p>
                    <p className="mb-4">
                      A pesar de los errores cometidos, de las decisiones que pesaron mas de lo esperado, de las palabras
                      que no se dijeron o de aquellas que se dijeron de mas. El pasado no desaparece, pero tampoco gobierna
                      este instante.
                    </p>
                    <p className="mb-4">
                      La actitud positiva no consiste en negar el dolor ni en disfrazar la realidad con optimismo forzado.
                      Consiste en reconocer la dificultad y, aun asi, decidir no rendirse ante ella. Es una postura interior:
                      mantenerse en pie cuando todo invita a bajar la cabeza.
                    </p>
                    <p className="mb-4">
                      Hoy es un buen dia porque aun hay margen para corregir, aprender, pedir perdon u otorgarlo. Porque mientras
                      el tiempo siga avanzando, existe la oportunidad de hacer algo distinto, aunque sea pequeño, un solo paso.
                    </p>
                    <p className="mb-4">
                      La actitud positiva no cambia el mundo de inmediato, pero transforma la forma en que caminamos dentro de el.
                      Nos permite mirar el error sin quedar atrapados en la culpa, enfrentar la adversidad sin convertirla en condena.
                    </p>
                    <p className="font-semibold mb-4 text-gray-800">
                      Hoy es un buen dia. Ha sido mi filosofia de vida, en ella he decidido cada paso, cada decision.
                    </p>
                    <p className="font-semibold text-gray-800">
                      Porque incluso en medio de la oscuridad, decidir avanzar ya es un acto de luz.
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3">
              {[0, 1, 2].map((index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    activeCardIndex === index ? 'bg-black/70' : 'bg-black/20'
                  }`}
                  aria-label={`Ir a tarjeta ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollOne(1)}
              className="absolute -right-12 top-[40%] -translate-y-1/2 z-20 bg-white/70 border border-black/10 shadow-sm backdrop-blur rounded-full w-11 h-11 flex items-center justify-center hover:bg-white/90 hover:scale-105 transition"
              aria-label="Siguiente"
            >
              ›
            </button>

            <style jsx>{`
              .track-scroll {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }

              .track-scroll::-webkit-scrollbar {
                display: none;
              }

              .card-scroll {
                scrollbar-width: none;
                -ms-overflow-style: none;
              }

              .card-scroll::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        </div>
      </section>
      </div>

      {/* El autor */}
      <section id="autor" className="py-0 bg-white">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="md:w-1/3 py-16 px-4 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-8 text-black ml-6 md:ml-10">GERARDO ROMEH</h2>
            <div className="bg-white/80 p-6 md:p-8 rounded-lg max-w-3xl">
              <p className="text-sm text-black text-justify leading-relaxed">
                Presentación del autor.
                Conozco a Gerardo Romeh desde siempre. Es mi hermano, y he sido testigo de su historia, de sus luchas y de su perseverancia. Desde niño vivió experiencias extraordinarias que marcaron su sensibilidad y su manera de ver el mundo, encuentros con realidades que muchos no perciben y que, con el paso del tiempo, han dado forma a su identidad y a su camino de vida.
                Gerardo nunca ha dejado de luchar por sus sueños. Es un padre amoroso y comprometido, profesionista, emprendedor y artesano artífice, un hombre carismático, con una creatividad que se manifiesta en todo lo que hace.
                Hoy se abre paso en una nueva faceta: La literaria, y nos presenta con gran entusiasmo su primera obra, en estas páginas comparte no solo su talento, sino también su don sensitivo. A través de sus vivencias, nos invita a asomarnos al mundo espiritual que ha conocido mediante el contacto con seres que han trascendido este plano terrenal, con respeto, humildad y profunda humanidad.
                Con cariño, Laura.
              </p>
            </div>
          </div>
          <div className="md:w-2/3 flex-shrink-0">
            <img src="/images/autor.jpg" alt="El autor" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Sección Collage */}
      <section className="relative py-20 bg-gray-900">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22 seed=%221%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23000%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')",
            backgroundSize: '200px 200px',
          }}
        />
        <div className="relative container mx-auto px-4">
          <img 
            src="/images/colage.jpg" 
            alt="Collage" 
            className="w-full rounded-xl shadow-2xl"
          />
        </div>
      </section>

      {/* El libro físico y Oferta */}
      <section id="oferta" className="relative py-20 bg-gray-100">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22 seed=%221%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23000%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')",
            backgroundSize: '200px 200px',
          }}
        />
        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="md:w-1/2 flex justify-center">
              <img src="/images/MockupLibro.jpg" alt="Libro físico" className="w-96 md:w-[500px] rounded-lg shadow-2xl" />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 uppercase">LIBRO FÍSICO</h2>
              <p className="text-lg mb-4 text-gray-700">Enfoque visual y descriptivo del objeto físico. Detalles: formato, páginas, encuadernación.</p>
              <p className="text-lg mb-6 text-gray-700">Valor diferencial del formato impreso.</p>
              
              <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl shadow-lg mb-6">
                <p className="text-2xl font-bold mb-2 text-gray-800">Precio: $XX.XX</p>
                <p className="text-base mb-2 text-gray-600">Incluye: Libro físico + envío gratuito</p>
                <p className="text-sm text-gray-500">Entrega en 5-7 días hábiles</p>
              </div>
              
              <a href="/checkout" className="bg-gray-800 text-white px-8 py-4 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition inline-block uppercase">Comprar Ahora</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-16 bg-gray-50">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22 seed=%221%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23000%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')",
            backgroundSize: '200px 200px',
          }}
        />
        <div className="relative container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 uppercase">PREGUNTAS FRECUENTES SOBRE EL LIBRO</h2>
          <div className="max-w-6xl mx-auto">
            <FaqGrid />
            <div className="text-center mt-8 space-y-4">
              <button onClick={() => setIsModalOpen(true)} className="bg-gray-800 text-white px-6 py-3 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase">
                Hacer una pregunta
              </button>
              <div>
                <a href="/faq" className="text-gray-800 hover:text-gray-600 underline">
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
            <h3 className="text-2xl font-bold mb-4 uppercase">Haz tu pregunta</h3>
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-xs tracking-[0.25em] uppercase">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-xs tracking-[0.25em] uppercase">
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
            <h3 className="text-2xl font-bold mb-4 text-green-600 uppercase">¡Compra Confirmada!</h3>
            <p className="text-lg mb-4">
              Gracias por tu compra <strong>{orderName}</strong>.<br />
              Te llegará un correo a <strong>{orderEmail}</strong> con información de tu compra.
            </p>
            <p className="text-lg font-semibold text-blue-600">¡Gracias!</p>
            <div className="mt-6">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 text-xs tracking-[0.25em] uppercase"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Atención y dudas */}
      <section id="contacto" className="relative py-16 bg-white">
        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22 seed=%221%22/%3E%3C/filter%3E%3Crect width=%22200%22 height=%22200%22 fill=%22%23000%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')",
            backgroundSize: '200px 200px',
          }}
        />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 uppercase">ATENCIÓN Y DUDAS</h2>
          <p className="text-lg mb-6 text-gray-700">Selecciona la categoria:</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <button
              onClick={() => { setSelectedTopic('Envíos'); setContactMessage('Pregunta sobre envíos: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Envíos' ? 'bg-gray-800' : 'bg-gray-600'} text-white text-xs tracking-[0.25em] uppercase`}
            >
              Envíos
            </button>
            <button
              onClick={() => { setSelectedTopic('Pagos'); setContactMessage('Pregunta sobre pagos: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Pagos' ? 'bg-gray-800' : 'bg-gray-600'} text-white text-xs tracking-[0.25em] uppercase`}
            >
              Pagos
            </button>
            <button
              onClick={() => { setSelectedTopic('Disponibilidad'); setContactMessage('Pregunta sobre disponibilidad: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Disponibilidad' ? 'bg-gray-800' : 'bg-gray-600'} text-white text-xs tracking-[0.25em] uppercase`}
            >
              Disponibilidad
            </button>
            <button
              onClick={() => { setSelectedTopic('Facturación'); setContactMessage('Pregunta sobre facturación: '); }}
              className={`px-4 py-2 rounded hover:opacity-80 ${selectedTopic === 'Facturación' ? 'bg-gray-800' : 'bg-gray-600'} text-white text-xs tracking-[0.25em] uppercase`}
            >
              Facturación
            </button>
          </div>
          <form className="max-w-md mx-auto" onSubmit={handleSubmitContact}>
            <input
              type="email"
              placeholder="Tu email"
              className="w-full p-2 mb-4 border rounded bg-white border-gray-300 text-gray-800 placeholder-gray-400"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <textarea
              placeholder="Tu mensaje"
              className="w-full p-2 mb-4 border rounded bg-white border-gray-300 text-gray-800 placeholder-gray-400"
              rows="4"
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              required
            />
            <button type="submit" className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 text-xs tracking-[0.25em] uppercase">Enviar</button>
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