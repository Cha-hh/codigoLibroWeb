import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../../lib/adminAuth'
import {
  addStoredAdminUsername,
  getAdminPasswordHash,
  getAdminPasswordHashByUsername,
  setAdminPasswordHash,
  setAdminPasswordHashByUsername
} from '../../../../lib/adminStore'
import { getConfiguredAdminCredential } from '../../../../lib/adminCredentials'

export async function POST(request) {
  const token = cookies().get(SESSION_COOKIE)?.value
  const session = verifyAdminSessionToken(token)
  if (!session) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword } = await request.json()
    const username = session.sub
    const configuredCredential = await getConfiguredAdminCredential(username)
    const envHash = configuredCredential?.passwordHash || ''
    let storedHash = await getAdminPasswordHashByUsername(username)

    if (!storedHash && envHash) {
      storedHash = envHash
      await addStoredAdminUsername(username)
      await setAdminPasswordHashByUsername(username, envHash)

      const legacyHash = await getAdminPasswordHash()
      if (!legacyHash) {
        await setAdminPasswordHash(envHash)
      }
    }

    if (!storedHash) {
      return NextResponse.json(
        { ok: false, error: 'Contraseña actual no configurada' },
        { status: 500 }
      )
    }

    const ok = await bcrypt.compare(currentPassword || '', storedHash)
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: 'Contraseña actual incorrecta' },
        { status: 401 }
      )
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await addStoredAdminUsername(username)
    await setAdminPasswordHashByUsername(username, newHash)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'No se pudo cambiar la contraseña' },
      { status: 400 }
    )
  }
}
