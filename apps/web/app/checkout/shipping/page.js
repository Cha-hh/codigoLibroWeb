'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const normalizePostalCode = (value) => (value || '').replace(/\D/g, '').slice(0, 5)

export default function Shipping() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [colony, setColony] = useState('')
  const [street, setStreet] = useState('')
  const [externalNumber, setExternalNumber] = useState('')
  const [internalNumber, setInternalNumber] = useState('')
  const [references, setReferences] = useState('')
  const [colonyOptions, setColonyOptions] = useState([])
  const country = 'México'
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mpStatus, setMpStatus] = useState({ ok: true, message: '' })
  const [geoStatus, setGeoStatus] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const router = useRouter()
  const lastLookedUpPostalCodeRef = useRef('')

  useEffect(() => {
    // Cargar la orden actual
    const currentOrder = localStorage.getItem('currentOrder')
    if (currentOrder) {
      setOrder(JSON.parse(currentOrder))
    } else {
      // Si no hay orden, redirigir al checkout
      router.push('/checkout')
    }

    // Validar configuración de Mercado Pago
    fetch('/api/payment/health')
      .then(res => res.json())
      .then(data => {
        if (!data.ok) {
          setMpStatus({ ok: false, message: data.error || 'Mercado Pago no está configurado' })
        }
      })
      .catch(() => {
        setMpStatus({ ok: false, message: 'No se pudo validar Mercado Pago' })
      })
  }, [router])

  const handlePostalCodeLookup = async () => {
    const normalizedPostalCode = normalizePostalCode(postalCode)
    if (!normalizedPostalCode) {
      setGeoStatus('Ingresa un código postal para buscar ubicación.')
      return
    }

    if (normalizedPostalCode.length < 5) {
      setGeoStatus('El código postal debe tener 5 dígitos.')
      return
    }

    if (normalizedPostalCode !== postalCode) {
      setPostalCode(normalizedPostalCode)
    }

    setGeoLoading(true)
    setGeoStatus('Buscando ubicación por código postal...')

    try {
      // Catálogo propio (SEPOMEX) embebido en el servidor: fuente autoritativa
      // de estado, municipio, ciudad y colonias por CP.
      const res = await fetch(`/api/postal-code/${normalizedPostalCode}`)
      const data = await res.json()

      if (data?.found) {
        if (data.estado) setState(data.estado)
        if (data.municipio) setMunicipality(data.municipio)
        if (data.ciudad) setCity(data.ciudad)

        const colonies = Array.isArray(data.colonias) ? data.colonias : []
        setColonyOptions(colonies)
        setColony(colonies[0] || '')

        setGeoStatus(
          colonies.length > 0
            ? 'Código postal encontrado. Se autocompletaron estado, municipio, ciudad y colonias.'
            : 'Código postal encontrado. Se autocompletaron estado, municipio y ciudad. No se encontraron colonias para ese CP.'
        )
      } else {
        setColonyOptions([])
        setColony('')
        setGeoStatus('No se encontró ese código postal en el catálogo. Verifica el CP o completa los datos manualmente.')
      }
    } catch (error) {
      console.error('Error buscando por código postal:', error)
      setGeoStatus('No se pudo consultar la ubicación. Intenta nuevamente.')
    } finally {
      setGeoLoading(false)
    }
  }

  // Autocompleta estado, municipio, ciudad y colonias en cuanto el CP tiene
  // 5 dígitos, sin esperar a que el usuario haga clic en "Buscar".
  useEffect(() => {
    const normalizedPostalCode = normalizePostalCode(postalCode)
    if (normalizedPostalCode.length !== 5) return
    if (normalizedPostalCode === lastLookedUpPostalCodeRef.current) return

    lastLookedUpPostalCodeRef.current = normalizedPostalCode
    handlePostalCodeLookup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postalCode])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      alert('Por favor ingresa un correo válido.')
      return
    }

    // Validar campos obligatorios
    if (!name || !street || !externalNumber || !state || !municipality || !city || !postalCode || !references) {
      alert('Por favor completa todos los campos requeridos: nombre, código postal, estado, municipio, ciudad, calle, número exterior y referencias (entre calles).')
      return
    }

    if (!order || (order.physical === 0 && order.digital === 0)) {
      alert('No hay productos en la orden')
      router.push('/checkout')
      return
    }

    setLoading(true)

    const orderId = localStorage.getItem('currentOrderId')
      || ('ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase())
    const addressLine = `${street} ${externalNumber}${internalNumber ? ` Int ${internalNumber}` : ''}`.trim()

    const shippingInfo = {
      name,
      email,
      address: addressLine,
      street,
      externalNumber,
      internalNumber,
      state,
      municipality,
      city,
      postalCode,
      colony,
      references,
      country
    }

    const updatedOrder = {
      ...order,
      shipping: shippingInfo
    }

    // Guardar orden actual con datos de envío
    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder))
    localStorage.setItem('currentOrderId', orderId)

    try {
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          physical: updatedOrder.physical,
          digital: updatedOrder.digital,
          total: updatedOrder.total,
          orderId: orderId,
          shipping: shippingInfo
        })
      })

      let paymentData = null
      try {
        paymentData = await paymentResponse.json()
      } catch (parseError) {
        paymentData = null
      }

      if (!paymentResponse.ok) {
        console.error('Error de API:', paymentData)
        throw new Error(paymentData?.error || 'Error al crear preferencia de pago')
      }

      const url = paymentData?.checkout_url
        || paymentData?.sandbox_init_point
        || paymentData?.init_point

      if (!url) throw new Error('No se obtuvo la URL de pago')
      window.location.href = url
    } catch (error) {
      console.error('Error al procesar pago:', error)
      alert('Error al procesar el pago. Por favor, intenta de nuevo.')
      setLoading(false)
    }
  }

  if (!order) {
    return <div className="flex items-center justify-center min-h-screen">Cargando...</div>
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f3f4f6 55%, #d1d5db 100%)' }}
    >
      {/* Navbar */}
      <nav className="bg-black/70 backdrop-blur-md shadow-md border-b border-black/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center items-center">
            <Link href="/" className="text-gray-200 hover:text-white text-xs tracking-[0.25em] transition uppercase">Volver al Libro</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-[0.2em]">Datos de envío</h1>

        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {!mpStatus.ok && (
            <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-red-700">
              {mpStatus.message}
            </div>
          )}
          {/* Resumen de la orden */}
          <div className="mb-8 p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-4 uppercase tracking-[0.14em]">Resumen de tu pedido</h2>
            <div className="space-y-2">
              <p><strong>Libro Físico:</strong> {order.physical} unidades</p>
              <p><strong>Libro Digital:</strong> {order.digital} unidades</p>
              <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Ingresa tu nombre completo"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Correo Electrónico <span className="text-red-600">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="tu@email.com"
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  title="Por favor ingresa un correo válido"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Recibirás la confirmación de tu compra en este correo.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Código Postal <span className="text-red-600">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                    placeholder="Ingresa tu código postal"
                    minLength="5"
                    maxLength="5"
                    pattern="[0-9]{5}"
                    title="El código postal debe tener exactamente 5 dígitos"
                    required
                  />
                  <button
                    type="button"
                    onClick={handlePostalCodeLookup}
                    disabled={geoLoading}
                    className="px-4 py-3 bg-white/90 border border-gray-300 text-gray-700 rounded-lg text-xs uppercase tracking-[0.16em] hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buscar
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">Al completar tus 5 dígitos, autocompletamos estado, municipio, ciudad y colonia. Usa "Buscar" si necesitas repetir la búsqueda.</p>
                {geoStatus && <p className="text-sm text-gray-600 mt-1">{geoStatus}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Estado <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Estado"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Municipio <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Municipio"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Ciudad <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Ciudad"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Colonia</label>
                <select
                  value={colony}
                  onChange={(e) => setColony(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                >
                  <option value="">Selecciona colonia</option>
                  {colonyOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Calle <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Calle"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Número Exterior <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={externalNumber}
                  onChange={(e) => setExternalNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Número exterior"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Numero Interior</label>
                <input
                  type="text"
                  value={internalNumber}
                  onChange={(e) => setInternalNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Numero interior (opcional)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Referencias (Entre calles) <span className="text-red-600">*</span></label>
                <input
                  type="text"
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Ej: Entre Av. Juárez y Calle Hidalgo"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Ayuda al repartidor a localizar tu domicilio con exactitud.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">País</label>
                <input
                  type="text"
                  value="México"
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-gray-800 text-white py-3 px-6 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Continuar al pago'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
