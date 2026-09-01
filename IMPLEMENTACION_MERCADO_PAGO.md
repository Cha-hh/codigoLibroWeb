# Resumen Técnico — Integración Mercado Pago

## Stack

- **Next.js 15** (App Router), monorepo Turborepo (`apps/web`)
- **Tailwind CSS** + **daisyUI**
- **Vercel KV** (Redis) — almacenamiento principal: órdenes, stock, FAQ, preguntas de soporte, credenciales de admin
- **Mercado Pago SDK** (`mercadopago` v2) para crear preferencias y consultar pagos
- **bcryptjs** para hashear contraseñas de admin
- **Leaflet** para el mapa de referencia en `/checkout/shipping`

## Rutas API relevantes

| Ruta | Método | Función |
|---|---|---|
| `api/payment/route.js` | POST | Crea la `Preference` en Mercado Pago con los ítems, `back_urls` y datos del comprador |
| `api/payment/webhook/route.js` | POST | Recibe notificaciones server-to-server de MP, valida firma HMAC opcional, resuelve el pago vía API y guarda la orden |
| `api/payment-confirmation/route.js` | POST | Confirma el pago cuando el usuario vuelve del checkout de MP; descuenta stock si `approved` |
| `api/payment/health/route.js` | GET | Valida que el access token configurado es correcto (`GET /users/me` de MP) |
| `api/orders/route.js` | GET/PATCH/DELETE | CRUD de órdenes para el panel admin (todas protegidas por cookie de sesión) |
| `api/stock/route.js` | GET/PUT | Inventario del libro físico (`PUT` requiere sesión admin) |
| `api/admin/*` | varios | Login, logout, cambio de contraseña, gestión de usuarios admin |
| `api/faq/route.js`, `api/questions/route.js` | GET/POST/PUT/DELETE | Preguntas frecuentes y tickets de soporte (lectura y creación públicas, edición/borrado requieren admin) |

## Páginas del flujo de compra

- `/checkout` — elige cantidad de libro físico, valida stock
- `/checkout/shipping` — captura envío (con autocompletado por código postal vía Sepomex/Nominatim y mapa Leaflet), dispara la creación de la preferencia y redirige a Mercado Pago
- `/checkout/redirect` — procesa el retorno de Mercado Pago (`type=success|failure|pending`) y llama a `payment-confirmation`
- `/checkout/digital` — deshabilitada intencionalmente, redirige a `/checkout`

## Seguridad del flujo de pago

Tanto `payment-confirmation` como el `webhook` **resuelven el pago consultando la API de Mercado Pago con el access token del servidor** antes de escribir nada — nunca confían en el `status` que llega del navegador o del cuerpo de la notificación. El webhook además valida la firma `x-signature` cuando `MERCADO_PAGO_WEBHOOK_SECRET` está configurado.

## Autenticación de admin

- Cookie `admin_session` firmado con HMAC-SHA256 (`lib/adminAuth.js`), 7 días de vigencia
- `middleware.js` (Edge runtime) protege todo `/admin/*` excepto `/admin/login`, y restringe `/admin/users` a rol `superadmin`
- Cada ruta API de admin vuelve a verificar el token por su cuenta (defensa en profundidad, no confía solo en el middleware)
- Credenciales configurables por variables de entorno (`ADMIN_USER`/`ADMIN_PASSWORD_HASH`, o `ADMIN_USERS_JSON` para varios) y también gestionables desde el propio panel una vez migradas a KV

## Precios y moneda

| Producto | Precio | Moneda |
|---|---|---|
| Libro físico (lanzamiento) | $369.80 (antes $450.00) | MXN |
| Envío nacional | $100.00 | MXN |

## Fuera de alcance actual

- Entrega de libro digital (checkout digital deshabilitado)
- Envío de correos automáticos (confirmación, tracking)
- Base de datos relacional — todo vive en Vercel KV como almacén clave-valor
