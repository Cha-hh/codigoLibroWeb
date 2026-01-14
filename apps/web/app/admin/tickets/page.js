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

  const filteredQuestions = questions.filter(q => {
    const matchesType = !filterType || q.type === filterType
    const matchesStatus = !filterStatus || q.status === filterStatus
    return matchesType && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'abierto': return 'bg-red-100 text-red-800'
      case 'respondido': return 'bg-yellow-100 text-yellow-800'
      case 'cerrado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <a href="/admin/inventory" className="text-blue-600 hover:text-blue-800 underline">Ir a Gestión de Inventario</a>
      </div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Preguntas del Libro</h1>

      {/* Pestañas */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('preguntas')}
            className={`px-4 py-2 rounded ${activeTab === 'preguntas' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Preguntas Recibidas
          </button>
          <button
            onClick={() => setActiveTab('cerradas')}
            className={`px-4 py-2 rounded ${activeTab === 'cerradas' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Preguntas Cerradas
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded ${activeTab === 'faq' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Preguntas Frecuentes (FAQ)
          </button>
        </nav>
      </div>

      {activeTab === 'preguntas' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Preguntas Recibidas</h2>

          {/* Filtros */}
          <div className="mb-6 flex space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
            >
              <option value="">Todos los tipos</option>
              <option value="pregunta">Pregunta sobre el libro</option>
              <option value="duda">Duda general</option>
              <option value="soporte">Soporte técnico</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
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
              <p className="text-gray-500 text-center py-8">No hay preguntas que coincidan con los filtros.</p>
            ) : (
              filteredQuestions.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{q.name} - {q.question}</h3>
                      <p className="text-gray-600">Email: {q.email}</p>
                      <p className="text-sm text-gray-500">{new Date(q.createdAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(q.status)}`}>
                      {q.status === 'abierto' ? 'Abierto' : q.status === 'respondido' ? 'Respondido' : 'Cerrado'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openAnswerModal(q)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Responder y Agregar a FAQ
                    </button>
                    <button
                      onClick={() => updateQuestionStatus(q.id, 'respondido')}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Marcar como Respondido
                    </button>
                    <button
                      onClick={() => updateQuestionStatus(q.id, 'cerrado')}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
          <h2 className="text-2xl font-semibold mb-4">Preguntas Cerradas</h2>
          <div className="space-y-4">
            {questions.filter(q => q.status === 'cerrado').length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay preguntas cerradas.</p>
            ) : (
              questions.filter(q => q.status === 'cerrado').map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{q.name} - {q.question}</h3>
                      <p className="text-gray-600">Email: {q.email}</p>
                      <p className="text-sm text-gray-500">{new Date(q.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-800">Cerrado</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToFaq(q)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Agregar a FAQ
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
          <h2 className="text-2xl font-semibold mb-4">Preguntas Frecuentes (FAQ)</h2>
          <div className="space-y-4">
            {faqs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay preguntas frecuentes aún.</p>
            ) : (
              faqs.map((faq) => (
                <div key={faq.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => updateFaqAnswer(faq.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="3"
                      placeholder="Escribe la respuesta..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {faq.createdAt ? `Creado: ${new Date(faq.createdAt).toLocaleDateString()}` : 'FAQ existente'}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteFaq(faq.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold mb-4">Responder Pregunta</h3>
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Pregunta de {selectedQuestion.name}:</h4>
              <p className="bg-gray-100 p-3 rounded">{selectedQuestion.question}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tu Respuesta:</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded"
                rows="6"
                placeholder="Escribe una respuesta detallada..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAnswerModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={submitAnswer}
                disabled={!answer.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
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