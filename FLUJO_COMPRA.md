# Flujo de Compra con Mercado Pago

## Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PÁGINA DE CHECKOUT                               │
│                  /checkout/page.js                                   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │ Usuario selecciona:                  │
        │ - Cantidad de libros físicos         │
        │ - Cantidad de libros digitales       │
        │ - Total se calcula automáticamente   │
        └─────────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │ Validaciones:                        │
        │ - Stock disponible (física)          │
        │ - Al menos 1 producto seleccionado   │
        └─────────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │ Generar orderId único                │
        │ Guardar orden en localStorage        │
        └─────────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │ Enviar a /api/payment                │
        │ POST { physical, digital, total }    │
        └─────────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │ Mercado Pago crea preferencia        │
        │ Retorna: init_point (URL checkout)   │
        └─────────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │ Redirigir a Mercado Pago            │
        │ Usuario completa el pago            │
        └─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              MERCADO PAGO PROCESA EL PAGO                            │
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │  PAGO APROBADO   │    │ PAGO RECHAZADO   │    │ PAGO PENDIENTE│  │
│  └──────────────────┘    └──────────────────┘    └──────────────┘  │
│          │                       │                      │           │
│          ▼                       ▼                      ▼           │
│  /redirect?type=     /redirect?type=      /redirect?type=         │
│  success&payment_id= failure              pending                 │
│  xxx&external_ref=yyy                                              │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│           PÁGINA DE REDIRECCIÓN: /checkout/redirect                │
│                  redirect/page.js                                   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌─────────────────────────────────────┐
        │ Recibir parámetros de URL:          │
        │ - type (success/failure/pending)     │
        │ - payment_id (si success)            │
        │ - external_reference (orderId)       │
        └─────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────────┐
                │    ¿type === success?     │
                └───────────────────────────┘
                        │           │
                       SÍ           NO
                        │           │
        ┌───────────────┘           └────────────────┐
        │                                            │
        ▼                                            ▼
    ┌──────────────────────────┐      ┌──────────────────────────┐
    │ Llamar a               │      │ Mostrar error/rechazado  │
    │ /api/payment-confirmation │      │ Opciones:                │
    │ Confirmar pago          │      │ - Reintentar             │
    │ Descontar inventario    │      │ - Volver al inicio       │
    └──────────────────────────┘      └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────────┐
    │ Validar pago aprobado en MP          │
    │ Guardar orden completada             │
    │ Descontar stock (si físico)          │
    └──────────────────────────────────────┘
            │
            ▼
    ┌──────────────────────┐
    │ ¿Orden tiene física? │
    └──────────────────────┘
         │           │
        SÍ           NO (Solo digital)
         │           │
         │           ▼
         │    ┌──────────────────────────┐
         │    │ Mostrar popup:           │
         │    │ "¡Gracias por tu compra!"│
         │    │ Después redirigir a "/"  │
         │    └──────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │  PÁGINA DE ENVÍO                     │
    │  /checkout/shipping/page.js          │
    └──────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │ Usuario ingresa:                     │
    │ - Nombre completo                    │
    │ - Email                              │
    │ - Dirección                          │
    │ - Ciudad                             │
    │ - Código postal                      │
    │ - País                               │
    └──────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────┐
    │ Guardar orden con envío              │
    │ Guardar en localStorage (simulado)   │
    │ Limpiar datos temporales             │
    │ Redirigir a "/" (página principal)   │
    └──────────────────────────────────────┘
```

## Estados Posibles

### PAGO APROBADO + SOLO DIGITAL
1. ✅ Validar pago
2. ✅ Descontar del inventario (no aplica)
3. ✅ Mostrar popup "Gracias por tu compra"
4. ✅ Enviar email de descarga
5. ✅ Redirigir a inicio

### PAGO APROBADO + FÍSICO
1. ✅ Validar pago
2. ✅ Descontar del inventario
3. ✅ Mostrar página de envío
4. ✅ Usuario completa dirección
5. ✅ Guardar orden con envío
6. ✅ Enviar email de confirmación
7. ✅ Redirigir a inicio

### PAGO APROBADO + DIGITAL + FÍSICO
1. ✅ Validar pago
2. ✅ Descontar del inventario
3. ✅ Mostrar página de envío (porque hay físico)
4. ✅ Usuario completa dirección
5. ✅ Guardar orden con envío
6. ✅ Enviar emails de confirmación y descarga
7. ✅ Redirigir a inicio

### PAGO RECHAZADO
1. ❌ Mostrar error
2. ❌ Opción de reintentar
3. ❌ Opción de volver al inicio

### PAGO PENDIENTE
1. ⏳ Mostrar estado pendiente
2. ⏳ Notificar cuando sea aprobado/rechazado
3. ⏳ Opción de volver al inicio

## Validaciones Importantes

### Antes de Crear Preferencia
- [ ] Al menos 1 producto seleccionado
- [ ] Stock suficiente para cantidad física
- [ ] Total > 0

### Después de Retornar de MP
- [ ] Validar que el pago_id existe
- [ ] Validar que el estado es "approved"
- [ ] Validar que la orden existe en localStorage
- [ ] Solo descontar stock si pago aprobado

### Al Guardar Envío
- [ ] Todos los campos requeridos completos
- [ ] Email válido
- [ ] Reducir stock solo si pago aprobado
- [ ] Generar orderId único
- [ ] Guardar timestamp de creación
