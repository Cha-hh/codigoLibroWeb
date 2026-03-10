'use client';

import { useState, useEffect } from 'react';

export default function FaqAdmin() {
  const [faq, setFaq] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFaq();
  }, []);

  const fetchFaq = async () => {
    const res = await fetch('/api/faq');
    const data = await res.json();
    setFaq(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, question, answer }),
      });
      setEditingId(null);
    } else {
      await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
    }
    setQuestion('');
    setAnswer('');
    fetchFaq();
  };

  const handleEdit = (item) => {
    setQuestion(item.question);
    setAnswer(item.answer);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    await fetch('/api/faq', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchFaq();
  };

  const handleMigrate = async () => {
    const confirmed = window.confirm('¿Migrar faq.json a KV? Esto agregará las preguntas del archivo si no existen.')
    if (!confirmed) return
    await fetch('/api/admin/migrate-faq', { method: 'POST' })
    fetchFaq()
  }

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-8 text-gray-100">
      <h1 className="text-3xl font-bold mb-8 uppercase tracking-[0.2em]">Administrar FAQ</h1>
      <form onSubmit={handleSubmit} className="mb-6 bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg">
        <div className="mb-4">
          <label className="block text-xs font-medium tracking-[0.18em] uppercase mb-2 text-gray-200">Pregunta</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-xs font-medium tracking-[0.18em] uppercase mb-2 text-gray-200">Respuesta</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
            rows="4"
            required
          />
        </div>
        <button type="submit" className="bg-gray-800 text-white px-6 py-3 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase">
          {editingId ? 'Actualizar' : 'Agregar'} FAQ
        </button>
      </form>
      <div className="mb-8">
        <button
          onClick={handleMigrate}
          className="bg-black/40 text-gray-200 px-6 py-3 rounded-full text-xs tracking-[0.25em] uppercase hover:bg-black/60 transition"
        >
          Migrar faq.json
        </button>
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-[0.14em]">FAQ Existentes</h2>
        {faq.map((item) => (
          <div key={item.id} className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 mb-4 rounded-2xl shadow-lg">
            <h3 className="font-semibold text-gray-100">{item.question}</h3>
            <p className="text-gray-300">{item.answer}</p>
            <div className="mt-2">
              <button onClick={() => handleEdit(item)} className="bg-white/15 text-gray-100 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase mr-2 hover:bg-white/25 transition">Editar</button>
              <button onClick={() => handleDelete(item.id)} className="bg-black/40 text-gray-200 px-4 py-2 rounded-full text-xs tracking-[0.2em] uppercase hover:bg-black/60 transition">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
