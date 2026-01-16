import { MercadoPago } from 'mercadopago';

const client = new MercadoPago({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

export async function POST(request) {
  try {
    const { type, data } = await request.json();

    if (type === 'payment') {
      // Obtener detalles del pago
      const payment = await client.payment.get(data.id);

      // Procesar según el estado del pago
      if (payment.status === 'approved') {
        const externalReference = payment.external_reference;
        // Aquí se podría actualizar la base de datos con el pago aprobado
        console.log(`Pago aprobado para orden: ${externalReference}`);
      }
    }

    return Response.json({ status: 'received' });
  } catch (error) {
    console.error('Error en webhook:', error);
    return Response.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}
