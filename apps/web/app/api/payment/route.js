import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const { physical, digital, total, orderId, shipping } = await request.json();

    // Validar que haya productos
    if (!orderId || (physical === 0 && digital === 0)) {
      return Response.json(
        { error: 'Datos de orden inválidos' },
        { status: 400 }
      );
    }

    // Crear items para la preferencia
    const items = [];
    
    if (physical > 0) {
      items.push({
        id: 'book-physical',
        title: 'Libro Físico',
        description: `${physical} unidad(es) - Envío nacional incluido`,
        quantity: physical,
        currency_id: 'MXN',
        unit_price: 450
      });
    }

    if (digital > 0) {
      items.push({
        id: 'book-digital',
        title: 'Libro Digital',
        description: `${digital} unidad(es) - Descarga inmediata`,
        quantity: digital,
        currency_id: 'MXN',
        unit_price: 300
      });
    }

    // Crear la preferencia de pago usando el SDK
    const preference = new Preference(client);
    
    const publicBaseUrl = process.env.MP_PUBLIC_BASE_URL
      || process.env.NEXT_PUBLIC_APP_URL
      || 'http://localhost:3000';
    const notificationUrl = process.env.MERCADO_PAGO_NOTIFICATION_URL || process.env.MP_NOTIFICATION_URL || `${publicBaseUrl}/api/payment/webhook`;
    const canAutoReturn = publicBaseUrl.startsWith('https://');

    const body = {
      items: items,
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
    };

    if (shipping && typeof shipping === 'object') {
      const fullName = String(shipping.name || '').trim();
      const nameParts = fullName.split(/\s+/).filter(Boolean);
      const firstName = nameParts[0] || undefined;
      const lastName = nameParts.slice(1).join(' ') || undefined;

      const streetNumberRaw = String(shipping.externalNumber || '').trim();
      const streetNumberMatch = streetNumberRaw.match(/\d+/);
      const streetNumber = streetNumberMatch ? Number(streetNumberMatch[0]) : undefined;

      const payer = {
        ...(firstName ? { name: firstName } : {}),
        ...(lastName ? { surname: lastName } : {}),
        ...(shipping.email ? { email: shipping.email } : {}),
        address: {
          ...(shipping.postalCode ? { zip_code: shipping.postalCode } : {}),
          ...(shipping.street ? { street_name: shipping.street } : {}),
          ...(Number.isFinite(streetNumber) ? { street_number: streetNumber } : {})
        }
      };

      if (Object.keys(payer.address).length === 0) {
        delete payer.address;
      }

      if (Object.keys(payer).length > 0) {
        body.payer = payer;
      }

      const metadata = {
        order_id: orderId,
        address_line: shipping.address || '',
        municipality: shipping.municipality || '',
        city: shipping.city || '',
        colony: shipping.colony || '',
        references: shipping.references || '',
        postal_code: shipping.postalCode || '',
        country: shipping.country || ''
      };

      body.metadata = Object.fromEntries(
        Object.entries(metadata).filter(([, value]) => Boolean(String(value || '').trim()))
      );
    }

    const response = await preference.create({ body });

    console.log('✅ Preferencia creada:', response.id);

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const forceSandbox = (process.env.MP_FORCE_SANDBOX === 'true')
      || (process.env.NEXT_PUBLIC_MP_FORCE_SANDBOX === 'true');
    const useSandbox = forceSandbox
      || isDevelopment
      || (process.env.MP_USE_SANDBOX === 'true')
      || (process.env.NEXT_PUBLIC_MP_USE_SANDBOX === 'true')
      || accessToken.startsWith('TEST-');
    const checkoutUrl = (useSandbox ? response.sandbox_init_point : response.init_point)
      || response.sandbox_init_point
      || response.init_point;

    console.log('✅ Checkout generado:', {
      use_sandbox: useSandbox,
      checkout_url: checkoutUrl,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      orderId
    });

    return Response.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      checkout_url: checkoutUrl,
      use_sandbox: useSandbox
    });
  } catch (error) {
    console.error('❌ Error al crear preferencia:', error.message);
    console.error('Detalles:', error);
    
    return Response.json(
      { 
        error: error.message || 'Error al procesar el pago',
        details: error.response?.data || {}
      },
      { status: 500 }
    );
  }
}
