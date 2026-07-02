import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../../lib/adminAuth'

export async function GET() {
  const token = cookies().get(SESSION_COOKIE)?.value
  const session = verifyAdminSessionToken(token)

  if (!session) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  return NextResponse.json({
    ok: true,
    user: {
      username: session.sub,
      role: session.role || 'admin'
    }
  })
}
