export async function POST(request) {
  try {
    const { orderId, name, email } = await request.json();

    if (!orderId || !email) {
      return Response.json(
        { success: false, error: 'orderId y email requeridos' },
        { status: 400 }
      );
    }

    console.log('📧 Envío digital solicitado:', { orderId, name, email });

    return Response.json({
      success: true,
      message: 'Entrega digital solicitada'
    });
  } catch (error) {
    console.error('Error en entrega digital:', error);
    return Response.json(
      { success: false, error: 'Error procesando entrega digital' },
      { status: 500 }
    );
  }
}
