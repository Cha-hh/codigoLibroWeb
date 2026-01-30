import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  try {
    const { physical, digital, total, orderId } = await request.json();

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
        description: `${physical} unidad(es) - Envío incluido`,
        quantity: physical,
        currency_id: 'MXN',
        unit_price: 20
      });
    }

    if (digital > 0) {
      items.push({
        id: 'book-digital',
        title: 'Libro Digital',
        description: `${digital} unidad(es) - Descarga inmediata`,
        quantity: digital,
        currency_id: 'MXN',
        unit_price: 10
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

    const response = await preference.create({ body });

    console.log('✅ Preferencia creada:', response.id);

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
    const isTestToken = accessToken.startsWith('TEST-');
    const forceSandbox = (process.env.MP_USE_SANDBOX === 'true') || (process.env.NEXT_PUBLIC_MP_USE_SANDBOX === 'true');

    if (forceSandbox && !isTestToken) {
      return Response.json(
        { error: 'MP_USE_SANDBOX requiere un access token TEST-' },
        { status: 400 }
      );
    }

    const useSandbox = isTestToken || forceSandbox;
    const checkoutUrl = (useSandbox ? response.sandbox_init_point : response.init_point)
      || response.sandbox_init_point
      || response.init_point;

    console.log('✅ Checkout generado:', {
      use_sandbox: useSandbox,
      is_test_token: isTestToken,
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
      use_sandbox: useSandbox,
      is_test_token: isTestToken
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
