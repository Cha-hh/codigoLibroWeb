import { MercadoPagoConfig } from 'mercadopago'

export const getMpClient = () => {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN no configurado')
  }
  return new MercadoPagoConfig({ accessToken })
}

export const isSandboxToken = () =>
  (process.env.MERCADO_PAGO_ACCESS_TOKEN || '').startsWith('TEST-')
