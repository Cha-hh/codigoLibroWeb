import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../../lib/adminAuth'
import { getAdminPasswordHash, setAdminPasswordHash } from '../../../../lib/adminStore'

export async function POST(request) {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword } = await request.json()
    const envHash = process.env.ADMIN_PASSWORD_HASH
    let storedHash = await getAdminPasswordHash()

    if (!storedHash && envHash) {
      storedHash = envHash
      await setAdminPasswordHash(envHash)
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
    await setAdminPasswordHash(newHash)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: 'No se pudo cambiar la contraseña' },
      { status: 400 }
    )
  }
}
