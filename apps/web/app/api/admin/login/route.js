import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import {
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  SESSION_COOKIE
} from '../../../../lib/adminAuth'
import { getAdminPasswordHash, setAdminPasswordHash } from '../../../../lib/adminStore'

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    const adminUser = process.env.ADMIN_USER
    const envPasswordHash = process.env.ADMIN_PASSWORD_HASH
    let adminPasswordHash = await getAdminPasswordHash()

    if (!adminUser || (!adminPasswordHash && !envPasswordHash)) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales de admin no configuradas' },
        { status: 500 }
      )
    }

    if (!adminPasswordHash && envPasswordHash) {
      adminPasswordHash = envPasswordHash
      await setAdminPasswordHash(envPasswordHash)
    }

    const isUserOk = username === adminUser
    const isPasswordOk = await bcrypt.compare(password || '', adminPasswordHash)
    if (!isUserOk || !isPasswordOk) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    const token = createAdminSessionToken(adminUser)
    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE, token, getAdminSessionCookieOptions())
    return response
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'No se pudo iniciar sesión' },
      { status: 400 }
    )
  }
}
