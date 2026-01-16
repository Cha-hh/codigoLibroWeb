# ⚡ QUICKSTART - Mercado Pago Integration

## 🚀 Comienza en 5 minutos

### 1️⃣ Obtén tus Credenciales (2 min)

1. Ve a https://www.mercadopago.com.mx/developers
2. Inicia sesión
3. Busca "Credenciales" → "Sandbox"
4. Copia dos valores:
   - **Access Token** (ej: TEST-123456789...)
   - **Public Key** (ej: TEST-abcdef...)

### 2️⃣ Configura Variables de Entorno (1 min)

```bash
# En: apps/web/.env.local

MERCADO_PAGO_ACCESS_TOKEN=TEST-tu_access_token_aqui
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=TEST-tu_public_key_aqui
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ Instala Dependencias (1 min)

```bash
cd /Volumes/WADEOW/PROYECTOS/LibroWeb/codigoLibroWeb/apps/web
npm install mercadopago
```

### 4️⃣ Inicia el Servidor (1 min)

```bash
cd /Volumes/WADEOW/PROYECTOS/LibroWeb/codigoLibroWeb
npm run dev
```

### 5️⃣ Prueba 🎉

```
1. Ve a http://localhost:3000/checkout
2. Selecciona productos
3. Haz clic en "Proceder al Pago"
4. Usa tarjeta: 4111 1111 1111 1111
5. ¡Listo!
```

---

## 📋 Lo que se Implementó

✅ **API de Pago** - Crea preferencias en Mercado Pago  
✅ **Página de Checkout** - Integrada con Mercado Pago  
✅ **Página de Redirección** - Maneja retorno de pago  
✅ **Descuento de Stock** - Automático al aprobar  
✅ **Popup de Gracias** - Para compras digitales  
✅ **Página de Envío** - Para compras físicas  
✅ **Validaciones** - Stock, montos, datos  
✅ **Documentación** - Guías completas  

---

## 🔄 Flujo Rápido

```
Checkout → Mercado Pago → Retorno → 
├─ Digital → Popup Gracias
└─ Físico → Envío → Descuento Stock
```

---

## 🧪 Tarjetas de Prueba

| Tipo | Número |
|------|--------|
| ✅ Aprobada | 4111 1111 1111 1111 |
| ❌ Rechazada | 4000 0000 0000 0002 |

**Vencimiento**: Cualquiera futuro (ej: 11/25)  
**CVV**: Cualquier número (ej: 123)  

---

## 📁 Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `/apps/web/app/checkout/page.js` | Página principal de compra |
| `/apps/web/app/api/payment/route.js` | Crea preferencia en MP |
| `/apps/web/app/checkout/redirect/page.js` | Maneja retorno de pago |
| `/apps/web/.env.local.example` | Plantilla de variables |

---

## 📚 Documentación Disponible

- **MERCADO_PAGO_SETUP.md** - Configuración detallada
- **FLUJO_COMPRA.md** - Diagrama de flujo completo
- **TESTING_GUIDE.md** - 6 casos de prueba
- **TROUBLESHOOTING.md** - Errores y soluciones
- **IMPLEMENTACION_MERCADO_PAGO.md** - Resumen completo

---

## ✨ Características

- ✅ Integración completa Mercado Pago
- ✅ Manejo de pago aprobado/rechazado/pendiente
- ✅ Descuento automático de stock
- ✅ Popup de agradecimiento digital
- ✅ Formulario de envío para físicos
- ✅ Validaciones en todos los pasos
- ✅ Manejo de errores robusto
- ✅ Interfaz amigable

---

## 🆘 ¿Problemas?

1. **Error de credenciales** → Copia de nuevo desde panel MP
2. **Stock no se descuenta** → Verifica `/api/stock` funciona
3. **No se abre Mercado Pago** → Revisa `.env.local` existe
4. **No redirige a envío** → Limpia localStorage e intenta nuevo

Ver **TROUBLESHOOTING.md** para soluciones detalladas.

---

## 🎯 Próximas Fases (Opcional)

Una vez que todo funcione:

1. **Base de Datos** - Guardar órdenes permanentemente
2. **Emails** - Confirmación y descarga
3. **Admin Panel** - Ver todas las órdenes
4. **Sistema de Descargas** - Entregar libros digitales
5. **Modo Producción** - Credenciales reales

---

## 💡 Tips Importantes

- En **Sandbox** (testing) usa las tarjetas proporcionadas
- Limpia `localStorage` entre pruebas si hay problemas
- El servidor debe reiniciarse después de cambiar `.env`
- Las tarjetas de prueba NO cobran dinero real
- Marca el URL de retorno es: `localhost:3000` NO `127.0.0.1`

---

**¡Listo! Comienza en: http://localhost:3000/checkout**

Para más detalles, revisa los archivos `.md` en la raíz del proyecto.
