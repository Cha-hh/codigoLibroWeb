import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../../../lib/adminAuth'
import {
  deleteAdminPasswordHashByUsername,
  deleteAdminRoleByUsername,
  removeStoredAdminUsername
} from '../../../../../lib/adminStore'
import {
  getAdminAccounts,
  isSuperAdmin,
  normalizeUsername
} from '../../../../../lib/adminCredentials'

const getSession = () => {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifyAdminSessionToken(token)
}

export async function DELETE(_request, { params }) {
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

  const admins = await getAdminAccounts()
  const targetAdmin = admins.find((admin) => admin.username === username)

  if (!targetAdmin) {
    return NextResponse.json({ ok: false, error: 'Admin no encontrado' }, { status: 404 })
  }

  if (targetAdmin.source === 'env') {
    return NextResponse.json(
      { ok: false, error: 'Ese admin base no se puede eliminar desde el panel' },
      { status: 400 }
    )
  }

  if (session.sub === username) {
    return NextResponse.json(
      { ok: false, error: 'No puedes eliminar tu propia sesion admin' },
      { status: 400 }
    )
  }

  await removeStoredAdminUsername(username)
  await deleteAdminPasswordHashByUsername(username)
  await deleteAdminRoleByUsername(username)

  return NextResponse.json({
    ok: true,
    admins: await getAdminAccounts()
  })
}
