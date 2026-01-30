import fs from 'fs/promises'
import path from 'path'

const resolveStorePath = () => {
  const cwd = process.cwd()
  const appsWebPath = path.join('apps', 'web')
  const isInAppsWeb = cwd.endsWith(appsWebPath)
  const baseDir = isInAppsWeb ? cwd : path.join(cwd, appsWebPath)
  return path.join(baseDir, '.data', 'orders.json')
}

const ensureStoreFile = async () => {
  const storePath = resolveStorePath()
  await fs.mkdir(path.dirname(storePath), { recursive: true })
  try {
    await fs.access(storePath)
  } catch {
    await fs.writeFile(storePath, '[]', 'utf-8')
  }
  return storePath
}

export const readOrders = async () => {
  const storePath = await ensureStoreFile()
  const raw = await fs.readFile(storePath, 'utf-8')
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const writeOrders = async (orders) => {
  const storePath = await ensureStoreFile()
  await fs.writeFile(storePath, JSON.stringify(orders, null, 2), 'utf-8')
}

export const upsertOrder = async (order) => {
  if (!order?.id) {
    throw new Error('Order id requerido para guardar')
  }
  const orders = await readOrders()
  const existingIndex = orders.findIndex(item => item.id === order.id)
  const now = new Date().toISOString()

  if (existingIndex >= 0) {
    const existing = orders[existingIndex]
    orders[existingIndex] = {
      ...existing,
      ...order,
      createdAt: existing.createdAt || order.createdAt || now
    }
  } else {
    orders.push({
      status: 'pending',
      createdAt: order.createdAt || now,
      ...order
    })
  }

  await writeOrders(orders)
  return orders.find(item => item.id === order.id)
}

export const updateOrderStatus = async (id, status) => {
  if (!id) {
    throw new Error('Order id requerido para actualizar')
  }
  const orders = await readOrders()
  const targetIndex = orders.findIndex(item => item.id === id)
  if (targetIndex === -1) {
    return null
  }
  orders[targetIndex] = {
    ...orders[targetIndex],
    status
  }
  await writeOrders(orders)
  return orders[targetIndex]
}
