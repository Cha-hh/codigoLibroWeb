import { MercadoPagoConfig, Payment } from 'mercadopago'
import { upsertOrder } from '../../../../lib/orderStore'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
})

export async function POST(request) {
  try {
    const { type, data } = await request.json()

    if (type === 'payment' && data?.id) {
      const payment = new Payment(client)
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
