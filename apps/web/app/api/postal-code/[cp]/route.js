import { lookupPostalCode } from '../../../../lib/postalCodes'

export async function GET(request, { params }) {
  const { cp } = await params

  try {
    const result = lookupPostalCode(cp)

    if (!result) {
      return Response.json(
        { found: false },
        { status: 404, headers: { 'Cache-Control': 'public, max-age=86400' } }
      )
    }

    return Response.json(
      { found: true, ...result },
      { headers: { 'Cache-Control': 'public, max-age=86400' } }
    )
  } catch (error) {
    console.error('Error consultando código postal:', error)
    return Response.json({ found: false, error: 'Error al consultar el código postal' }, { status: 500 })
  }
}
