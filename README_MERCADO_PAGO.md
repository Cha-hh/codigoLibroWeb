# Índice de Documentación

Documentación del sitio (Next.js + Mercado Pago + Vercel KV). Empieza por [QUICKSTART.md](QUICKSTART.md) si es tu primera vez en el proyecto.

| Documento | Contenido |
|---|---|
| [QUICKSTART.md](QUICKSTART.md) | Instalación, variables de entorno mínimas, primer flujo de compra de prueba |
| [MERCADO_PAGO_SETUP.md](MERCADO_PAGO_SETUP.md) | Todas las variables de entorno, cómo funciona el flujo de pago y la autenticación de admin, rutas API |
| [FLUJO_COMPRA.md](FLUJO_COMPRA.md) | Diagrama detallado del flujo de compra, estados de pago, validaciones |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Casos de prueba (compra aprobada, rechazada, stock, webhook, panel admin) |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | FAQ y errores comunes con su causa y solución |
| [IMPLEMENTACION_MERCADO_PAGO.md](IMPLEMENTACION_MERCADO_PAGO.md) | Resumen técnico: stack, rutas API, seguridad del flujo de pago |
| [ESTRUCTURA_ARCHIVOS.md](ESTRUCTURA_ARCHIVOS.md) | Mapa de archivos del proyecto y dónde vive cada dato (Vercel KV) |

## Estado actual del proyecto

- ✅ Compra de libro físico con Mercado Pago (preferencia, confirmación por retorno + webhook, descuento de stock)
- ✅ Panel de administración (pedidos, inventario, FAQ, tickets de soporte, usuarios admin con roles)
- ✅ Persistencia en Vercel KV
- ❌ Venta/entrega de libro digital (checkout deshabilitado)
- ❌ Envío de correos automáticos
- ❌ Base de datos relacional (se usa KV como almacén clave-valor)

## Notas

- El proyecto se despliega en Vercel (`.vercel/project.json`); `turbo build` corre el build de `apps/web`.
- Este README y los documentos que enlaza se reescribieron para reflejar el código actual — si vuelves a cambiar el flujo de compra o el panel de admin, actualízalos también.
