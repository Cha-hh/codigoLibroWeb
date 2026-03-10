'use client'

import { useState, useEffect } from 'react'

export default function Tickets() {
  const [questions, setQuestions] = useState([])
  const [faqs, setFaqs] = useState([])
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [activeTab, setActiveTab] = useState('preguntas')
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false)
  const [faqDrafts, setFaqDrafts] = useState({})
  const [savingFaqId, setSavingFaqId] = useState(null)

  useEffect(() => {
    loadQuestions()
    loadFaqs()
  }, [])

  const loadQuestions = async () => {
    const storedQuestions = localStorage.getItem('bookQuestions')
    if (storedQuestions) {
      try {
        const parsed = JSON.parse(storedQuestions)
        if (Array.isArray(parsed) && parsed.length > 0) {
          await Promise.all(
            parsed.map((item) =>
              fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
              })
            )
          )
        }
        localStorage.removeItem('bookQuestions')
      } catch (error) {
        console.error('Error migrando preguntas locales:', error)
      }
    }

    const res = await fetch('/api/questions', { cache: 'no-store' })
    const data = await res.json()
    if (data.ok) {
      setQuestions(data.questions || [])
    }
  }

  const loadFaqs = async () => {
    const res = await fetch('/api/faq')
    const data = await res.json()
    setFaqs(data)
    setFaqDrafts(Object.fromEntries(data.map((item) => [item.id, item.answer || ''])))
  }

  const updateQuestionStatus = async (id, newStatus) => {
    const updatedQuestions = questions.map(q =>
      q.id === id ? { ...q, status: newStatus } : q
    )
    setQuestions(updatedQuestions)
    await fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: { status: newStatus } })
    })
  }

  const closeQuestionWithAnswer = async (id, adminAnswer) => {
    const updatedQuestions = questions.map((q) =>
      q.id === id
        ? {
            ...q,
            status: 'cerrado',
            adminAnswer,
            answeredAt: new Date().toISOString(),
          }
        : q
    )
    setQuestions(updatedQuestions)
    await fetch('/api/questions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        updates: {
          status: 'cerrado',
          adminAnswer,
          answeredAt: new Date().toISOString()
        }
      })
    })
  }

  const openAnswerModal = (question) => {
    setSelectedQuestion(question)
    setAnswer('')
    setShowAnswerModal(true)
  }

  const submitAnswer = async () => {
    if (!selectedQuestion || !answer.trim()) return

    const trimmedAnswer = answer.trim()

    setIsSubmittingAnswer(true)

    try {
      await closeQuestionWithAnswer(selectedQuestion.id, trimmedAnswer)

      setShowAnswerModal(false)
      setSelectedQuestion(null)
      setAnswer('')
    } finally {
      setIsSubmittingAnswer(false)
    }
  }

  const updateFaqAnswer = async (id) => {
    const newAnswer = (faqDrafts[id] || '').trim()
    const faqToUpdate = faqs.find((f) => f.id === id)
    if (!faqToUpdate || !newAnswer) return

    setSavingFaqId(id)
    await fetch('/api/faq', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, question: faqToUpdate.question, answer: newAnswer }),
    })
    await loadFaqs()
    setSavingFaqId(null)
  }

  const deleteFaq = async (id) => {
    await fetch('/api/faq', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    loadFaqs()
  }

  const deleteClosedQuestion = async (questionToDelete) => {
    const confirmed = window.confirm('¿Eliminar esta pregunta cerrada? También se eliminará de FAQ si existe.')
    if (!confirmed) return

    const updatedQuestions = questions.filter(q => q.id !== questionToDelete.id)
    setQuestions(updatedQuestions)
    await fetch('/api/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: questionToDelete.id })
    })

    try {
      const questionText = (questionToDelete.question || '').trim().toLowerCase()
      const relatedFaqs = faqs.filter((item) => (item.question || '').trim().toLowerCase() === questionText)

      await Promise.all(
        relatedFaqs.map((item) =>
          fetch('/api/faq', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: item.id }),
          })
        )
      )

      loadFaqs()
    } catch (error) {
      console.error('Error eliminando FAQ relacionada:', error)
    }
  }

  const filteredQuestions = questions.filter(q => {
    if (q.status === 'cerrado') return false
    const matchesType = !filterType || q.type === filterType
    const matchesStatus = !filterStatus || q.status === filterStatus
    return matchesType && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return 'bg-white/10 text-gray-200 border border-white/20'
      case 'respondido': return 'bg-white/15 text-gray-100 border border-white/20'
      case 'cerrado': return 'bg-black/30 text-gray-300 border border-white/10'
      default: return 'bg-black/30 text-gray-300 border border-white/10'
    }
  }

  const faqPending = faqs.filter((item) => !(item.answer || '').trim())
  const faqClosed = faqs.filter((item) => (item.answer || '').trim())

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-6 uppercase tracking-[0.2em]">Gestión de Preguntas del Libro</h1>

      {/* Pestañas */}
      <div className="mb-6">
        <nav className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('preguntas')}
            className={`px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition ${activeTab === 'preguntas' ? 'bg-gray-800 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            Preguntas Atencion y dudas
          </button>
          <button
            onClick={() => setActiveTab('cerradas')}
            className={`px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition ${activeTab === 'cerradas' ? 'bg-gray-800 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            Preguntas cerradas atencion y dudas
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition ${activeTab === 'faq' ? 'bg-gray-800 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            Preguntas libro
          </button>
          <button
            onClick={() => setActiveTab('faq-cerradas')}
            className={`px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition ${activeTab === 'faq-cerradas' ? 'bg-gray-800 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            Preguntas cerradas Libro
          </button>
        </nav>
      </div>

      {activeTab === 'preguntas' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Preguntas Atencion y dudas</h2>

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-black/20 border border-white/20 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
            >
              <option value="">Todos los tipos</option>
              <option value="pregunta">Pregunta sobre el libro</option>
              <option value="duda">Duda general</option>
              <option value="soporte">Soporte técnico</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-black/20 border border-white/20 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
            >
              <option value="">Todos los estados</option>
              <option value="abierto">Abierto</option>
              <option value="respondido">Respondido</option>
              <option value="cerrado">Cerrado</option>
            </select>
          </div>

          {/* Lista de preguntas */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No hay preguntas que coincidan con los filtros.</p>
            ) : (
              filteredQuestions.map((q) => (
                <div key={q.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{q.name} - {q.question}</h3>
                      <p className="text-gray-300">Email: {q.email}</p>
                      <p className="text-sm text-gray-400">{new Date(q.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs tracking-[0.18em] uppercase ${getStatusColor(q.status)}`}>
                      {q.status === 'abierto' ? 'Abierto' : q.status === 'respondido' ? 'Respondido' : 'Cerrado'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openAnswerModal(q)}
                      className="bg-gray-800 text-white px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-gray-700 transition"
                    >
                      Responder
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'cerradas' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Preguntas cerradas atencion y dudas</h2>
          <div className="space-y-4">
            {questions.filter(q => q.status === 'cerrado').length === 0 ? (
              <p className="text-gray-300 text-center py-8">No hay preguntas cerradas.</p>
            ) : (
              questions.filter(q => q.status === 'cerrado').map((q) => (
                <div key={q.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100">{q.name} - {q.question}</h3>
                      <p className="text-gray-300">Email: {q.email}</p>
                      <p className="text-sm text-gray-400">{new Date(q.createdAt).toLocaleString()}</p>
                      {q.adminAnswer && (
                        <div className="mt-3 bg-black/25 border border-white/10 rounded-lg p-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-gray-400 mb-1">Respuesta admin</p>
                          <p className="text-sm text-gray-200">{q.adminAnswer}</p>
                        </div>
                      )}
                      {q.answeredAt && (
                        <p className="text-xs text-gray-500 mt-2">Respondido: {new Date(q.answeredAt).toLocaleString()}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs tracking-[0.18em] uppercase bg-black/30 text-gray-300 border border-white/10">Cerrado</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteClosedQuestion(q)}
                      className="bg-black/40 text-gray-200 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-black/60 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'faq' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Preguntas libro</h2>
          <div className="space-y-4">
            {faqPending.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No hay preguntas de libro pendientes por responder.</p>
            ) : (
              faqPending.map((faq) => (
                <div key={faq.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-100">{faq.question}</h3>
                    {(faq.name || faq.email || faq.source) && (
                      <div className="mb-3 text-xs text-gray-400 space-y-1">
                        {faq.name && <p>Nombre: <span className="text-gray-200">{faq.name}</span></p>}
                        {faq.email && <p>Email: <span className="text-gray-200">{faq.email}</span></p>}
                        {faq.source && <p>Origen: <span className="text-gray-300">{faq.source}</span></p>}
                      </div>
                    )}
                    <textarea
                      value={faqDrafts[faq.id] ?? ''}
                      onChange={(e) => setFaqDrafts((prev) => ({ ...prev, [faq.id]: e.target.value }))}
                      className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                      rows="3"
                      placeholder="Escribe la respuesta..."
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      {faq.createdAt ? `Creado: ${new Date(faq.createdAt).toLocaleDateString()}` : 'FAQ existente'}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => updateFaqAnswer(faq.id)}
                      disabled={savingFaqId === faq.id || (faqDrafts[faq.id] || '').trim() === (faq.answer || '').trim() || !(faqDrafts[faq.id] || '').trim()}
                      className="bg-gray-800 text-white px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingFaqId === faq.id ? 'Guardando...' : 'Responder'}
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="bg-black/40 text-gray-200 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-black/60 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'faq-cerradas' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Preguntas cerradas Libro</h2>
          <div className="space-y-4">
            {faqClosed.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No hay preguntas de libro respondidas todavía.</p>
            ) : (
              faqClosed.map((faq) => (
                <div key={faq.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-100">{faq.question}</h3>
                    {(faq.name || faq.email || faq.source) && (
                      <div className="mb-3 text-xs text-gray-400 space-y-1">
                        {faq.name && <p>Nombre: <span className="text-gray-200">{faq.name}</span></p>}
                        {faq.email && <p>Email: <span className="text-gray-200">{faq.email}</span></p>}
                        {faq.source && <p>Origen: <span className="text-gray-300">{faq.source}</span></p>}
                      </div>
                    )}
                    <textarea
                      value={faqDrafts[faq.id] ?? ''}
                      onChange={(e) => setFaqDrafts((prev) => ({ ...prev, [faq.id]: e.target.value }))}
                      className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                      rows="3"
                      placeholder="Escribe la respuesta..."
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      {faq.createdAt ? `Creado: ${new Date(faq.createdAt).toLocaleDateString()}` : 'FAQ existente'}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => updateFaqAnswer(faq.id)}
                      disabled={savingFaqId === faq.id || (faqDrafts[faq.id] || '').trim() === (faq.answer || '').trim() || !(faqDrafts[faq.id] || '').trim()}
                      className="bg-gray-800 text-white px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingFaqId === faq.id ? 'Guardando...' : 'Guardar respuesta'}
                    </button>
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="bg-black/40 text-gray-200 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-black/60 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal para responder pregunta */}
      {showAnswerModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 text-gray-100">
            <h3 className="text-2xl font-bold mb-4 uppercase tracking-[0.14em]">Responder Pregunta</h3>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Pregunta de {selectedQuestion.name}:</h4>
              <p className="bg-black/30 border border-white/10 p-3 rounded-lg text-gray-200">{selectedQuestion.question}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 uppercase tracking-[0.12em]">Tu Respuesta:</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                rows="6"
                placeholder="Escribe una respuesta detallada..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowAnswerModal(false)
                  setSelectedQuestion(null)
                  setAnswer('')
                }}
                className="px-4 py-2 bg-white/15 text-gray-100 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-white/25 transition"
              >
                Cancelar
              </button>
              <button
                onClick={submitAnswer}
                disabled={!answer.trim() || isSubmittingAnswer}
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-xs tracking-[0.2em] uppercase hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingAnswer ? 'Guardando...' : 'Responder y Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
