import { kv } from '@vercel/kv'

const ORDER_KEY = (id) => `order:${id}`
const ORDER_INDEX_KEY = 'orders:index'
const MP_STATUSES = new Set([
  'approved',
  'pending',
  'in_process',
  'rejected',
  'cancelled',
  'refunded',
  'charged_back',
  'in_mediation',
  'authorized'
])

const resolvePaymentStatus = (incoming, existing) => {
  if (incoming?.paymentStatus) return incoming.paymentStatus
  if (incoming?.status && MP_STATUSES.has(incoming.status)) return incoming.status
  if (existing?.paymentStatus) return existing.paymentStatus
  if (existing?.status && MP_STATUSES.has(existing.status)) return existing.status
  return 'pending'
}

const resolveFulfillmentStatus = (incoming, existing) => {
  if (incoming?.fulfillmentStatus) return incoming.fulfillmentStatus
  if (incoming?.status && !MP_STATUSES.has(incoming.status)) return incoming.status
  if (existing?.fulfillmentStatus) return existing.fulfillmentStatus
  if (existing?.status && !MP_STATUSES.has(existing.status)) return existing.status
  return 'pending'
}

export const readOrders = async () => {
  const ids = await kv.zrange(ORDER_INDEX_KEY, 0, -1)
  if (!Array.isArray(ids) || ids.length === 0) {
    return []
  }
  const keys = ids.map((id) => ORDER_KEY(id))
  const records = await kv.mget(...keys)
  const orders = Array.isArray(records) ? records.filter(Boolean) : []
  return orders.reverse()
}

export const writeOrders = async (orders) => {
  if (!Array.isArray(orders)) return
  await kv.del(ORDER_INDEX_KEY)
  for (const order of orders) {
    if (!order?.id) continue
    const createdAt = order.createdAt || new Date().toISOString()
    const score = new Date(createdAt).getTime()
    await kv.set(ORDER_KEY(order.id), { ...order, createdAt })
    await kv.zadd(ORDER_INDEX_KEY, { score, member: order.id })
  }
}

export const upsertOrder = async (order) => {
  if (!order?.id) {
    throw new Error('Order id requerido para guardar')
  }
  const now = new Date().toISOString()
  const existing = await kv.get(ORDER_KEY(order.id))
  const createdAt = existing?.createdAt || order.createdAt || now
  const paymentStatus = resolvePaymentStatus(order, existing)
  const fulfillmentStatus = resolveFulfillmentStatus(order, existing)
  const saved = {
    ...(existing || {}),
    ...order,
    paymentStatus,
    fulfillmentStatus,
    status: fulfillmentStatus,
    createdAt
  }
  await kv.set(ORDER_KEY(order.id), saved)
  await kv.zadd(ORDER_INDEX_KEY, {
    score: new Date(createdAt).getTime(),
    member: order.id
  })
  return saved
}

export const updateOrderStatus = async (id, status, historyEntry) => {
  if (!id) {
    throw new Error('Order id requerido para actualizar')
  }
  const existing = await kv.get(ORDER_KEY(id))
  if (!existing) {
    return null
  }
  const existingHistory = Array.isArray(existing.statusHistory)
    ? existing.statusHistory
    : []

  const updated = {
    ...existing,
    fulfillmentStatus: status,
    status,
    ...(historyEntry
      ? {
          statusHistory: [...existingHistory, historyEntry]
        }
      : {})
  }
  await kv.set(ORDER_KEY(id), updated)
  return updated
}

export const deleteOrderById = async (id) => {
  if (!id) {
    throw new Error('Order id requerido para eliminar')
  }
  const existing = await kv.get(ORDER_KEY(id))
  if (!existing) {
    return false
  }
  await kv.del(ORDER_KEY(id))
  await kv.zrem(ORDER_INDEX_KEY, id)
  return true
}
