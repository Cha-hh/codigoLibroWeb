import { Payment } from 'mercadopago'
import { getMpClient } from '../../../lib/mercadopago'
import { upsertOrder } from '../../../lib/orderStore'
import { readStock, updateStockItemQuantity } from '../../../lib/stockStore'

const fetchMpJson = async (url, accessToken) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store'
  })
  if (!res.ok) return null
  return res.json()
}

const resolvePaymentId = async (paymentId, merchantOrderId, orderId, accessToken) => {
  if (paymentId) return paymentId

  if (merchantOrderId) {
    const data = await fetchMpJson(
      `https://api.mercadopago.com/merchant_orders/${merchantOrderId}`,
      accessToken
    )
    const payments = Array.isArray(data?.payments) ? data.payments : []
    const approved = payments.find((p) => p?.status === 'approved')
    const id = approved?.id || payments[payments.length - 1]?.id || null
    if (id) return id
  }

  if (orderId) {
    const data = await fetchMpJson(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderId)}`,
      accessToken
    )
    const results = Array.isArray(data?.results) ? data.results : []
    const approved = results.find((p) => p?.status === 'approved')
    return approved?.id || results[0]?.id || null
  }

  return null
}

export async function POST(request) {
  try {
    const { paymentId, merchantOrderId, orderId, order } = await request.json()

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
    if (!accessToken) {
      return Response.json(
        { success: false, error: 'MERCADO_PAGO_ACCESS_TOKEN no configurado' },
        { status: 500 }
      )
    }

    const resolvedPaymentId = await resolvePaymentId(
      paymentId,
      merchantOrderId,
      orderId,
      accessToken
    )

    if (!resolvedPaymentId) {
      return Response.json(
        { success: false, error: 'No se pudo resolver el ID del pago' },
        { status: 400 }
      )
    }

    const payment = new Payment(getMpClient())
    const paymentDetails = await payment.get({ id: resolvedPaymentId })

    const resolvedOrderId = orderId || paymentDetails.external_reference
    if (resolvedOrderId) {
      await upsertOrder({
        ...order,
        id: resolvedOrderId,
        paymentId: paymentDetails.id,
        paymentStatus: paymentDetails.status || 'pending',
        total: order?.total ?? paymentDetails.transaction_amount,
        updatedAt: new Date().toISOString(),
        source: order ? 'confirmation' : 'confirmation-min'
      })
    }

    if (paymentDetails.status === 'approved') {
      if (order?.physical > 0) {
        try {
          const currentStock = await readStock()
          const currentQty = currentStock.book?.quantity ?? 0
          await updateStockItemQuantity('book', Math.max(0, currentQty - order.physical))
        } catch (err) {
          console.error('Error reduciendo stock:', err)
        }
      }

      return Response.json({
        success: true,
        status: 'approved',
        paymentId: paymentDetails.id,
        message: 'Pago procesado correctamente'
      })
    }

    return Response.json({
      success: false,
      status: paymentDetails.status,
      paymentId: paymentDetails.id,
      message: 'El pago no fue aprobado'
    })
  } catch (error) {
    console.error('Error en confirmación de pago:', error)
    return Response.json(
      { success: false, error: 'Error confirmando pago', details: error?.message },
      { status: 500 }
    )
  }
}
