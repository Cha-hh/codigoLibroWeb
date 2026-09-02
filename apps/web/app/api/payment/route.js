import { Preference } from 'mercadopago'
import { getMpClient, isSandboxToken } from '../../../lib/mercadopago'

export async function POST(request) {
  try {
    const { physical, digital, total, orderId, shipping } = await request.json()

    if (!orderId || (physical === 0 && digital === 0)) {
      return Response.json(
        { error: 'Datos de orden inválidos' },
        { status: 400 }
      )
    }

    const items = []

    if (physical > 0) {
      items.push({
        id: 'book-physical',
        title: 'Libro Físico',
        description: `${physical} unidad(es) - Precio de lanzamiento`,
        quantity: physical,
        currency_id: 'MXN',
        unit_price: 369.80
      })
      items.push({
        id: 'shipping',
        title: 'Envío a toda la república',
        description: 'Envío nacional (zona urbana)',
        quantity: 1,
        currency_id: 'MXN',
        unit_price: 100
      })
    }

    if (digital > 0) {
      items.push({
        id: 'book-digital',
        title: 'Libro Digital',
        description: `${digital} unidad(es) - Descarga inmediata`,
        quantity: digital,
        currency_id: 'MXN',
        unit_price: 300
      })
    }

    const publicBaseUrl =
      process.env.MP_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'

    const notificationUrl =
      process.env.MERCADO_PAGO_NOTIFICATION_URL ||
      `${publicBaseUrl}/api/payment/webhook`

    const canAutoReturn = publicBaseUrl.startsWith('https://')

    const body = {
      items,
      back_urls: {
        success: `${publicBaseUrl}/checkout/redirect?type=success&orderId=${orderId}`,
        failure: `${publicBaseUrl}/checkout/redirect?type=failure&orderId=${orderId}`,
        pending: `${publicBaseUrl}/checkout/redirect?type=pending&orderId=${orderId}`
      },
      ...(canAutoReturn ? { auto_return: 'approved' } : {}),
      notification_url: notificationUrl,
      external_reference: orderId,
      statement_descriptor: 'LibroWeb',
      binary_mode: true
    }

    if (shipping && typeof shipping === 'object') {
      const fullName = String(shipping.name || '').trim()
      const nameParts = fullName.split(/\s+/).filter(Boolean)
      const firstName = nameParts[0] || undefined
      const lastName = nameParts.slice(1).join(' ') || undefined

      const streetNumberRaw = String(shipping.externalNumber || '').trim()
      const streetNumberMatch = streetNumberRaw.match(/\d+/)
      const streetNumber = streetNumberMatch ? Number(streetNumberMatch[0]) : undefined

      const payer = {
        ...(firstName ? { name: firstName } : {}),
        ...(lastName ? { surname: lastName } : {}),
        ...(shipping.email ? { email: shipping.email } : {}),
        address: {
          ...(shipping.postalCode ? { zip_code: shipping.postalCode } : {}),
          ...(shipping.street ? { street_name: shipping.street } : {}),
          ...(Number.isFinite(streetNumber) ? { street_number: streetNumber } : {})
        }
      }

      if (Object.keys(payer.address).length === 0) delete payer.address
      if (Object.keys(payer).length > 0) body.payer = payer

      const metadata = {
        order_id: orderId,
        address_line: shipping.address || '',
        state: shipping.state || '',
        municipality: shipping.municipality || '',
        city: shipping.city || '',
        colony: shipping.colony || '',
        references: shipping.references || '',
        postal_code: shipping.postalCode || '',
        country: shipping.country || ''
      }

      body.metadata = Object.fromEntries(
        Object.entries(metadata).filter(([, value]) => Boolean(String(value || '').trim()))
      )
    }

    const preference = new Preference(getMpClient())
    const response = await preference.create({ body })

    const useSandbox =
      isSandboxToken() ||
      process.env.MP_FORCE_SANDBOX === 'true' ||
      process.env.NEXT_PUBLIC_MP_USE_SANDBOX === 'true'

    const checkoutUrl =
      (useSandbox ? response.sandbox_init_point : response.init_point) ||
      response.sandbox_init_point ||
      response.init_point

    return Response.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      checkout_url: checkoutUrl,
      use_sandbox: useSandbox
    })
  } catch (error) {
    console.error('Error al crear preferencia de pago:', error.message)
    return Response.json(
      {
        error: error.message || 'Error al procesar el pago',
        details: error.response?.data || {}
      },
      { status: 500 }
    )
  }
}
