import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../../../../lib/adminAuth'
import { setAdminPasswordHashByUsername } from '../../../../../../lib/adminStore'
import {
  getConfiguredAdminCredential,
  getAdminAccounts,
  isSuperAdmin,
  normalizeUsername
} from '../../../../../../lib/adminCredentials'

const getSession = () => {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifyAdminSessionToken(token)
}

export async function POST(request, { params }) {
  const session = getSession()
  if (!session) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }
  if (!isSuperAdmin(session.role)) {
    return NextResponse.json({ ok: false, error: 'Permisos insuficientes' }, { status: 403 })
  }

  const username = normalizeUsername(params?.username)
  if (!username) {
    return NextResponse.json({ ok: false, error: 'Usuario invalido' }, { status: 400 })
  }

  const credential = await getConfiguredAdminCredential(username)
  if (!credential) {
    return NextResponse.json({ ok: false, error: 'Admin no encontrado' }, { status: 404 })
  }

  try {
    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 12)
    await setAdminPasswordHashByUsername(username, passwordHash)

    return NextResponse.json({
      ok: true,
      admins: await getAdminAccounts()
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'No se pudo restablecer la contraseña' },
      { status: 400 }
    )
  }
}
