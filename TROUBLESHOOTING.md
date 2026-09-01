# Troubleshooting y FAQ

## Preguntas frecuentes

### ¿Cómo obtengo mis credenciales de Mercado Pago?

[mercadopago.com.mx/developers](https://www.mercadopago.com.mx/developers) → tu aplicación → Credenciales. Usa las de **Sandbox** para pruebas y las de **Producción** solo en el sitio real.

### ¿Dónde van las variables de entorno?

En `apps/web/.env.local` para desarrollo local, o en las variables de entorno del proyecto en Vercel para producción/preview. Ver [MERCADO_PAGO_SETUP.md](MERCADO_PAGO_SETUP.md) para la lista completa.

### ¿Se puede comprar el libro digital?

No por ahora. `/checkout/digital` redirige a `/checkout` — la venta digital está deshabilitada en el frontend, aunque el backend (`/api/payment`) todavía sabe armar ese ítem si se le pide directamente.

### ¿Qué pasa si el usuario cierra la ventana de pago de Mercado Pago?

El webhook (`/api/payment/webhook`) es la fuente de verdad independiente del navegador: en cuanto Mercado Pago resuelve el pago, notifica al servidor y la orden se guarda igual, aunque el usuario nunca vuelva a `/checkout/redirect`.

### ¿Se descuenta el stock automáticamente?

Sí, pero solo cuando el estado del pago devuelto por la API de Mercado Pago es `approved` — nunca se confía en el estado que llega por query string.

### ¿Dónde se guardan las órdenes?

En Vercel KV (`lib/orderStore.js`), no en localStorage. localStorage solo se usa en el navegador para pasar los datos de la orden entre `/checkout`, `/checkout/shipping` y `/checkout/redirect` antes de que el pago se confirme en el servidor.

---

## Errores comunes

### "MERCADO_PAGO_ACCESS_TOKEN no configurado"

**Causa**: falta la variable en `.env.local` (o en Vercel).
**Solución**: agrégala y reinicia `npm run dev`. Verifica rápido con:

```bash
curl http://localhost:3000/api/payment/health
```

### El checkout muestra "Mercado Pago no está configurado"

`/checkout` y `/checkout/shipping` llaman a `GET /api/payment/health` al cargar. Si responde `ok: false`, revisa el access token (puede estar vacío, mal copiado, o ser inválido para la cuenta).

### El stock no cambia después de un pago aprobado

1. Revisa los logs del servidor — `payment-confirmation` atrapa errores de stock con `console.error('Error reduciendo stock:', ...)` sin tumbar la respuesta, así que un fallo ahí es silencioso para el usuario pero debe verse en los logs.
2. Verifica que Vercel KV está configurado (`KV_REST_API_URL`, `KV_REST_API_TOKEN`). Sin KV, `lib/stockStore.js` cae a `stock.json` local, lo cual no funciona en producción (filesystem de solo lectura en Vercel salvo `/tmp`).

### El webhook responde 401 "Firma inválida"

Ocurre cuando `MERCADO_PAGO_WEBHOOK_SECRET` está configurado pero no coincide con el secret real del panel de Mercado Pago (Tu integración → Webhooks → Secret). Si no necesitas validar la firma, deja esa variable vacía — el webhook la valida solo si está presente.

### "No autorizado" al usar el panel de admin

- El cookie `admin_session` expira a los 7 días o si cambia `ADMIN_SESSION_SECRET`.
- Si acabas de cambiar `ADMIN_SESSION_SECRET`, todas las sesiones existentes quedan inválidas — hay que volver a iniciar sesión.
- `middleware.js` protege todo `/admin/*` excepto `/admin/login`; las rutas API de admin (`/api/orders`, `/api/stock` PUT, `/api/admin/*`) también verifican el cookie por su cuenta, así que un 401 puede venir de la API aunque la página cargue.

### `/admin/users` redirige a `/admin/orders`

Es esperado si tu sesión no tiene rol `superadmin`. Solo un superadmin puede administrar otros admins.

### Ciclo raro entre Mercado Pago y el checkout

Revisa `NEXT_PUBLIC_APP_URL` / `MP_PUBLIC_BASE_URL`: deben apuntar exactamente al dominio desde el que se sirve el sitio (sin slash final). Si no coincide, Mercado Pago puede rechazar el retorno o el `auto_return` no se activa (`auto_return: 'approved'` solo se manda si la URL pública es `https://`).

## Debugging rápido

```javascript
// Orden en curso, antes de confirmar el pago
console.log(JSON.parse(localStorage.getItem('currentOrder')))

// Stock actual
fetch('/api/stock').then(r => r.json()).then(console.log)
```

```bash
# Reinstalar todo si algo quedó en mal estado
rm -rf apps/web/.next
npm install
npm run dev
```

Si nada de esto resuelve el problema, revisa los logs del servidor (`npm run dev` o los logs de la función en Vercel) — todas las rutas de pago hacen `console.error` con el detalle del error.
