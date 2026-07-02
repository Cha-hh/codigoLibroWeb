import { cookies } from 'next/headers'
import { readStock, updateStockItemQuantity } from '../../../lib/stockStore'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../lib/adminAuth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stock = await readStock()
    return new Response(JSON.stringify(stock), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } catch (error) {
    console.error('Error reading stock:', error)
    return new Response(JSON.stringify({ message: 'Error reading stock' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  }
}

export async function PUT(request) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  const session = verifyAdminSessionToken(token)
  if (!session) {
    return new Response(JSON.stringify({ message: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const { id, quantity } = await request.json()
    const updated = await updateStockItemQuantity(id, quantity)

    if (!updated) {
      return new Response(JSON.stringify({ message: 'Item not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(
      JSON.stringify({
        message: 'Stock updated',
        stock: updated
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    )
  } catch (error) {
    const status = error.message === 'Cantidad inválida' || error.message === 'Item requerido' ? 400 : 500
    return new Response(JSON.stringify({ message: error.message || 'Error updating stock' }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  }
}
