import fs from 'fs/promises'
import path from 'path'
import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SESSION_COOKIE, verifyAdminSessionToken } from '../../../../lib/adminAuth'

const FAQ_KEY = 'faq:items'
const FAQ_SEQ_KEY = 'faq:seq'

const loadFaqJson = async () => {
  const candidates = [
    path.join(process.cwd(), 'faq.json'),
    path.join(process.cwd(), '../../faq.json')
  ]

  for (const filePath of candidates) {
    try {
      const raw = await fs.readFile(filePath, 'utf8')
      const data = JSON.parse(raw)
      if (Array.isArray(data)) {
        return data
      }
    } catch {
      // try next candidate
    }
  }
  return null
}

export async function POST() {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!verifyAdminSessionToken(token)) {
    return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
  }

  const fileFaq = await loadFaqJson()
  if (!fileFaq) {
    return NextResponse.json(
      { ok: false, error: 'No se encontró faq.json para migrar' },
      { status: 404 }
    )
  }

  const existing = await kv.get(FAQ_KEY)
  const existingList = Array.isArray(existing) ? existing : []
  const existingIds = new Set(existingList.map((item) => item.id))

  const merged = [...existingList]
  for (const item of fileFaq) {
    if (item?.id && existingIds.has(item.id)) continue
    merged.push(item)
  }

  const maxId = merged.reduce((acc, item) => {
    const id = Number(item?.id || 0)
    return Number.isFinite(id) ? Math.max(acc, id) : acc
  }, 0)

  await kv.set(FAQ_KEY, merged)
  await kv.set(FAQ_SEQ_KEY, maxId)

  return NextResponse.json({
    ok: true,
    migrated: fileFaq.length,
    total: merged.length
  })
}
