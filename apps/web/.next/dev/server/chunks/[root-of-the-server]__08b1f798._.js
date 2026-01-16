module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/apps/web/app/api/payment/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-route] (ecmascript)");
;
async function POST(request) {
    try {
        const { physical, digital, total, orderId } = await request.json();
        // Validar que haya productos
        if (!orderId || physical === 0 && digital === 0) {
            return Response.json({
                error: 'Datos de orden inválidos'
            }, {
                status: 400
            });
        }
        // Crear items para la preferencia
        const items = [];
        if (physical > 0) {
            items.push({
                id: 'book-physical',
                title: 'Libro Físico',
                description: `${physical} unidad(es) - Envío incluido`,
                quantity: physical,
                currency_id: 'MXN',
                unit_price: 20
            });
        }
        if (digital > 0) {
            items.push({
                id: 'book-digital',
                title: 'Libro Digital',
                description: `${digital} unidad(es) - Descarga inmediata`,
                quantity: digital,
                currency_id: 'MXN',
                unit_price: 10
            });
        }
        // Crear la preferencia de pago
        const preference = {
            items: items,
            back_urls: {
                success: `${("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3000'}/checkout/redirect?type=success&orderId=${orderId}`,
                failure: `${("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3000'}/checkout/redirect?type=failure&orderId=${orderId}`,
                pending: `${("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3000'}/checkout/redirect?type=pending&orderId=${orderId}`
            },
            notification_url: `${("TURBOPACK compile-time value", "http://localhost:3000") || 'http://localhost:3000'}/api/payment/webhook`,
            external_reference: orderId,
            statement_descriptor: 'LibroWeb',
            binary_mode: true
        };
        // Crear preferencia usando la API de Mercado Pago
        console.log('Creando preferencia con token:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 20) + '...');
        console.log('Preference data:', JSON.stringify(preference, null, 2));
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].post('https://api.mercadopago.com/checkout/preferences', preference, {
            headers: {
                'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Respuesta MP:', response.data);
        return Response.json({
            id: response.data.id,
            init_point: response.data.init_point,
            sandbox_init_point: response.data.sandbox_init_point
        });
    } catch (error) {
        console.error('=== ERROR EN /api/payment ===');
        console.error('Mensaje:', error.message);
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Full error:', error);
        return Response.json({
            error: error.response?.data?.message || error.message || 'Error al procesar el pago',
            details: error.response?.data || {}
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__08b1f798._.js.map