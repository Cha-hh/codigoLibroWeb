# Configuración

## Variables de entorno

Archivo `apps/web/.env.local` (o variables de entorno del proyecto en Vercel). Ver `apps/web/.env.local.example` para la plantilla completa.

### Mercado Pago

```env
MERCADO_PAGO_ACCESS_TOKEN=          # server-side, empieza con TEST- en sandbox
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=  # client-side
MERCADO_PAGO_WEBHOOK_SECRET=        # opcional; si se define, se valida la firma x-signature del webhook
NEXT_PUBLIC_MP_USE_SANDBOX=true     # fuerza el uso de sandbox_init_point en el frontend
MP_PUBLIC_BASE_URL=                 # URL pública (ngrok/dominio) para back_urls y notification_url en local
```

Obtén las credenciales en [mercadopago.com.mx/developers](https://www.mercadopago.com.mx/developers) → Credenciales (Sandbox para pruebas, Producción para el sitio real). `lib/mercadopago.js` detecta sandbox automáticamente si el access token empieza con `TEST-`.

### App

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel KV

```env
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

Es el almacenamiento real de la app (`@vercel/kv`): órdenes, FAQ, preguntas de soporte, contraseñas y roles de admin, e inventario. Sin esto configurado, casi nada funciona salvo el stock (que cae a `stock.json` local — ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).

### Autenticación de admin

```env
ADMIN_USER=admin
ADMIN_PASSWORD_HASH=       # hash bcrypt de la contraseña
ADMIN_USERS_JSON=          # opcional, lista JSON de admins adicionales
ADMIN_SESSION_SECRET=      # secreto para firmar el cookie de sesión (HMAC-SHA256)
```

Genera el hash con bcryptjs:

```bash
node -e "console.log(require('bcryptjs').hashSync('tu-contraseña', 12))"
```

`ADMIN_USERS_JSON` acepta varios admins con rol, por ejemplo:

```json
[{"username":"maria","passwordHash":"$2a$12$...","role":"superadmin"}]
```

Los admins definidos por variables de entorno se sincronizan a Vercel KV en el primer login; desde ahí también se pueden crear/eliminar admins vía el panel (`/admin/users`, solo visible para `role: superadmin`).

## Cómo funciona el flujo de pago

1. `/checkout` y `/checkout/shipping` arman la orden en el navegador (localStorage temporal) y la mandan a `POST /api/payment`, que crea una **Preference** en Mercado Pago con `back_urls` apuntando a `/checkout/redirect`.
2. El usuario paga en el checkout hospedado por Mercado Pago.
3. Mercado Pago redirige de vuelta a `/checkout/redirect?type=...&payment_id=...&orderId=...`. Esa página llama a `POST /api/payment-confirmation`, que **resuelve el pago consultando la API de Mercado Pago** (nunca confía en los query params), guarda la orden en KV con el estado real, y descuenta stock si el estado es `approved`.
4. En paralelo, Mercado Pago notifica de forma server-to-server a `POST /api/payment/webhook`. Es el respaldo si el usuario cierra el navegador antes del paso 3 — también consulta la API de MP antes de guardar nada, y valida la firma HMAC (`x-signature`) cuando `MERCADO_PAGO_WEBHOOK_SECRET` está configurado.

Ninguna de las dos rutas confía en el `status` que manda el cliente: ambas piden el pago real a Mercado Pago con el `access_token` del servidor antes de marcar una orden como aprobada o tocar el inventario.

## Rutas API principales

| Ruta | Método | Auth | Descripción |
|---|---|---|---|
| `/api/payment` | POST | — | Crea la preferencia de pago en Mercado Pago |
| `/api/payment/webhook` | POST | firma HMAC opcional | Notificación server-to-server de Mercado Pago |
| `/api/payment-confirmation` | POST | — | Confirma el pago al volver de Mercado Pago |
| `/api/payment/health` | GET | — | Verifica que el access token de MP es válido |
| `/api/orders` | GET/PATCH/DELETE | cookie admin | Listado y gestión de pedidos |
| `/api/stock` | GET/PUT | PUT requiere cookie admin | Inventario del libro físico |
| `/api/admin/login` | POST | — | Login de admin (bcrypt + cookie firmado) |

## Pendiente / fuera de alcance actual

- No hay entrega de libro digital: el checkout digital está deshabilitado (`/checkout/digital` redirige a `/checkout`).
- No hay envío de correos automáticos (confirmación, tracking, etc.).
- El stock del libro físico vive en KV (o `stock.json` en local); no hay un sistema de inventario más robusto.
