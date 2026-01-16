import { MercadoPago } from 'mercadopago';

const client = new MercadoPago({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

export async function POST(request) {
  try {
    const { paymentId, orderId, order } = await request.json();

    // Obtener detalles del pago desde Mercado Pago
    const paymentDetails = await client.payment.get(paymentId);

    if (paymentDetails.status === 'approved') {
      // El pago fue aprobado, ahora procesar la orden
      if (order.physical > 0) {
        // Descontar del inventario
        try {
          const stockRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock`);
          const stock = await stockRes.json();
          const currentQuantity = stock.book?.quantity || 0;
          const newQuantity = Math.max(0, currentQuantity - order.physical);
          
          await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: 'book', quantity: newQuantity }),
          });
        } catch (error) {
          console.error('Error al descontar del inventario:', error);
        }
      }

      // Guardar la orden completada
      try {
        const existingOrders = JSON.parse(global.localStorage?.getItem('orders') || '[]');
        const newOrder = {
          id: orderId,
          ...order,
          paymentId: paymentId,
          status: 'approved',
          createdAt: new Date().toISOString()
        };
        existingOrders.push(newOrder);
        if (global.localStorage) {
          global.localStorage.setItem('orders', JSON.stringify(existingOrders));
        }
      } catch (error) {
        console.error('Error al guardar orden:', error);
      }

      return Response.json({
        success: true,
        status: 'approved',
        message: 'Pago procesado correctamente'
      });
    } else {
      return Response.json({
        success: false,
        status: paymentDetails.status,
        message: 'El pago no fue aprobado'
      });
    }
  } catch (error) {
    console.error('Error en confirmación de pago:', error);
    return Response.json(
      { success: false, error: 'Error confirmando pago' },
      { status: 500 }
    );
  }
}
