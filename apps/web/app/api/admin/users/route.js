import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../../lib/adminAuth'
import {
  addStoredAdminUsername,
  setAdminRoleByUsername,
  setAdminPasswordHashByUsername
} from '../../../../lib/adminStore'
import {
  getAdminAccounts,
  getConfiguredAdminCredential,
  isSuperAdmin,
  normalizeUsername
} from '../../../../lib/adminCredentials'

const getSession = () => {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifyAdminSessionToken(token)
}

export async function GET() {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }
  if (!isSuperAdmin(session.role)) {
    return NextResponse.json({ ok: false, error: 'Permisos insuficientes' }, { status: 403 })
  }

  const admins = await getAdminAccounts()
  return NextResponse.json({
    ok: true,
    currentUser: session.sub,
    admins
  })
}

export async function POST(request) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }
  if (!isSuperAdmin(session.role)) {
    return NextResponse.json({ ok: false, error: 'Permisos insuficientes' }, { status: 403 })
  }

  try {
    const { username, password, role } = await request.json()
    const normalizedUsername = normalizeUsername(username)
    const normalizedRole = role === 'superadmin' ? 'superadmin' : 'admin'

    if (!normalizedUsername) {
      return NextResponse.json(
        { ok: false, error: 'El usuario es requerido' },
        { status: 400 }
      )
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const existingCredential = await getConfiguredAdminCredential(normalizedUsername)
    if (existingCredential) {
      return NextResponse.json(
        { ok: false, error: 'Ese usuario ya existe' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await addStoredAdminUsername(normalizedUsername)
    await setAdminPasswordHashByUsername(normalizedUsername, passwordHash)
    await setAdminRoleByUsername(normalizedUsername, normalizedRole)

    const admins = await getAdminAccounts()
    return NextResponse.json({
      ok: true,
      currentUser: session.sub,
      admins
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudo crear el admin' },
      { status: 400 }
    )
  }
}
