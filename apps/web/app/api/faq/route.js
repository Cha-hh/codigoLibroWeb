import { kv } from '@vercel/kv';
import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../lib/adminAuth';

const FAQ_KEY = 'faq:items';
const FAQ_SEQ_KEY = 'faq:seq';

async function readFaq() {
  const data = await kv.get(FAQ_KEY);
  if (Array.isArray(data) && data.length > 0) {
    return data;
  }

  const candidates = [
    path.join(process.cwd(), 'faq.json'),
    path.join(process.cwd(), '../../faq.json'),
  ];

  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const maxId = parsed.reduce((acc, item) => {
          const id = Number(item?.id || 0);
          return Number.isFinite(id) ? Math.max(acc, id) : acc;
        }, 0);
        await kv.set(FAQ_KEY, parsed);
        await kv.set(FAQ_SEQ_KEY, maxId);
        return parsed;
      }
    } catch {
      // ignore and continue
    }
  }

  return Array.isArray(data) ? data : [];
}

async function writeFaq(data) {
  await kv.set(FAQ_KEY, data);
}

export async function GET() {
  const faq = await readFaq();
  return new Response(JSON.stringify(faq), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request) {
  const { question, answer, name, email, source } = await request.json();
  const faq = await readFaq();
  const newId = await kv.incr(FAQ_SEQ_KEY);
  faq.push({
    id: newId,
    question,
    answer,
    name: name || null,
    email: email || null,
    source: source || null,
    createdAt: new Date().toISOString(),
  });
  await writeFaq(faq);
  return new Response(JSON.stringify({ message: 'FAQ added' }), { status: 201 });
}

export async function PUT(request) {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!verifyAdminSessionToken(token)) {
    return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 })
  }
  const { id, question, answer } = await request.json();
  const faq = await readFaq();
  const index = faq.findIndex(item => item.id === id);
  if (index !== -1) {
    faq[index] = { ...faq[index], question, answer };
    await writeFaq(faq);
    return new Response(JSON.stringify({ message: 'FAQ updated' }), { status: 200 });
  }
  return new Response(JSON.stringify({ message: 'FAQ not found' }), { status: 404 });
}

export async function DELETE(request) {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!verifyAdminSessionToken(token)) {
    return new Response(JSON.stringify({ message: 'No autorizado' }), { status: 401 })
  }
  const { id } = await request.json();
  const faq = await readFaq();
  const filtered = faq.filter(item => item.id !== id);
  await writeFaq(filtered);
  return new Response(JSON.stringify({ message: 'FAQ deleted' }), { status: 200 });
}
