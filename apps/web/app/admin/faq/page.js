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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Administrar FAQ</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Pregunta</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Respuesta</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {editingId ? 'Actualizar' : 'Agregar'} FAQ
        </button>
      </form>
      <div>
        <h2 className="text-2xl font-bold mb-4">FAQ Existentes</h2>
        {faq.map((item) => (
          <div key={item.id} className="border p-4 mb-4 rounded">
            <h3 className="font-semibold">{item.question}</h3>
            <p>{item.answer}</p>
            <div className="mt-2">
              <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Editar</button>
              <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}