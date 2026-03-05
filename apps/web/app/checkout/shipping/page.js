'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ShippingMap = dynamic(() => import('../../components/ShippingMap'), { ssr: false })

const countryCodeByName = {
  'México': 'mx',
}

const defaultCenter = [19.4326, -99.1332]

const buildStreet = (address) => {
  if (!address) return ''
  return address.road || address.pedestrian || address.footway || ''
}

const buildExternalNumber = (address) => {
  if (!address) return ''
  return address.house_number || ''
}

const buildCity = (address) => {
  if (!address) return ''
  return address.city || address.town || address.village || address.municipality || address.state_district || ''
}

const buildMunicipality = (address) => {
  if (!address) return ''
  return address.municipality || address.county || address.state_district || ''
}

const normalizeText = (value) => (value || '').trim().toLowerCase()
const normalizePostalCode = (value) => (value || '').replace(/\D/g, '').slice(0, 5)

export default function Shipping() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
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
    const cityName = buildCity(addressData)
    const municipalityName = buildMunicipality(addressData)
    const streetName = buildStreet(addressData)
    const extNumber = buildExternalNumber(addressData)
    const postal = addressData.postcode || ''

    if (cityName) setCity(cityName)
    if (municipalityName) setMunicipality(municipalityName)
    if (streetName && !street) setStreet(streetName)
    if (extNumber && !externalNumber) setExternalNumber(extNumber)
    if (postal) setPostalCode(postal)
  }

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
      let municipalityName = ''
      let cityName = ''
      let colonies = []

      // Fuente principal para Mexico: contiene municipio, ciudad y colonias por CP.
      const sepomexQuery = `https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${encodeURIComponent(normalizedPostalCode)}`
      const sepomexRes = await fetch(sepomexQuery)
      const sepomexData = await sepomexRes.json()
      const zipRows = Array.isArray(sepomexData?.zip_codes) ? sepomexData.zip_codes : []

      if (zipRows.length > 0) {
        municipalityName = zipRows[0]?.d_mnpio || ''
        cityName = zipRows[0]?.d_ciudad || zipRows[0]?.d_mnpio || zipRows[0]?.d_estado || ''

        const filteredRows = zipRows.filter((item) => {
          if (!municipalityName) return true
          return normalizeText(item?.d_mnpio) === normalizeText(municipalityName)
        })

        colonies = Array.from(
          new Set(
            filteredRows
              .map((item) => (item?.d_asenta || '').trim())
              .filter(Boolean)
          )
        )

        setMunicipality(municipalityName)
        setCity(cityName)
        setColonyOptions(colonies)
        setColony(colonies[0] || '')
      }

      // Respaldo con Nominatim para centrar el mapa y completar si Sepomex no devuelve datos.
      const countryCode = countryCodeByName[country] || ''
      const directQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=25&postalcode=${encodeURIComponent(normalizedPostalCode)}${countryCode ? `&countrycodes=${countryCode}` : ''}`
      let res = await fetch(directQuery)
      let data = await res.json()

      if (!Array.isArray(data) || data.length === 0) {
        const fallbackQuery = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=25&q=${encodeURIComponent(`${normalizedPostalCode}, ${country}`)}`
        res = await fetch(fallbackQuery)
        data = await res.json()
      }

      if (Array.isArray(data) && data.length > 0) {
        const primary = data[0]
        applyLocationData(primary)

        const nominatimMunicipality = buildMunicipality(primary.address)
        const nominatimCity = buildCity(primary.address) || data.map((item) => buildCity(item.address)).find(Boolean) || ''

        if (!municipalityName && nominatimMunicipality) {
          municipalityName = nominatimMunicipality
          setMunicipality(nominatimMunicipality)
        }

        if (!cityName && nominatimCity) {
          cityName = nominatimCity
          setCity(nominatimCity)
        }

        if (colonies.length === 0) {
          const sourceForColonies = data.filter((item) => {
            if (!municipalityName) return true
            return normalizeText(buildMunicipality(item.address)) === normalizeText(municipalityName)
          })

          colonies = Array.from(
            new Set(
              sourceForColonies
                .map((item) => {
                  const addr = item.address || {}
                  return addr.suburb || addr.neighbourhood || addr.quarter || addr.hamlet || ''
                })
                .filter(Boolean)
            )
          )

          setColonyOptions(colonies)
          setColony(colonies[0] || '')
        }
      }

      if (!municipalityName && !cityName) {
        setGeoStatus('No se encontró ubicación para ese código postal. Verifica el CP.')
        setColonyOptions([])
        setColony('')
        return
      }

      if (colonies.length === 0) {
        setGeoStatus('Código postal encontrado. Se autocompletaron municipio y ciudad. No se encontraron colonias para ese CP.')
      } else {
        setGeoStatus('Código postal encontrado. Se autocompletaron municipio y ciudad, y se cargaron colonias del municipio.')
      }
    } catch (error) {
      console.error('Error buscando por código postal:', error)
      setGeoStatus('No se pudo consultar la ubicación. Intenta nuevamente.')
    } finally {
      setGeoLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name || !email || !street || !externalNumber || !municipality || !city || !postalCode) return

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
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Código Postal</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                    placeholder="Ingresa tu código postal"
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
                <p className="text-sm text-gray-500 mt-1">Ingresa primero el CP para autocompletar municipio, ciudad y colonia.</p>
              </div>

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Calle</label>
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
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Numero Exterior</label>
                <input
                  type="text"
                  value={externalNumber}
                  onChange={(e) => setExternalNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Numero exterior"
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

              <div>
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Municipio</label>
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

              <div className="md:col-span-2">
                <label className="block text-xs text-gray-700 uppercase tracking-[0.16em] mb-2">Referencias (Entre calles)</label>
                <input
                  type="text"
                  value={references}
                  onChange={(e) => setReferences(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400/60"
                  placeholder="Ej: Entre Av. Juarez y Calle Hidalgo"
                />
              </div>

              <div className="md:col-span-2">
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
                <p className="text-sm text-gray-500 mt-1">Si no aparece tu colonia, puedes dejarlo en blanco o editar municipio/ciudad manualmente.</p>
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

              <div className="md:col-span-2">
                <h3 className="text-sm text-gray-700 uppercase tracking-[0.16em] mb-2">Mapa de ubicación</h3>
                <p className="text-sm text-gray-500 mb-2">Vista de referencia de la ubicación seleccionada.</p>
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <ShippingMap center={mapCenter} interactive={false} />
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
