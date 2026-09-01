# Flujo de Compra

Solo existe venta de libro físico (el digital está deshabilitado en el checkout actual). El envío se captura **antes** del pago, no después.

```
/checkout
  Usuario elige cantidad de libro físico (valida contra /api/stock)
  Guarda { physical, digital: 0, total } en localStorage
      │
      ▼
/checkout/shipping
  Usuario ingresa nombre, correo, dirección (con autocompletado
  por código postal vía Sepomex + Nominatim, y mapa Leaflet)
  Guarda la orden + datos de envío en localStorage
      │
      ▼
  POST /api/payment  { physical, digital, total, orderId, shipping }
  → crea una Preference en Mercado Pago
  → responde con checkout_url (sandbox o producción)
      │
      ▼
  Redirige al checkout hospedado de Mercado Pago
  Usuario paga (o cancela)
      │
      ▼
  Mercado Pago redirige a:
  /checkout/redirect?type=success|failure|pending&payment_id=...&orderId=...
      │
      ▼
  Si type=success:
    POST /api/payment-confirmation { paymentId, orderId, order }
    → resuelve el pago contra la API de Mercado Pago (fuente de verdad)
    → guarda la orden en Vercel KV con el estado real
    → si status === 'approved': descuenta stock del libro físico
      │
      ├─ approved → mensaje "Pago Aprobado" → redirige a "/"
      ├─ no aprobado → mensaje de error, opción de reintentar
      │
  Si type=failure → "Pago Rechazado", opciones: reintentar o volver al inicio
  Si type=pending → "Pago Pendiente", vuelve al inicio

En paralelo (server-to-server, independiente del navegador):
  Mercado Pago → POST /api/payment/webhook
  → valida firma x-signature (si MERCADO_PAGO_WEBHOOK_SECRET está configurado)
  → resuelve el pago contra la API de MP y guarda/actualiza la orden en KV
  Este webhook es el respaldo si el usuario cierra la pestaña
  antes de que /checkout/redirect termine de confirmar.
```

## Estados de pago

| Estado en Mercado Pago | Qué pasa en el sitio |
|---|---|
| `approved` | Orden guardada como aprobada, stock descontado, mensaje de éxito |
| `pending` / `in_process` | Orden guardada como pendiente, mensaje "pago pendiente" |
| `rejected` / `cancelled` | Mensaje "pago rechazado", opción de reintentar; **no** se toca el stock |

## Validaciones

**Antes de crear la preferencia** (`/checkout`, `/checkout/shipping`):
- Al menos 1 unidad de libro físico seleccionada
- Cantidad ≤ stock disponible (`GET /api/stock`)
- Campos de envío completos y correo con formato válido

**Al confirmar el pago** (`/api/payment-confirmation` y `/api/payment/webhook`):
- El estado del pago se obtiene siempre de la API de Mercado Pago, nunca del query string ni del body que manda el navegador
- El stock solo se descuenta si el estado resuelto es `approved`

## Precios actuales

| Producto | Precio | Moneda |
|---|---|---|
| Libro físico (lanzamiento) | $369.80 (antes $450.00) | MXN |
| Envío nacional | $100.00 | MXN |

Definidos en [checkout/page.js](apps/web/app/checkout/page.js) (frontend) y replicados en [api/payment/route.js](apps/web/app/api/payment/route.js) al construir los ítems de la preferencia.
