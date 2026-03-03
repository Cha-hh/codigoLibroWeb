'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ShippingMap = dynamic(() => import('../../components/ShippingMap'), { ssr: false })

const countryCodeByName = {
  'México': 'mx',
  'Estados Unidos': 'us',
  'Canadá': 'ca',
}

const defaultCenter = [19.4326, -99.1332]

const buildStreetAddress = (address, fallback) => {
  if (!address) return fallback || ''
  const road = address.road || address.pedestrian || address.footway || ''
  const houseNumber = address.house_number || ''
  const street = `${road} ${houseNumber}`.trim()
  return street || fallback || ''
}

const buildCity = (address) => {
  if (!address) return ''
  return address.city || address.town || address.village || address.municipality || address.state_district || ''
}

export default function Shipping() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('México')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mpStatus, setMpStatus] = useState({ ok: true, message: '' })
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [geoStatus, setGeoStatus] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const router = useRouter()

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

  const applyLocationData = (result) => {
    if (!result) return

    const lat = Number(result.lat)
    const lon = Number(result.lon)
    if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
      setMapCenter([lat, lon])
    }

    const addressData = result.address || {}
    const streetAddress = buildStreetAddress(addressData, result.display_name)
    const cityName = buildCity(addressData)
    const postal = addressData.postcode || ''

    if (streetAddress) setAddress(streetAddress)
    if (cityName) setCity(cityName)
    if (postal) setPostalCode(postal)

    if (addressData.country) {
      const supportedCountry = Object.keys(countryCodeByName).find((countryName) => countryName === addressData.country)
      if (supportedCountry) {
        setCountry(supportedCountry)
      }
    }
  }

  const handlePostalCodeLookup = async () => {
    if (!postalCode.trim()) {
      setGeoStatus('Ingresa un código postal para buscar ubicación.')
      return
    }

    setGeoLoading(true)
    setGeoStatus('Buscando ubicación por código postal...')

    try {
      const countryCode = countryCodeByName[country] || ''
      const directQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&postalcode=${encodeURIComponent(postalCode)}${countryCode ? `&countrycodes=${countryCode}` : ''}`
      let res = await fetch(directQuery)
      let data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        const fallbackQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q=${encodeURIComponent(`${postalCode}, ${country}`)}`
        res = await fetch(fallbackQuery)
        data = await res.json()
      }

      if (!Array.isArray(data) || data.length === 0) {
        setGeoStatus('No se encontró una ubicación para ese código postal.')
        setGeoLoading(false)
        return
      }

      applyLocationData(data[0])
      setGeoStatus('Ubicación encontrada. Puedes ajustar haciendo click en el mapa.')
    } catch (error) {
      console.error('Error buscando por código postal:', error)
      setGeoStatus('No se pudo consultar la ubicación. Intenta nuevamente.')
    } finally {
      setGeoLoading(false)
    }
  }

  const handleMapPick = async ({ lat, lng }) => {
    setMapCenter([lat, lng])
    setGeoLoading(true)
    setGeoStatus('Obteniendo dirección del punto seleccionado...')

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`)
      const data = await res.json()
      applyLocationData(data)
      setGeoStatus('Dirección autocompletada desde el mapa.')
    } catch (error) {
      console.error('Error en geocodificación inversa:', error)
      setGeoStatus('No se pudo obtener dirección desde el mapa. Intenta otro punto.')
    } finally {
      setGeoLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !address || !city || !postalCode) return

    if (!order || (order.physical === 0 && order.digital === 0)) {
      alert('No hay productos en la orden')
      router.push('/checkout')
      return
    }

    setLoading(true)

    const orderId = localStorage.getItem('currentOrderId')
      || ('ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase())
    const shippingInfo = {
      name,
      email,
      address,
      city,
      postalCode,
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
          orderId: orderId
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
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Dirección de Envío</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Ingresa tu dirección completa (usa el mapa para autocompletar)"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">💡 Usa el mapa interactivo para encontrar tu dirección exacta</p>
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Ciudad</label>
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
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Código Postal</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                    placeholder="Código Postal"
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
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">País</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                >
                  <option value="México">México</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Canadá">Canadá</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-sm text-gray-700 uppercase tracking-[0.16em] mb-2">Mapa de ubicación</h3>
                <p className="text-sm text-gray-500 mb-2">Busca por código postal o haz click en el mapa para autocompletar dirección.</p>
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <ShippingMap center={mapCenter} onPick={handleMapPick} />
                </div>
                {geoStatus && <p className="text-sm text-gray-600 mt-2">{geoStatus}</p>}
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 bg-gray-800 text-white py-3 px-6 rounded-full text-xs tracking-[0.25em] hover:bg-gray-700 transition uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
