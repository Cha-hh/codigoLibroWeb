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
    
    const body = {
      items: items,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/redirect?type=success&orderId=${orderId}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/redirect?type=failure&orderId=${orderId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/redirect?type=pending&orderId=${orderId}`
      },
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payment/webhook`,
      external_reference: orderId,
      statement_descriptor: 'LibroWeb',
      binary_mode: true
    };

    const response = await preference.create({ body });

    console.log('✅ Preferencia creada:', response.id);
    
    return Response.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
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
