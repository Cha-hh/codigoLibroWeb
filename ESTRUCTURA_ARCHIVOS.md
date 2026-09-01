# Estructura de Archivos

```
codigoLibroWeb/                      (raíz del monorepo, workspaces: apps/*)
├── package.json                     scripts turbo (build/dev/start/lint)
├── turbo.json                       tareas y env vars globales
├── stock.json                       fallback local de inventario (sin KV)
├── faq.json                         semilla inicial de FAQ (se migra a KV)
│
└── apps/web/                        único workspace de la app (Next.js 15, App Router)
    ├── middleware.js                protege /admin/* (Edge runtime)
    ├── next.config.js
    ├── tailwind.config.js
    │
    ├── lib/
    │   ├── mercadopago.js           cliente MP + detección de sandbox
    │   ├── orderStore.js            CRUD de órdenes sobre Vercel KV
    │   ├── stockStore.js            inventario (KV, o stock.json en local)
    │   ├── adminAuth.js             firma/verifica el cookie de sesión admin
    │   ├── adminCredentials.js      resuelve credenciales (env + KV)
    │   └── adminStore.js            credenciales/roles de admin en KV
    │
    └── app/
        ├── page.js                  home / landing del libro
        ├── layout.js
        │
        ├── checkout/
        │   ├── page.js              elige cantidad de libro físico
        │   ├── shipping/page.js     datos de envío → crea preferencia MP → redirige a pagar
        │   ├── redirect/
        │   │   ├── page.js
        │   │   └── client.js        procesa el retorno de Mercado Pago
        │   └── digital/page.js      deshabilitada, redirige a /checkout
        │
        ├── faq/page.js              FAQ pública
        ├── components/ShippingMap.js  mapa Leaflet (dinámico, sin SSR)
        │
        ├── admin/                   panel de administración (protegido por middleware)
        │   ├── login/page.js
        │   ├── orders/page.js       lista y filtra pedidos
        │   ├── orders/[id]/page.js  detalle y cambio de estado de un pedido
        │   ├── inventory/page.js    ajustar stock, estadísticas de ventas
        │   ├── faq/page.js          gestión de FAQ
        │   ├── tickets/page.js      preguntas de soporte
        │   ├── users/page.js        alta/baja de admins (solo superadmin)
        │   └── change-password/page.js
        │
        └── api/
            ├── payment/route.js               POST — crea preferencia en MP
            ├── payment/webhook/route.js        POST — notificación server-to-server de MP
            ├── payment/health/route.js         GET  — valida el access token
            ├── payment-confirmation/route.js   POST — confirma pago al volver de MP
            ├── orders/route.js                 GET/PATCH/DELETE — pedidos (admin)
            ├── stock/route.js                  GET/PUT — inventario
            ├── faq/route.js                    GET/POST/PUT/DELETE
            ├── questions/route.js              GET/POST/PATCH/DELETE — tickets de soporte
            └── admin/
                ├── login/route.js, logout/route.js, me/route.js
                ├── change-password/route.js
                ├── users/route.js, users/[username]/route.js
                └── users/[username]/reset-password/route.js
```

## Variables de entorno

Ver [MERCADO_PAGO_SETUP.md](MERCADO_PAGO_SETUP.md) para la lista completa y explicada; la plantilla vive en `apps/web/.env.local.example`.

## Persistencia

Todo pasa por **Vercel KV** (`@vercel/kv`), no por una base de datos relacional ni por localStorage:

- Órdenes → `lib/orderStore.js`
- Inventario → `lib/stockStore.js` (con fallback a `stock.json` solo si no hay KV configurado, útil para desarrollo local)
- FAQ y preguntas de soporte → claves propias en `api/faq/route.js` y `api/questions/route.js`
- Credenciales/roles de admin → `lib/adminStore.js`

`localStorage` en el navegador solo se usa como estado temporal del carrito mientras el usuario pasa por `/checkout` → `/checkout/shipping` → Mercado Pago → `/checkout/redirect`; la orden persistente se crea en KV recién cuando el pago se confirma contra la API de Mercado Pago.
