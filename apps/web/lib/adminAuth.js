import crypto from 'crypto'

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

const base64url = (input) =>
  Buffer.from(input).toString('base64url')

const sign = (payload, secret) => {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url')
}

export const createAdminSessionToken = (username) => {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET no configurado')
  }
  const payload = base64url(
    JSON.stringify({
      sub: username,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
    })
  )
  const signature = sign(payload, secret)
  return `${payload}.${signature}`
}

export const verifyAdminSessionToken = (token) => {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || !token) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = sign(payload, secret)
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  )
  if (!isValid) return null

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!decoded?.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export const getAdminSessionCookieOptions = () => {
  const isProd = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS
  }
}

export { SESSION_COOKIE }
