import { cookies } from 'next/headers'
import { readOrders, upsertOrder, updateOrderStatus, deleteOrderById } from '../../../lib/orderStore'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../lib/adminAuth'

const noStoreHeaders = { 'Cache-Control': 'no-store, max-age=0' }

export async function GET() {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value
    if (!verifyAdminSessionToken(token)) {
      return Response.json(
        { ok: false, error: 'No autorizado' },
        { status: 401, headers: noStoreHeaders }
      )
    }
    const orders = await readOrders()
    const sorted = [...orders].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime()
      const bTime = new Date(b.createdAt || 0).getTime()
      return bTime - aTime
    })
    return Response.json({ ok: true, orders: sorted }, { headers: noStoreHeaders })
  } catch (error) {
    return Response.json(
      { ok: false, error: 'No se pudieron cargar los pedidos' },
      { status: 500, headers: noStoreHeaders }
    )
  }
}

export async function POST(request) {
  try {
    const { order } = await request.json()
    const saved = await upsertOrder(order)
    return Response.json({ ok: true, order: saved }, { headers: noStoreHeaders })
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || 'No se pudo guardar el pedido' },
      { status: 400, headers: noStoreHeaders }
    )
  }
}

export async function PATCH(request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value
    if (!verifyAdminSessionToken(token)) {
      return Response.json(
        { ok: false, error: 'No autorizado' },
        { status: 401, headers: noStoreHeaders }
      )
    }
    const { id, status, fulfillmentStatus, historyEntry } = await request.json()
    const resolvedStatus = fulfillmentStatus || status
    const updated = await updateOrderStatus(id, resolvedStatus, historyEntry)
    if (!updated) {
      return Response.json(
        { ok: false, error: 'Pedido no encontrado' },
        { status: 404, headers: noStoreHeaders }
      )
    }
    return Response.json({ ok: true, order: updated }, { headers: noStoreHeaders })
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || 'No se pudo actualizar el pedido' },
      { status: 400, headers: noStoreHeaders }
    )
  }
}

export async function DELETE(request) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value
    if (!verifyAdminSessionToken(token)) {
      return Response.json(
        { ok: false, error: 'No autorizado' },
        { status: 401, headers: noStoreHeaders }
      )
    }
    const { id } = await request.json()
    const removed = await deleteOrderById(id)
    if (!removed) {
      return Response.json(
        { ok: false, error: 'Pedido no encontrado' },
        { status: 404, headers: noStoreHeaders }
      )
    }
    return Response.json({ ok: true }, { headers: noStoreHeaders })
  } catch (error) {
    return Response.json(
      { ok: false, error: error.message || 'No se pudo eliminar el pedido' },
      { status: 400, headers: noStoreHeaders }
    )
  }
}
