import { NextResponse } from 'next/server'

const SESSION_COOKIE = 'admin_session'

const decodeBase64Url = (input) => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

const encodeBase64Url = (bytes) => {
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const verifyToken = async (token, secret) => {
  if (!token || !secret) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const expected = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload)
  )
  const expectedSignature = encodeBase64Url(new Uint8Array(expected))
  if (expectedSignature !== signature) return null

  try {
    const decoded = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(payload))
    )
    if (!decoded?.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return decoded
  } catch {
    return null
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const session = await verifyToken(token, process.env.ADMIN_SESSION_SECRET)
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
