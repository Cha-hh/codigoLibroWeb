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

  useEffect(() => {
    loadQuestions()
    loadFaqs()
  }, [])

  const loadQuestions = () => {
    const storedQuestions = localStorage.getItem('bookQuestions')
    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions))
    }
  }

  const loadFaqs = async () => {
    const res = await fetch('/api/faq')
    const data = await res.json()
    setFaqs(data)
  }

  const updateQuestionStatus = (id, newStatus) => {
    const updatedQuestions = questions.map(q =>
      q.id === id ? { ...q, status: newStatus } : q
    )
    setQuestions(updatedQuestions)
    localStorage.setItem('bookQuestions', JSON.stringify(updatedQuestions))
  }

  const openAnswerModal = (question) => {
    setSelectedQuestion(question)
    setAnswer('')
    setShowAnswerModal(true)
  }

  const addToFaq = async (question) => {
    // Pedir respuesta al admin
    const answer = prompt(`Respuesta para: "${question.question}"`)
    if (!answer || !answer.trim()) return

    await fetch('/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.question, answer: answer.trim() }),
    })
    loadFaqs()
  }

  const submitAnswer = async () => {
    if (!selectedQuestion || !answer.trim()) return

    // Agregar a FAQs
    await fetch('/api/faq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: selectedQuestion.question, answer: answer.trim() }),
    })

    // Actualizar estado de la pregunta a cerrado
    updateQuestionStatus(selectedQuestion.id, 'cerrado')

    // Cerrar modal
    setShowAnswerModal(false)
    setSelectedQuestion(null)
    setAnswer('')
    loadFaqs()
  }

  const updateFaqAnswer = async (id, newAnswer) => {
    await fetch('/api/faq', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, question: faqs.find(f => f.id === id).question, answer: newAnswer }),
    })
    loadFaqs()
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
    localStorage.setItem('bookQuestions', JSON.stringify(updatedQuestions))

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
            Preguntas Recibidas
          </button>
          <button
            onClick={() => setActiveTab('cerradas')}
            className={`px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition ${activeTab === 'cerradas' ? 'bg-gray-800 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            Preguntas Cerradas
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase transition ${activeTab === 'faq' ? 'bg-gray-800 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
          >
            Preguntas Frecuentes (FAQ)
          </button>
        </nav>
      </div>

      {activeTab === 'preguntas' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Preguntas Recibidas</h2>

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
                      Responder y Agregar a FAQ
                    </button>
                    <button
                      onClick={() => updateQuestionStatus(q.id, 'respondido')}
                      className="bg-white/15 text-gray-100 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-white/25 transition"
                    >
                      Marcar como Respondido
                    </button>
                    <button
                      onClick={() => updateQuestionStatus(q.id, 'cerrado')}
                      className="bg-black/40 text-gray-200 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-black/60 transition"
                    >
                      Cerrar
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
          <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Preguntas Cerradas</h2>
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
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs tracking-[0.18em] uppercase bg-black/30 text-gray-300 border border-white/10">Cerrado</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToFaq(q)}
                      className="bg-gray-800 text-white px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-gray-700 transition"
                    >
                      Agregar a FAQ
                    </button>
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
          <h2 className="text-2xl font-semibold mb-4 uppercase tracking-[0.14em]">Preguntas Frecuentes (FAQ)</h2>
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <p className="text-gray-300 text-center py-8">No hay preguntas frecuentes aún.</p>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-100">{faq.question}</h3>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaqAnswer(faq.id, e.target.value)}
                      className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                      rows="3"
                      placeholder="Escribe la respuesta..."
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      {faq.createdAt ? `Creado: ${new Date(faq.createdAt).toLocaleDateString()}` : 'FAQ existente'}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="bg-black/40 text-gray-200 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-black/60 transition"
                    >
                      Eliminar FAQ
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
                onClick={() => setShowAnswerModal(false)}
                className="px-4 py-2 bg-white/15 text-gray-100 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-white/25 transition"
              >
                Cancelar
              </button>
              <button
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="px-4 py-2 bg-gray-800 text-white rounded-full text-xs tracking-[0.2em] uppercase hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar a FAQ y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}