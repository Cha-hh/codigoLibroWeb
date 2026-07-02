import fs from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

const STOCK_KEY = 'inventory:stock'
const filePath = path.join(process.cwd(), '..', '..', 'stock.json')

const hasKvConfig = () =>
  Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)

const readLocalStock = () => {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(fileContents)
}

const writeLocalStock = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export const readStock = async () => {
  if (hasKvConfig()) {
    const stored = await kv.get(STOCK_KEY)
    if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
      return stored
    }

    const localStock = readLocalStock()
    await kv.set(STOCK_KEY, localStock)
    return localStock
  }

  return readLocalStock()
}

export const writeStock = async (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Inventario inválido')
  }

  if (hasKvConfig()) {
    await kv.set(STOCK_KEY, data)
  } else {
    writeLocalStock(data)
  }

  return data
}

export const updateStockItemQuantity = async (id, quantity) => {
  const normalizedQuantity = Number.parseInt(quantity, 10)

  if (!id) {
    throw new Error('Item requerido')
  }

  if (Number.isNaN(normalizedQuantity) || normalizedQuantity < 0) {
    throw new Error('Cantidad inválida')
  }

  const stock = await readStock()

  if (!stock[id]) {
    return null
  }

  const updated = {
    ...stock,
    [id]: {
      ...stock[id],
      quantity: normalizedQuantity
    }
  }

  await writeStock(updated)
  return updated
}

export { STOCK_KEY }
