import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), '..', '..', 'stock.json');

function readStock() {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(fileContents);
}

function writeStock(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function GET() {
  const stock = readStock();
  return new Response(JSON.stringify(stock), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function PUT(request) {
  const { id, quantity } = await request.json();
  const stock = readStock();
  if (stock[id]) {
    stock[id].quantity = quantity;
    writeStock(stock);
    return new Response(JSON.stringify({ message: 'Stock updated' }), { status: 200 });
  }
  return new Response(JSON.stringify({ message: 'Item not found' }), { status: 404 });
}