# Guía de Testing

## Requisitos previos

1. `.env.local` configurado (ver [MERCADO_PAGO_SETUP.md](MERCADO_PAGO_SETUP.md)) con credenciales de Mercado Pago **sandbox** y Vercel KV
2. `npm run dev` corriendo en `http://localhost:3000`

## Tarjetas de prueba (sandbox Mercado Pago México)

| Resultado | Número | Vencimiento | CVV |
|---|---|---|---|
| Aprobada | 4111 1111 1111 1111 | cualquiera futuro | 123 |
| Aprobada | 5555 5555 5555 4444 | cualquiera futuro | 123 |
| Rechazada | 4000 0000 0000 0002 | cualquiera futuro | 123 |

## Caso 1 — Compra física aprobada

1. `/checkout` → elige 1 unidad → "Continuar al envío"
2. `/checkout/shipping` → llena nombre, correo, dirección → "Continuar al pago"
3. En Mercado Pago, paga con la tarjeta aprobada
4. **Esperado**: regresa a `/checkout/redirect`, muestra "Pago Aprobado", y a los ~500ms redirige a `/`
5. Verifica en `/admin/orders` que la orden aparece con estado `approved`
6. Verifica que `GET /api/stock` bajó en la cantidad comprada

## Caso 2 — Pago rechazado

1. Repite el flujo hasta pagar, usando la tarjeta rechazada
2. **Esperado**: `/checkout/redirect` muestra "Pago Rechazado" con opciones "Intentar de nuevo" / "Volver al inicio"
3. Verifica que el stock **no** cambió

## Caso 3 — Stock insuficiente

1. En `/checkout`, intenta pedir más unidades que el stock disponible
2. **Esperado**: el input se limita al máximo de stock y el botón muestra "Stock insuficiente" deshabilitado

## Caso 4 — Validación del formulario de envío

1. Llega a `/checkout/shipping` con una orden válida
2. Intenta enviar el formulario dejando algún campo obligatorio vacío (nombre, calle, número exterior, municipio, ciudad, código postal o referencias)
3. **Esperado**: el navegador bloquea el envío por validación nativa (`required`)

## Caso 5 — Webhook (opcional, requiere URL pública)

Para probar el webhook en local necesitas un túnel (ngrok, Cloudflare Tunnel, etc.) apuntando a tu `localhost:3000` y configurar `MP_PUBLIC_BASE_URL` con esa URL.

1. Configura la notificación en el panel de Mercado Pago hacia `<tu-túnel>/api/payment/webhook`
2. Completa una compra
3. **Esperado**: revisa los logs del servidor — debe llegar un POST con `type: 'payment'` y guardar/actualizar la orden en KV, independientemente de si `/checkout/redirect` llegó a ejecutarse

## Caso 6 — Panel de administración

1. Entra a `/admin/login` con tus credenciales
2. Revisa `/admin/orders` (lista y filtra pedidos), `/admin/orders/[id]` (detalle y cambio de estado de envío), `/admin/inventory` (ajustar stock)
3. Si tu usuario es `superadmin`, revisa `/admin/users` (alta de nuevos admins); con rol `admin` esa ruta debe redirigir a `/admin/orders`

## Comandos útiles

```javascript
// Ver la orden en curso (antes de pagar)
console.log(JSON.parse(localStorage.getItem('currentOrder')))

// Ver stock actual
fetch('/api/stock').then(r => r.json()).then(console.log)
```

```bash
# Ver pedidos guardados (requiere estar logueado como admin en el navegador,
# o pasar la cookie admin_session)
curl -H "Cookie: admin_session=<token>" http://localhost:3000/api/orders
```

## Checklist

- [ ] Compra física aprobada descuenta stock y aparece en `/admin/orders`
- [ ] Pago rechazado no descuenta stock
- [ ] Stock insuficiente bloquea la compra
- [ ] Formulario de envío valida campos obligatorios
- [ ] Webhook guarda/actualiza la orden aunque el usuario cierre la pestaña
- [ ] Login de admin funciona y protege `/admin/*`
