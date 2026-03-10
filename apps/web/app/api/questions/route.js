import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../lib/adminAuth'

const QUESTIONS_KEY = 'questions:items'
const QUESTIONS_SEQ_KEY = 'questions:seq'

const readQuestions = async () => {
  const data = await kv.get(QUESTIONS_KEY)
  return Array.isArray(data) ? data : []
}

const writeQuestions = async (data) => {
  await kv.set(QUESTIONS_KEY, data)
}

const requireAdmin = () => {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifyAdminSessionToken(token)
}

export async function GET() {
  const questions = await readQuestions()
  return Response.json({ ok: true, questions })
}

export async function POST(request) {
  const { name, email, question, type, status, source, topic } = await request.json()
  const questions = await readQuestions()
  const newId = await kv.incr(QUESTIONS_SEQ_KEY)
  const payload = {
    id: newId,
    name: name || null,
    email: email || null,
    question,
    type: type || 'duda',
    status: status || 'abierto',
    source: source || 'atencion-dudas',
    topic: topic || 'general',
    createdAt: new Date().toISOString()
  }
  questions.push(payload)
  await writeQuestions(questions)
  return Response.json({ ok: true, question: payload }, { status: 201 })
}

export async function PATCH(request) {
  if (!requireAdmin()) {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }
  const { id, updates } = await request.json()
  const questions = await readQuestions()
  const index = questions.findIndex((item) => item.id === id)
  if (index === -1) {
    return Response.json({ ok: false, error: 'No encontrado' }, { status: 404 })
  }
  questions[index] = {
    ...questions[index],
    ...updates
  }
  await writeQuestions(questions)
  return Response.json({ ok: true, question: questions[index] })
}

export async function DELETE(request) {
  if (!requireAdmin()) {
    return Response.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }
  const { id } = await request.json()
  const questions = await readQuestions()
  const filtered = questions.filter((item) => item.id !== id)
  await writeQuestions(filtered)
  return Response.json({ ok: true })
}
