import { MercadoPagoConfig, Payment } from 'mercadopago';
import { upsertOrder } from '../../../lib/orderStore';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

export async function POST(request) {
  try {
    const { paymentId, merchantOrderId, orderId, order } = await request.json();

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return Response.json(
        { success: false, error: 'MERCADO_PAGO_ACCESS_TOKEN no configurado' },
        { status: 500 }
      );
    }

    const resolvePaymentIdFromMerchantOrder = async (id) => {
      const response = await fetch(`https://api.mercadopago.com/merchant_orders/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      const payments = Array.isArray(data?.payments) ? data.payments : [];
      const approved = payments.find(item => item?.status === 'approved');
      return approved?.id || payments[payments.length - 1]?.id || null;
    };

    const resolvePaymentIdFromExternalReference = async (externalReference) => {
      if (!externalReference) return null;
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(externalReference)}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: 'no-store'
        }
      );
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      const approved = results.find(item => item?.status === 'approved');
      return approved?.id || results[0]?.id || null;
    };

    let resolvedPaymentId = paymentId;

    if (!resolvedPaymentId && merchantOrderId) {
      resolvedPaymentId = await resolvePaymentIdFromMerchantOrder(merchantOrderId);
    }

    if (!resolvedPaymentId && orderId) {
      resolvedPaymentId = await resolvePaymentIdFromExternalReference(orderId);
    }

    if (!resolvedPaymentId) {
      return Response.json(
        { success: false, error: 'paymentId requerido o no se pudo resolver' },
        { status: 400 }
      );
    }

    // Obtener detalles del pago desde Mercado Pago
    const payment = new Payment(client);
    const paymentDetails = await payment.get({ id: resolvedPaymentId });

    const resolvedOrderId = orderId || paymentDetails.external_reference;
    if (resolvedOrderId) {
      await upsertOrder({
        ...order,
        id: resolvedOrderId,
        paymentId: paymentDetails.id,
        status: paymentDetails.status || 'pending',
        total: order?.total ?? paymentDetails.transaction_amount,
        updatedAt: new Date().toISOString(),
        source: order ? 'confirmation' : 'confirmation-min'
      });
    }

    if (paymentDetails.status === 'approved') {
      return Response.json({
        success: true,
        status: 'approved',
        paymentId: paymentDetails.id,
        message: 'Pago procesado correctamente'
      });
    } else {
      return Response.json({
        success: false,
        status: paymentDetails.status,
        paymentId: paymentDetails.id,
        message: 'El pago no fue aprobado'
      });
    }
  } catch (error) {
    console.error('Error en confirmación de pago:', error);
    return Response.json(
      { success: false, error: 'Error confirmando pago', details: error?.message },
      { status: 500 }
    );
  }
}
