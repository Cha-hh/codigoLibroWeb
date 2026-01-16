# Guía de Testing - Integración Mercado Pago

## Requisitos Previos

1. ✅ Tener `.env.local` configurado con credenciales de Mercado Pago
2. ✅ Servidor Next.js corriendo en http://localhost:3000
3. ✅ Base de datos o localStorage funcionando

## Pasos para Configurar el Ambiente de Testing

### 1. Crear Cuenta en Mercado Pago

```bash
1. Ve a https://www.mercadopago.com.mx
2. Crea una cuenta de prueba (sandbox)
3. Una vez confirmada, ve a https://www.mercadopago.com.mx/developers
4. Busca "Credenciales"
5. Copia el Access Token y Public Key para modo TEST
```

### 2. Configurar `.env.local`

```bash
cd apps/web
cp .env.local.example .env.local
```

Edita `.env.local`:
```
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx (de tu panel de sandbox)
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-xxx (de tu panel de sandbox)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Iniciar la Aplicación

```bash
cd /Volumes/WADEOW/PROYECTOS/LibroWeb/codigoLibroWeb
npm run dev
```

Accede a http://localhost:3000

## Casos de Prueba

### TEST 1: Compra de Solo Libro Digital

**Objetivo**: Verificar que un libro digital aprobado muestra popup de agradecimiento

**Pasos**:
1. Ir a http://localhost:3000/checkout
2. Seleccionar:
   - Libro Físico: 0 unidades
   - Libro Digital: 1 unidad
   - Total debe ser: $10.00
3. Hacer clic en "Proceder al Pago"
4. Se abrirá Mercado Pago
5. Usar tarjeta de prueba VISA:
   - Número: `4111 1111 1111 1111`
   - Vencimiento: `11/25` (cualquier fecha futura)
   - CVV: `123`
   - Email: `test@test.com`
6. Hacer clic en "Pagar"

**Resultado Esperado**:
- ✅ Se redirige a `/checkout/redirect?type=success&payment_id=xxx`
- ✅ Se muestra popup "¡Gracias por tu compra!"
- ✅ Popup desaparece después de hacer clic en "Cerrar"
- ✅ Se redirige a página de inicio `/`
- ✅ localStorage se limpia (no debe haber `currentOrder`)

**Comando de Debug**:
```javascript
// En consola del navegador:
console.log(JSON.parse(localStorage.getItem('currentOrder')));
console.log(JSON.parse(localStorage.getItem('orders')));
```

---

### TEST 2: Compra de Solo Libro Físico

**Objetivo**: Verificar que un libro físico aprobado va a página de envío

**Pasos**:
1. Ir a http://localhost:3000/checkout
2. Seleccionar:
   - Libro Físico: 1 unidad
   - Libro Digital: 0 unidades
   - Total debe ser: $20.00
3. Hacer clic en "Proceder al Pago"
4. Usar tarjeta de prueba MASTERCARD:
   - Número: `5555 5555 5555 4444`
   - Vencimiento: `11/25`
   - CVV: `123`
   - Email: `test2@test.com`

**Resultado Esperado**:
- ✅ Se redirige a `/checkout/redirect?type=success&payment_id=xxx`
- ✅ Después de 2 segundos, redirige a `/checkout/shipping`
- ✅ Se carga el formulario de envío
- ✅ El resumen muestra: Físico: 1, Digital: 0, Total: $20.00

**Ingresa datos de envío**:
```
Nombre: Juan Pérez
Email: juan@example.com
Dirección: Calle Principal 123
Ciudad: México
Código Postal: 06500
País: México
```

**Resultado Esperado (después de envío)**:
- ✅ Orden se guarda en localStorage
- ✅ Se descuenta del stock de inventario
- ✅ Se redirige a página de inicio
- ✅ Se muestra mensaje de éxito (opcional)

**Verificar en consola**:
```javascript
console.log(JSON.parse(localStorage.getItem('orders')));
// Debe contener la orden con status: 'pending'
```

---

### TEST 3: Compra de Libro Físico + Digital

**Objetivo**: Verificar que combinación de productos va primero a envío

**Pasos**:
1. Ir a http://localhost:3000/checkout
2. Seleccionar:
   - Libro Físico: 2 unidades
   - Libro Digital: 1 unidad
   - Total debe ser: $50.00 (2*20 + 1*10)
3. Hacer clic en "Proceder al Pago"
4. Usar tarjeta American Express:
   - Número: `3782 822463 10005`
   - Vencimiento: `11/25`
   - CVV: `1234`
   - Email: `combo@test.com`

**Resultado Esperado**:
- ✅ Pago aprobado
- ✅ Redirige directamente a `/checkout/shipping` (no popup, porque hay físico)
- ✅ Formulario de envío precargado con datos

---

### TEST 4: Pago Rechazado

**Objetivo**: Verificar manejo de pagos rechazados

**Pasos**:
1. Ir a http://localhost:3000/checkout
2. Seleccionar:
   - Libro Físico: 1 unidad
   - Libro Digital: 0 unidades
   - Total: $20.00
3. Hacer clic en "Proceder al Pago"
4. Ingresa datos INVÁLIDOS para simular rechazo:
   - Número: `4000 0000 0000 0002` (rechazada)
   - O simplemente cierra la ventana de pago

**Resultado Esperado**:
- ✅ Se redirige a `/checkout/redirect?type=failure`
- ✅ Se muestra mensaje "Pago Rechazado"
- ✅ Se ofrecen opciones "Intentar de Nuevo" y "Volver al inicio"
- ✅ Stock NO se descuenta (porque pago no aprobado)

---

### TEST 5: Stock Insuficiente

**Objetivo**: Verificar que no deja comprar más de lo disponible

**Pasos**:
1. En consola, simula stock bajo:
   ```javascript
   // Primero necesitas ver cuál es el stock actual
   fetch('/api/stock').then(r => r.json()).then(d => console.log(d))
   ```
2. Ir a `/checkout`
3. Intenta seleccionar más cantidad que el stock disponible
4. El botón debe deshabilitarse y mostrar "Stock insuficiente"

**Resultado Esperado**:
- ✅ Botón "Proceder al Pago" está deshabilitado
- ✅ Muestra mensaje "Stock insuficiente"
- ✅ No se puede hacer clic en el botón

---

### TEST 6: Validación de Formulario de Envío

**Objetivo**: Verificar validación de datos de envío

**Pasos**:
1. Completar un pago de libro físico exitosamente
2. Llegar a `/checkout/shipping`
3. Intentar enviar el formulario sin llenar campos:
   - Dejar nombre en blanco
   - Hacer clic en "Confirmar Pedido"

**Resultado Esperado**:
- ✅ Navegador muestra validación nativa (required)
- ✅ No se envía el formulario
- ✅ Se pide completar campos obligatorios

---

## Comandos Útiles de Testing

### Limpiar localStorage entre pruebas
```javascript
// En consola del navegador:
localStorage.clear()
location.reload()
```

### Verificar órdenes guardadas
```javascript
console.log(JSON.parse(localStorage.getItem('orders') || '[]'))
```

### Verificar stock actual
```javascript
fetch('/api/stock').then(r => r.json()).then(d => {
  console.log('Stock actual:', d.book.quantity)
})
```

### Simular descuento de stock
```javascript
fetch('/api/stock', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'book', quantity: 5 })
}).then(r => r.json()).then(d => console.log(d))
```

---

## Credenciales de Prueba de Mercado Pago

| Tarjeta | Número | Vencimiento | CVV | Resultado |
|---------|--------|-------------|-----|-----------|
| Visa | 4111 1111 1111 1111 | 11/25 | 123 | ✅ Aprobada |
| MasterCard | 5555 5555 5555 4444 | 11/25 | 123 | ✅ Aprobada |
| Amex | 3782 822463 10005 | 11/25 | 1234 | ✅ Aprobada |
| Visa Rechazada | 4000 0000 0000 0002 | 11/25 | 123 | ❌ Rechazada |

---

## Posibles Errores y Soluciones

### Error: "Invalid publish key"
**Solución**: Verifica que `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` está correcto en `.env.local`

### Error: "Access token invalid"
**Solución**: Verifica que `MERCADO_PAGO_ACCESS_TOKEN` está correcto en `.env.local`

### Stock no se descuenta
**Solución**: Verifica que `/api/stock` está respondiendo correctamente
```javascript
fetch('/api/stock').then(r => r.json()).then(d => console.log(d))
```

### No se muestra popup de agradecimiento
**Solución**: 
1. Asegúrate de estar comprando SOLO digital (sin físico)
2. Verifica que el pago fue aprobado (type=success)
3. Abre consola y busca errores

### Redirige a inicio sin mostrar shipping
**Solución**: 
1. Verifica que la orden tiene `physical > 0`
2. Revisa que no hay errores en la consola
3. Limpia localStorage e intenta de nuevo

---

## Checklist Final de Testing

- [ ] Compra digital aprobada → popup de agradecimiento
- [ ] Compra física aprobada → página de envío
- [ ] Compra combinada aprobada → página de envío
- [ ] Pago rechazado → página de error
- [ ] Stock se descuenta correctamente
- [ ] Stock insuficiente → botón deshabilitado
- [ ] Órdenes se guardan en localStorage
- [ ] localStorage se limpia después de completar

---

## Próximos Pasos

Una vez que todo funcione:
1. [ ] Integrar base de datos real (MongoDB, PostgreSQL, etc.)
2. [ ] Configurar envío de emails con SendGrid o Resend
3. [ ] Implementar sistema de descarga de libro digital
4. [ ] Configurar webhook de Mercado Pago para notificaciones
5. [ ] Implementar panel de administrador para ver órdenes
6. [ ] Configurar dominio y pasar a modo producción
7. [ ] Migrar a credenciales de producción en Mercado Pago
