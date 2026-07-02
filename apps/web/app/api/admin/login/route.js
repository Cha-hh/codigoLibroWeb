import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import {
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  SESSION_COOKIE
} from '../../../../lib/adminAuth'
import {
  addStoredAdminUsername,
  getAdminPasswordHash,
  getAdminPasswordHashByUsername,
  setAdminPasswordHash,
  setAdminPasswordHashByUsername
} from '../../../../lib/adminStore'
import {
  getConfiguredAdminCredential,
  getConfiguredAdminUsernames,
  isSuperAdmin,
  normalizeUsername
} from '../../../../lib/adminCredentials'

export async function POST(request) {
  try {
    const { username, password } = await request.json()
    const normalizedUsername = normalizeUsername(username)
    const configuredCredential = await getConfiguredAdminCredential(normalizedUsername)

    if (!configuredCredential) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    let adminPasswordHash = await getAdminPasswordHashByUsername(normalizedUsername)
    adminPasswordHash =
      typeof adminPasswordHash === 'string' ? adminPasswordHash.trim() : ''
    const envPasswordHash = configuredCredential.passwordHash

    if ((await getConfiguredAdminUsernames()).length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales de admin no configuradas' },
        { status: 500 }
      )
    }

    if (!adminPasswordHash && envPasswordHash) {
      await addStoredAdminUsername(normalizedUsername)
      await setAdminPasswordHashByUsername(normalizedUsername, envPasswordHash)
      adminPasswordHash = envPasswordHash

      const legacyPasswordHash = await getAdminPasswordHash()
      if (!legacyPasswordHash) {
        await setAdminPasswordHash(envPasswordHash)
      }
    }

    if (!adminPasswordHash) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales de admin no configuradas' },
        { status: 500 }
      )
    }

    const isPasswordOk = await bcrypt.compare(password || '', adminPasswordHash)
    if (!isPasswordOk) {
      return NextResponse.json(
        { ok: false, error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    const token = createAdminSessionToken(
      normalizedUsername,
      isSuperAdmin(configuredCredential.role) ? 'superadmin' : 'admin'
    )
    const response = NextResponse.json({
      ok: true,
      user: {
        username: normalizedUsername,
        role: isSuperAdmin(configuredCredential.role) ? 'superadmin' : 'admin'
      }
    })
    response.cookies.set(SESSION_COOKIE, token, getAdminSessionCookieOptions())
    return response
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'No se pudo iniciar sesión' },
      { status: 400 }
    )
  }
}
