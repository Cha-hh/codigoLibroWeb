# 🐛 Troubleshooting y FAQ - Mercado Pago Integration

## ❓ Preguntas Frecuentes

### ¿Cómo obtengo mis credenciales de Mercado Pago?

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.mx/developers)
2. Inicia sesión con tu cuenta
3. En el menú, busca "Credenciales"
4. Selecciona "Sandbox" para pruebas
5. Copia:
   - **Access Token**: para el servidor (MERCADO_PAGO_ACCESS_TOKEN)
   - **Public Key**: para el navegador (NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY)

### ¿Dónde coloco las credenciales?

En el archivo `apps/web/.env.local`:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxx
```

### ¿Puedo usar Mercado Pago en modo sandbox?

Sí, es la forma recomendada para testing. Usa las tarjetas de prueba proporcionadas.

### ¿Qué pasa si el usuario cierra la ventana de pago?

La orden se queda en `localStorage` pero el pago no se completa. El usuario puede reintentar desde el checkout.

### ¿Se descuenta el stock automáticamente?

Sí, solo después de que el pago sea aprobado. Verificamos en `/api/payment-confirmation`.

### ¿Qué ocurre con pagos pendientes?

Se muestra un estado "Pendiente" y se avisa al usuario que será notificado cuando se confirme.

### ¿Cómo envío el libro digital después de la compra?

El popup muestra un mensaje, pero el sistema de descarga actual es solo una plantilla. Necesitas integrar un servicio de descarga o email.

---

## 🔴 Errores Comunes y Soluciones

### Error 1: "Invalid publish key"

**Síntomas**: 
- La página de checkout muestra error en consola
- No se puede proceder al pago
- Error: "Invalid publish key" o "Public key not found"

**Causa**: 
- `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` no está configurada
- O está mal copiada
- O el archivo `.env.local` no existe

**Solución**:
```bash
# 1. Verifica que el archivo existe
ls apps/web/.env.local

# 2. Verifica que contiene la key (sin ver el valor)
grep "NEXT_PUBLIC_MERCADO_PAGO" apps/web/.env.local

# 3. Recopia la key exactamente desde el panel de MP
# 4. Reinicia el servidor:
npm run dev
```

**Verificación en navegador**:
```javascript
console.log(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY)
// Debe mostrar algo como: TEST-3a1b2c3d...
```

---

### Error 2: "Access token invalid"

**Síntomas**:
- Error al crear preferencia de pago
- Consola del servidor muestra "401 Unauthorized"
- No se puede redirigir a Mercado Pago

**Causa**:
- `MERCADO_PAGO_ACCESS_TOKEN` no está en `.env.local`
- O está mal copiado
- O el token expiró

**Solución**:
```bash
# 1. Verifica que está en .env.local
grep "MERCADO_PAGO_ACCESS_TOKEN" apps/web/.env.local

# 2. Verifica que es un token válido (obtén uno nuevo si es necesario)
# 3. Recopia exactamente desde el panel
# 4. Reinicia el servidor Node

# 5. Si sigue fallando, verifica en logs del servidor:
# Busca el error completo en la terminal donde corre 'npm run dev'
```

---

### Error 3: "Cannot read property 'quantity' of undefined"

**Síntomas**:
- Error al verificar stock
- Botón de compra está deshabilitado permanentemente
- Consola muestra error en `/api/stock`

**Causa**:
- El endpoint `/api/stock` no existe o no devuelve el formato correcto
- La estructura de datos del stock es diferente

**Solución**:
```javascript
// En consola del navegador, verifica que devuelve:
fetch('/api/stock')
  .then(r => r.json())
  .then(d => console.log('Stock:', d))

// Debe devolver algo como:
// {
//   book: {
//     quantity: 10,
//     ...
//   }
// }

// Si devuelve algo diferente, ajusta la ruta o la estructura en checkout/page.js
```

---

### Error 4: "Type: checkout, Issue: total_amount invalid"

**Síntomas**:
- Error desde Mercado Pago al crear preferencia
- No se abre el checkout de MP
- Error en la respuesta de `/api/payment`

**Causa**:
- El monto total está mal calculado
- El monto es 0 o negativo
- El formato del monto es incorrecto

**Solución**:
```javascript
// Verifica el cálculo en checkout/page.js
const total = (physicalQuantity * 20) + (digitalQuantity * 10)
console.log('Total:', total) // Debe ser > 0

// Si physicalQuantity=1 y digitalQuantity=0 -> total debe ser 20
// Si physicalQuantity=0 y digitalQuantity=1 -> total debe ser 10
```

---

### Error 5: "No se redirige a página de envío"

**Síntomas**:
- Pago aprobado pero no va a `/checkout/shipping`
- Se queda en `/checkout/redirect`
- No hay pop-up de agradecimiento

**Causa**:
- No hay datos en `localStorage` 
- La orden no se guardó correctamente
- O la lógica de detección (física vs digital) está mal

**Solución**:
```javascript
// En consola cuando ves la página de redirect:
console.log(localStorage.getItem('currentOrder'))
// Debe mostrar un JSON como:
// {"physical":1,"digital":0,"total":20}

// Si no muestra nada, el problema fue antes (en checkout/page.js)
// Si muestra pero no redirige, verifica redirect/page.js
```

---

### Error 6: "Stock no se descuenta después del pago"

**Síntomas**:
- Pago aprobado
- Usuario completa envío
- Verificas con fetch('/api/stock') y el número es igual

**Causa**:
- El descuento se intenta hacer pero falla silenciosamente
- O el endpoint de stock tiene permisos incorrectos
- O hay un error en `payment-confirmation/route.js`

**Solución**:
```javascript
// 1. Abre la consola del servidor (donde corre npm run dev)
// 2. Busca mensajes de error relacionados a stock
// 3. Verifica que /api/stock responde a PUT:

fetch('/api/stock', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id: 'book', quantity: 5 })
})
.then(r => r.json())
.then(d => console.log('Respuesta:', d))

// Debe funcionar sin errores
```

---

### Error 7: "Tarjeta rechazada pero intenta descontar stock"

**Síntomas**:
- Usa tarjeta rechazada
- Mercado Pago redirige a `/checkout/redirect?type=failure`
- Stock se descuenta igual

**Causa**:
- Falla en la validación de estado de pago
- El backend no valida correctamente

**Solución**:
```javascript
// En redirect/page.js, asegúrate que solo procesa si:
// type === 'success' Y status === 'approved'

// Verifica en /api/payment-confirmation que valida:
if (paymentDetails.status === 'approved') {
  // solo aquí descuenta
}
```

---

### Error 8: "Mercado Pago abre pero vuelve a checkout infinitamente"

**Síntomas**:
- Haces clic en "Proceder al Pago"
- Se abre Mercado Pago
- Intentas pagar y vuelve al checkout
- Ciclo infinito

**Causa**:
- URLs de retorno mal configuradas
- `NEXT_PUBLIC_APP_URL` no está correcta
- Problema de CORS o validación

**Solución**:
```bash
# Verifica en .env.local:
echo $NEXT_PUBLIC_APP_URL
# Debe ser exactamente: http://localhost:3000 (sin slash final)

# Las URLs de retorno en /api/payment deben ser:
# http://localhost:3000/checkout/redirect?type=success
# http://localhost:3000/checkout/redirect?type=failure
```

---

## 🔍 Debugging Avanzado

### Verificar Estado Completo de una Orden

```javascript
// En consola del navegador:
const order = JSON.parse(localStorage.getItem('currentOrder'))
const orderId = localStorage.getItem('currentOrderId')
console.log('Orden actual:', order)
console.log('Orden ID:', orderId)

// Ver todas las órdenes completadas:
const allOrders = JSON.parse(localStorage.getItem('orders') || '[]')
console.log('Órdenes completadas:', allOrders)
```

### Monitorear Solicitudes API

```javascript
// En consola, añade esto para ver todas las requests:
// Opción 1: En DevTools, pestaña Network
// Opción 2: Código
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('Fetch:', args[0], args[1]?.body)
  return originalFetch.apply(this, args)
}
```

### Ver Logs del Servidor

Cuando ejecutas `npm run dev`, los logs aparecen en la terminal:

```bash
# Busca líneas que contengan:
# - "Error"
# - "payment"
# - "stock"
```

### Simular Manualmente una Orden

```javascript
// Para testing sin pasar por Mercado Pago:
localStorage.setItem('currentOrder', JSON.stringify({
  physical: 1,
  digital: 1,
  total: 30
}))

// Luego ve a: http://localhost:3000/checkout/redirect?type=success&payment_id=fake123
```

---

## 📱 Testing en Diferentes Dispositivos

### Mobile/Tablet

Mercado Pago se adapta automáticamente. Para probar:

1. En Chrome DevTools, presiona `F12`
2. Haz clic en el ícono de dispositivo (esquina superior izquierda)
3. Selecciona un dispositivo móvil
4. Recarga la página y prueba el flujo

### En una Red Local Real

Si quieres probar desde otro dispositivo en tu red:

```bash
# En lugar de localhost, usa tu IP:
# 1. Encuentra tu IP local:
ipconfig getifaddr en0  # macOS
# O en Linux:
hostname -I

# 2. Accede desde otro dispositivo:
# http://192.168.1.100:3000/checkout
```

---

## ⚡ Performance y Optimizaciones

### Problema: Script de Mercado Pago tarda en cargar

**Solución**: El script se carga en background, pero puedes optimizar:

```javascript
// En checkout/page.js, el script ya se carga async
// Si es muy lento, considera pre-cargar en _document.js
```

### Problema: Muchas requests al stock

**Optimización**: Agregar caché de 5 segundos:

```javascript
// En checkout/page.js
const [lastStockCheck, setLastStockCheck] = useState(0)

useEffect(() => {
  const now = Date.now()
  // Solo actualizar si pasaron más de 5 segundos
  if (now - lastStockCheck > 5000) {
    fetch('/api/stock')
      .then(res => res.json())
      .then(data => {
        setStock(data.book?.quantity || 0)
        setLastStockCheck(now)
      })
  }
}, [lastStockCheck])
```

---

## 📊 Checklist de Debugging

- [ ] ¿Archivo `.env.local` existe?
- [ ] ¿Credenciales correctamente copiadas?
- [ ] ¿Servidor reiniciado después de cambiar `.env`?
- [ ] ¿API de stock responde correctamente?
- [ ] ¿localStorage tiene datos después de hacer clic en pagar?
- [ ] ¿Redirige correctamente a Mercado Pago?
- [ ] ¿Retorna correctamente de Mercado Pago?
- [ ] ¿Stock se descuenta después de pago aprobado?
- [ ] ¿Popup aparece para compras digitales?
- [ ] ¿Página de envío aparece para compras físicas?

---

## 🆘 Si Nada de Esto Funciona

### Paso 1: Reinicia todo
```bash
# Termina el servidor (Ctrl+C)
# Limpia caché:
rm -rf .next

# Reinstala dependencias:
cd apps/web
npm install

# Reinicia:
npm run dev
```

### Paso 2: Verifica logs
```bash
# En la terminal donde corre el servidor, busca:
- Errores en rojo
- Líneas que contengan "payment" o "error"
```

### Paso 3: Limpia navegador
```javascript
// En consola del navegador:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Paso 4: Contacta soporte

Si aún no funciona, recopila:
1. Captura de pantalla del error
2. Línea exacta del error en consola
3. Logs del servidor (últimas 20 líneas)
4. Valor de `.env.local` (sin mostrar tokens completos)
5. URL donde ocurre el error

---

## ✅ Checklist de Validación Final

- [ ] Compra digital → popup de gracias
- [ ] Compra física → envío
- [ ] Compra mixta → envío
- [ ] Stock se descuenta
- [ ] Pago rechazado muestra error
- [ ] Pago pendiente muestra estado
- [ ] localStorage se limpia después
- [ ] No hay errores en consola
- [ ] No hay errores en servidor

---

**Última actualización**: 15 de enero de 2026
