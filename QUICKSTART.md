# Quickstart

## 1. Instala dependencias

```bash
npm install
```

(Monorepo con workspaces; esto instala también las dependencias de `apps/web`.)

## 2. Configura variables de entorno

```bash
cd apps/web
cp .env.local.example .env.local
```

Como mínimo, para levantar el sitio en local necesitas:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MP_USE_SANDBOX=true
ADMIN_USER=admin
ADMIN_PASSWORD_HASH=  # hash bcrypt, ver MERCADO_PAGO_SETUP.md
ADMIN_SESSION_SECRET=cualquier-string-largo-y-aleatorio
```

Sin `KV_REST_API_URL` / `KV_REST_API_TOKEN`, el stock cae a `stock.json` local (solo sirve para desarrollo). Órdenes, FAQ, preguntas y usuarios admin **sí requieren** Vercel KV incluso en local — ver [MERCADO_PAGO_SETUP.md](MERCADO_PAGO_SETUP.md).

## 3. Levanta el servidor

```bash
npm run dev
```

Abre `http://localhost:3000`.

## 4. Prueba el flujo de compra

1. `/checkout` → elige cantidad de libro físico → "Continuar al envío"
2. `/checkout/shipping` → llena nombre, correo y dirección → "Continuar al pago"
3. Te redirige a Mercado Pago (sandbox). Usa una tarjeta de prueba:

| Resultado | Número | Vencimiento | CVV |
|---|---|---|---|
| Aprobada | 4111 1111 1111 1111 | cualquiera futuro | 123 |
| Rechazada | 4000 0000 0000 0002 | cualquiera futuro | 123 |

4. Mercado Pago te regresa a `/checkout/redirect`, que confirma el pago contra la API de MP y (si fue aprobado) descuenta stock.

> El libro digital está deshabilitado en el checkout actual (`/checkout/digital` solo redirige a `/checkout`). No lo pruebes esperando un flujo distinto.

## 5. Entra al panel de administración

`/admin/login` con el usuario/contraseña que hayas configurado. Desde ahí: pedidos (`/admin/orders`), inventario (`/admin/inventory`), preguntas frecuentes, tickets de soporte y gestión de usuarios admin (solo rol `superadmin`).

## Documentación relacionada

- [MERCADO_PAGO_SETUP.md](MERCADO_PAGO_SETUP.md) — credenciales, variables de entorno, cómo funciona la autenticación de admin
- [FLUJO_COMPRA.md](FLUJO_COMPRA.md) — diagrama detallado del flujo de compra
- [TESTING_GUIDE.md](TESTING_GUIDE.md) — casos de prueba
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) — errores comunes
- [IMPLEMENTACION_MERCADO_PAGO.md](IMPLEMENTACION_MERCADO_PAGO.md) — resumen técnico de la integración
- [ESTRUCTURA_ARCHIVOS.md](ESTRUCTURA_ARCHIVOS.md) — mapa de archivos del proyecto
