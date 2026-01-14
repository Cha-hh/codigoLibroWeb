import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '../../faq.json');

function readFaq() {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

function writeFaq(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const faq = readFaq();
  return new Response(JSON.stringify(faq), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(request) {
  const { question, answer } = await request.json();
  const faq = readFaq();
  const newId = faq.length > 0 ? Math.max(...faq.map(item => item.id)) + 1 : 1;
  faq.push({ id: newId, question, answer, createdAt: new Date().toISOString() });
  writeFaq(faq);
  return new Response(JSON.stringify({ message: 'FAQ added' }), { status: 201 });
}

export async function PUT(request) {
  const { id, question, answer } = await request.json();
  const faq = readFaq();
  const index = faq.findIndex(item => item.id === id);
  if (index !== -1) {
    faq[index] = { ...faq[index], question, answer };
    writeFaq(faq);
    return new Response(JSON.stringify({ message: 'FAQ updated' }), { status: 200 });
  }
  return new Response(JSON.stringify({ message: 'FAQ not found' }), { status: 404 });
}

export async function DELETE(request) {
  const { id } = await request.json();
  const faq = readFaq();
  const filtered = faq.filter(item => item.id !== id);
  writeFaq(filtered);
  return new Response(JSON.stringify({ message: 'FAQ deleted' }), { status: 200 });
}