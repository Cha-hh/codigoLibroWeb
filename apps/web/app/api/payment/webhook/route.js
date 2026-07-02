import { Payment } from 'mercadopago'
import { getMpClient } from '../../../../lib/mercadopago'
import { upsertOrder } from '../../../../lib/orderStore'

const verifyWebhookSignature = async (request, body) => {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET
  if (!secret) return true

  const signatureHeader = request.headers.get('x-signature')
  const requestId = request.headers.get('x-request-id') || ''
  if (!signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => part.trim().split('='))
  )
  const { ts, v1 } = parts
  if (!ts || !v1) return false

  const signedString = `id:${body?.data?.id};request-id:${requestId};ts:${ts};`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const rawSig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedString))
  const expected = Array.from(new Uint8Array(rawSig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return expected === v1
}

export async function POST(request) {
  try {
    const body = await request.json()

    const isValid = await verifyWebhookSignature(request, body)
    if (!isValid) {
      return Response.json({ error: 'Firma inválida' }, { status: 401 })
    }

    const { type, data } = body

    if (type === 'payment' && data?.id) {
      const payment = new Payment(getMpClient())
      const paymentDetails = await payment.get({ id: data.id })

      if (paymentDetails?.external_reference) {
        await upsertOrder({
          id: paymentDetails.external_reference,
          paymentId: paymentDetails.id,
          status: paymentDetails.status || 'pending',
          total: paymentDetails.transaction_amount,
          updatedAt: new Date().toISOString(),
          source: 'webhook'
        })
      }
    }

    return Response.json({ status: 'received' })
  } catch (error) {
    console.error('Error en webhook:', error)
    return Response.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    )
  }
}
