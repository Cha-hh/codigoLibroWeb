# Integración Mercado Pago - Guía de Configuración

## Variables de Entorno Requeridas

Crea un archivo `.env.local` en `/apps/web/` con las siguientes variables:

```
# Mercado Pago API
MERCADO_PAGO_ACCESS_TOKEN=tu_access_token_aqui
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=tu_public_key_aqui

# URL de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# URL del webhook (opcional, para producción)
MERCADO_PAGO_NOTIFICATION_URL=https://tudominio.com/api/payment
```

## Cómo obtener las credenciales

1. Ve a [https://www.mercadopago.com.mx/developers](https://www.mercadopago.com.mx/developers)
2. Inicia sesión o crea una cuenta
3. Ve a "Credenciales" en tu panel
4. Encontrarás:
   - **Access Token**: Token para autenticación del servidor
   - **Public Key**: Clave pública para el cliente

## Flujo de Integración

### 1. Página de Checkout
- Usuario selecciona cantidad de libros físicos y digitales
- Usuario hace clic en "Proceder al Pago"
- Se genera un `orderId` único
- Se crea una preferencia de pago en Mercado Pago
- Se redirige al usuario a Mercado Pago

### 2. Mercado Pago
- Usuario completa el pago
- Mercado Pago redirige de vuelta según el resultado

### 3. Página de Redirección (checkout/redirect)
- Recibe parámetros: `type` (success/failure/pending), `payment_id`, `external_reference`
- Valida el pago con la API
- Si `type === 'success'` y el pago se confirma:
  - **Si es solo digital**: Muestra popup "Gracias por tu compra" y redirige al inicio
  - **Si es físico**: Redirige a página de envío
- Si no es aprobado: Muestra mensaje de error

### 4. Descontar Inventario
- Se descuenta automáticamente cuando el pago es aprobado
- Solo para productos físicos
- Llamada a `/api/stock` con método PUT

### 5. Dirección de Envío (solo si hay producto físico)
- Usuario ingresa datos de envío
- Se guarda la orden completa
- Se redirige al inicio

## Rutas API Creadas

### POST `/api/payment`
Crea una preferencia de pago en Mercado Pago
- **Body**: `{ physical, digital, total, orderId }`
- **Response**: `{ id, init_point, sandbox_init_point }`

### POST `/api/payment-confirmation`
Confirma el pago y procesa la orden
- **Body**: `{ paymentId, orderId, order }`
- **Response**: `{ success, status, message }`

## Testing

### Para Modo Sandbox (Pruebas)
Usa estos números de tarjeta de prueba:

- **Visa**: 4111 1111 1111 1111
- **MasterCard**: 5555 5555 5555 4444
- **American Express**: 3782 822463 10005

**CVV**: Cualquier número de 3 dígitos
**Fecha**: Cualquier fecha futura

## Moneda y Precios

- **Moneda**: MXN (Pesos Mexicanos)
- **Libro Físico**: $20.00
- **Libro Digital**: $10.00

## Notas Importantes

1. El `external_reference` se usa para vincular la orden con el pago en Mercado Pago
2. El webhook de notificación es opcional pero recomendado para producción
3. En modo sandbox, usa URLs de localhost
4. En producción, actualiza `NEXT_PUBLIC_APP_URL` con tu dominio real

## Pendientes de Configuración Futura

1. [ ] Implementar descarga de libro digital
2. [ ] Configurar webhook para notificaciones de Mercado Pago
3. [ ] Integrar base de datos para órdenes
4. [ ] Configurar emails de confirmación
5. [ ] Implementar sistema de tracking de envíos
