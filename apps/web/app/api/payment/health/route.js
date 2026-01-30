export async function GET() {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return Response.json(
        { ok: false, error: 'MERCADO_PAGO_ACCESS_TOKEN no configurado' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      let details = {};
      try {
        details = await response.json();
      } catch (error) {
        details = { message: 'Respuesta no JSON' };
      }

      return Response.json(
        { ok: false, error: 'Token inválido o sin permisos', details },
        { status: response.status }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { ok: false, error: 'Error validando token' },
      { status: 500 }
    );
  }
}
